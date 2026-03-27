from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user
from app.database import raw_data_collection

router = APIRouter()

@router.post("/raw_data")
async def insert_raw_data(data: dict, current_user = Depends(get_current_user)):
    result = await raw_data_collection.insert_one(data)
    return {"inserted_id": str(result.inserted_id)}
