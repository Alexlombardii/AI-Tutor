from fastapi import APIRouter
from fastapi import Request

from openai import OpenAI
from agents.tutor.prompt import tutorAgentInstructions
from agents.tutor.tools import tutorAgentTools

import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import json

load_dotenv()

router = APIRouter()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ConversationContext(BaseModel):
    relevantContext: str
    conversationHistory: List[dict]

@router.post("/tutor-supervisor")
async def tutor_supervisor(req: Request):  # Use raw Request instead of Pydantic
    body = await req.json()
    print("🔍 RECEIVED DATA:", body)  # Debug what we actually get
    print("🔍 CONVERSATION HISTORY TYPE:", type(body.get('conversationHistory')))
    
    # Continue with your logic...
    relevantContext = body.get('relevantContextFromLastUserMessage', '')
    conversationHistory = body.get('conversationHistory', [])

    content = f"""==== Conversation History ====
{json.dumps(conversationHistory, indent=2)}

==== Relevant Context From Last User Message ===
{relevantContext}"""

    body = {
        "model": "gpt-4.1",
        "input": [
            {
                "type": "message",
                "role": "system",
                "content": tutorAgentInstructions,
            },
            {
                "type": "message",
                "role": "user",
                "content": content,
            },
        ],
        "tools": tutorAgentTools,
    }

    return await text_output(openai, body)

async def text_output(openai, body):
    try:
        print("🔍 REQUEST RECEIVED -- Text")
        response = openai.responses.create(**body)
        
        # Return the full response object, not just output_text
        return {
            "output": response.output,
            "output_text": response.output_text
        }
    except Exception as e:
        print(f"❌ TEXT ERROR: {e}")
        return {"error": str(e)}