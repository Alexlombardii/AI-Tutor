from openai import OpenAI

from fastapi import APIRouter

import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatMessage(BaseModel):
    message: str

@router.post("/chat")
async def chat(user_message: ChatMessage):
    response = client.responses.create(
    model="gpt-5",
    input= user_message.message,
)
    return {"response": response.output_text}