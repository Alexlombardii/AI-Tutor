# backend/routes/scan.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from starlette.websockets import WebSocket
from openai import OpenAI
import base64, json, os, time
from routes.tutor_supervisor import tutor_supervisor, ConversationContext
import requests

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


PROMPT = """
You are an expert maths tutor.
Analyse the student's handwritten workings in the image.
Ignore any parts that are crossed out or scribbled over.
Return ONLY valid JSON with this exact schema:

{
  "worked_example": {
    "step_1": "string",
    "step_2": "string",
    .
    .
    .
    "step_n": "string"
  }
}


Use plain text (no markdown). Many short and concise steps > few long and too much information in one go steps. 
Do not add keys or commentary, and try capture all their workings.
"""

def extract_workings_with_gpt4o(img_bytes: bytes) -> dict:
    b64 = base64.b64encode(img_bytes).decode()
    messages = [
        { "role": "system", "content": PROMPT },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": { "url": f"data:image/jpeg;base64,{b64}" },
                }
            ],
        },
    ]
    res = client.chat.completions.create(
        model="gpt-4o-mini",  # swap to gpt-4o for max quality
        messages=messages,
        temperature=0,
        max_tokens=800,
    )
    return json.loads(res.choices[0].message.content)

router = APIRouter()

@router.post("/scanner")
async def scan(file: UploadFile = File(...), practice_question_id: str = Form(...)):
    print(practice_question_id)
    
    student_workings = extract_workings_with_gpt4o(await file.read())
    print(json.dumps(student_workings, indent=2))
    
    return student_workings
 