from fastapi import APIRouter, Request
from openai import OpenAI
from tutor_agents.tutor.prompt import supervisor_agent_instructions
from tutor_agents.tutor.tools import tutorAgentTools, get_tool_response
from tutor_agents.state_agent.tools import analyze_session_state, state as session_state

import os
from datetime import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import json
import pprint

from tutor_agents.state_agent.tools import analyze_session_state, state as session_state

load_dotenv()

router = APIRouter()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ConversationContext(BaseModel):
    relevantContextFromLastUserMessage: str  
    conversationHistory: List[dict]

@router.post("/tutor-supervisor")
async def tutor_supervisor(context: ConversationContext):

    clean_conversation = clean_convo(context)

    # cleaned convo -> state agent -> state and next steps for the supervisor
    conversation_json = json.dumps(clean_conversation)
    current_state_json = json.dumps(session_state)

    # Build the supervisor prompt
    first_analysis = analyze_session_state(conversation_json, current_state_json)
    session_state.update(first_analysis.updated_state.dict())   # keep global state
    system_state_blob = "[stateAgent] session analysis\n" + json.dumps(first_analysis.dict(), indent=2)

    body = {
        "model": "gpt-4.1",
        "input": [
            { "type": "message", "role": "system", "content": supervisor_agent_instructions },
            { "type": "message", "role": "system", "content": system_state_blob },
            {
                "type": "message",
                "role": "user",
                "content": (
                    "==== Conversation History ====\n"
                    f"{json.dumps(clean_conversation, indent=2)}\n\n"
                    "==== Relevant Context From Last User Message ===\n"
                    f"{context.relevantContextFromLastUserMessage}"
                )
            },
        ],
        "tools": tutorAgentTools,
    }

    pretty_print_body("INITIAL SUPERVISOR REQUEST BODY", body)

    breadcrumbs = [create_breadcrumb("[stateAgent] session analysis", first_analysis.dict())]

    initial_response = await text_output(openai, body)
    final_text = await handle_tool_calls(openai, body, initial_response, breadcrumbs)

    return {
        "output_text": final_text,
        "breadcrumbs": breadcrumbs,
    }

def parse_high_signal_content(text: str):
    """
    Parse high-signal content from the supervisor response.
    Looks for [HIGH_SIGNAL_CONTENT] section and extracts the markdown content.
    """
    if '[HIGH_SIGNAL_CONTENT]' not in text:
        return text, None
    
    parts = text.split('[HIGH_SIGNAL_CONTENT]')
    clean_text = parts[0].strip()
    
    if len(parts) > 1:
        high_signal_content = parts[1].strip()
        return clean_text, high_signal_content
    
    return clean_text, None

async def text_output(openai, body):
    try:
        response = openai.responses.create(**body)

        return {
            "output": response.output,
            "output_text": response.output_text
        }
    except Exception as e:
        print(f"❌ TEXT ERROR: {e}")
        return {"error": str(e)}

def create_breadcrumb(title: str, data: any = None):
    """Create a breadcrumb entry with timestamp"""
    return {
        "title": title,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }

async def handle_tool_calls(openai, body, initial_response, breadcrumbs):
    """
    Iteratively handles function calls returned by the OpenAI API until
    the supervisor produces a final textual answer. Returns that answer as a string.
    """
    current_response = initial_response
    
    while True:
        # Check for errors
        if current_response.get('error'):
            return "Something went wrong."

        # Get output items - current_response is a dict
        output_items = current_response.get('output', [])
        
        # Gather all function calls in the output
        function_calls = [item for item in output_items if getattr(item, 'type', None) == 'function_call']
        
        if len(function_calls) == 0:
            # No more function calls – build and return the assistant's final message
            assistant_messages = [item for item in output_items if getattr(item, 'type', None) == 'message']
            
            final_text_parts = []
            for msg in assistant_messages:
                content_arr = getattr(msg, 'content', [])
                for content in content_arr:
                    if getattr(content, 'type', None) == 'output_text':
                        final_text_parts.append(getattr(content, 'text', ''))
            
            final_text = '\n'.join(final_text_parts)
            return final_text
        
        # Execute each function call and add results to the conversation
        for tool_call in function_calls:
            f_name = getattr(tool_call, 'name', '')
            args_str = getattr(tool_call, 'arguments', '{}')
            call_id = getattr(tool_call, 'call_id', '')
            
            try:
                args = json.loads(args_str)
            except json.JSONDecodeError:
                args = {}
            
            # Add breadcrumb for tool call
            breadcrumbs.append(create_breadcrumb(
                f"[supervisorAgent] function call: {f_name}",
                args
            ))
            
            # Execute tool locally
            tool_result = get_tool_response(f_name, args)
            
            # Add breadcrumb for tool result
            breadcrumbs.append(create_breadcrumb(
                f"[supervisorAgent] function call result: {f_name}",
                tool_result
            ))
            
            # Add function call and result to the request body
            body['input'].extend([
                {
                    'type': 'function_call',
                    'call_id': call_id,
                    'name': f_name,
                    'arguments': args_str,
                },
                {
                    'type': 'function_call_output',
                    'call_id': call_id,
                    'output': json.dumps(tool_result),
                }
            ])
            
        current_response = await text_output(openai, body)

    # After the while loop ends, return the final text
    return current_response.get("output_text", "")

def pretty_print_body(label: str, body_obj: dict):
    """Utility for readable JSON debugging in terminal."""
    print(f"\n🔧 {label}")
    print(json.dumps(body_obj, indent=2, default=str))
    print("═" * 60)

def clean_convo(context: ConversationContext):
    
    clean_conversation = [
        {
            "role": msg["role"],
            "content": msg["content"][0]["transcript"]
        }
        for msg in context.conversationHistory
        if msg.get("content") and msg["status"] in ("completed", "in_progress")
    ]

    return clean_conversation
