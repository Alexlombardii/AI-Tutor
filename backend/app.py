from fastapi import FastAPI
from fastapi.routing import APIRouter
from fastapi.middleware.cors import CORSMiddleware

from routes import tutor_supervisor, speech_session, scanner

from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

api_router = APIRouter()

api_router.include_router(tutor_supervisor.router, prefix="/api/v1")
api_router.include_router(speech_session.router, prefix="/api/v1")
api_router.include_router(scanner.router, prefix="/api/v1")
app.include_router(api_router)
origins = [
    "http://localhost:3000",  # React frontend
    "http://127.0.0.1:3000", # Alternative localhost
    f"{os.getenv('FRONTEND_URL')}",
]
 
print(f"Final origins list: {origins}")

app.add_middleware( 
    CORSMiddleware,
    allow_origins=origins,  # Allow from the origins list above -- for dev rn
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
async def main():
    return {"message": "Yo Yo Yo"}

@app.get("/test")
async def test():
    return {"message": "Test"}