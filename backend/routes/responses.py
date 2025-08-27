from openai import OpenAI

from fastapi import APIRouter, Request

import os
from dotenv import load_dotenv
from pydantic import BaseModel


load_dotenv()
router = APIRouter()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/responses")
async def response(req: Request):
    body = await req.json()
    
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


# {
#   "output": [                    // <- This is the array the frontend expects
#     {
#       "type": "message",
#       "role": "assistant", 
#       "content": [
#         {
#           "type": "output_text",
#           "text": "Let me check that for you."
#         }
#       ]
#     },
#     {
#       "type": "function_call",     
#       "name": "getUserAccountInfo",
#       "arguments": "{\"phone_number\": \"206-135-1246\"}"
#     }
#   ],
#   "output_text": "Final response text here"
# }