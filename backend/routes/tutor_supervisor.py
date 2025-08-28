from fastapi import APIRouter, Request
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
    relevantContextFromLastUserMessage: str  
    conversationHistory: List[dict]

@router.post("/tutor-supervisor")
async def tutor_supervisor(context: ConversationContext):  
    
    content = f"""==== Conversation History ====
{json.dumps(context.conversationHistory, indent=2)}

==== Relevant Context From Last User Message ===
{context.relevantContextFromLastUserMessage}"""

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
        
        return {
            "output": response.output,
            "output_text": response.output_text
        }
    except Exception as e:
        print(f"❌ TEXT ERROR: {e}")
        return {"error": str(e)}