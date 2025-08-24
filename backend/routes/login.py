from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
async def login(form_data: ):
    return {"message": "Login successful"}