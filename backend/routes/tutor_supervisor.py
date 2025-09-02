from fastapi import APIRouter, Request
from openai import OpenAI
from tutor_agents.tutor.prompt import tutor_agent_instructions
from tutor_agents.tutor.tools import tutorAgentTools, get_tool_response
from tutor_agents.state_agent.tools import analyze_session_state, state as session_state

import os
from datetime import datetime
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import json

from tutor_agents.state_agent.tools import analyze_session_state, state as session_state

load_dotenv()

router = APIRouter()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ConversationContext(BaseModel):
    relevantContextFromLastUserMessage: str  
    conversationHistory: List[dict]

@router.post("/tutor-supervisor")
async def tutor_supervisor(context: ConversationContext):  
    
    # Create clean conversation history for agents
    clean_conversation = []
    for msg in context.conversationHistory:
        content = msg.get('content', [])
        if content and (msg.get('status') == 'completed' or msg.get('status') == 'in_progress'):  
            clean_conversation.append({
                "role": msg.get('role'),
                "content": content[0].get('transcript', '')
            })
    
    print(f"🔍 CLEAN CONVERSATION ({len(clean_conversation)} messages):")
    for i, msg in enumerate(clean_conversation):
        print(f"  {i+1}. {msg['role']}: {msg['content']}")
    print("=" * 60)
    
    # Get current state as formatted JSON
    current_state_json = json.dumps(session_state, indent=2)
    
    content = f"""==== Conversation History ====
{json.dumps(clean_conversation, indent=2)}

==== Relevant Context From Last User Message ===
{context.relevantContextFromLastUserMessage}

==== CURRENT SESSION STATE ====
{current_state_json}

Based on the current state above, guide the junior tutor on what to focus on next to progress through the learning phases."""

    body = {
        "model": "gpt-4.1",
        "input": [
            {
                "type": "message",
                "role": "system",
                "content": tutor_agent_instructions,
            },
            {
                "type": "message",
                "role": "user",
                "content": content,
            },
        ],
        "tools": tutorAgentTools,
    }

    breadcrumbs = []  # Collect breadcrumbs during processing
    initial_response = await text_output(openai, body)
    raw_text = await handle_tool_calls(openai, body, initial_response, breadcrumbs, clean_conversation)
    
    # Parse high-signal content from the response
    clean_text, high_signal_content = parse_high_signal_content(raw_text)
    
    return {
        "output_text": clean_text,
        "breadcrumbs": breadcrumbs,
        "high_signal_content": high_signal_content
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

async def handle_tool_calls(openai, body, initial_response, breadcrumbs, clean_conversation):
    """
    Iteratively handles function calls returned by the OpenAI API until
    the supervisor produces a final textual answer. Returns that answer as a string.
    """
    current_response = initial_response
    
    while True:
        # Check for errors - current_response is a dict
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
        
        # Use the actual conversation history from the request
        conversation_history = json.dumps(clean_conversation)
        current_state = json.dumps(session_state)

        state_analysis = analyze_session_state(conversation_history, current_state)
        
        # Update global state with analysis results
        session_state.update(state_analysis.updated_state.dict())
        
        # Add state guidance to breadcrumbs
        breadcrumbs.append(create_breadcrumb(
            "[stateAgent] session analysis", 
            state_analysis.dict()
        ))
        
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