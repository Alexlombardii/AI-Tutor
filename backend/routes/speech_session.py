from fastapi import APIRouter

import requests
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

@router.get("/speech_session")
async def create_session():
    response = requests.post(
        "https://api.openai.com/v1/realtime/sessions",
        headers={
            "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "model": "gpt-4o-realtime-preview-2025-06-03",
            "voice": "verse",
        },
    )
    return response.json()