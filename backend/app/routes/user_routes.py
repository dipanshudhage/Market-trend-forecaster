from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import os
import shutil
from datetime import datetime
from app.utils.auth import get_current_user, get_password_hash, verify_password
from app.schemas.user import UserUpdate, PasswordUpdate
from app.database import users_collection

router = APIRouter()

@router.get("/profile")
async def read_users_me(current_user = Depends(get_current_user)):
    return {
        "id": str(current_user.get("_id")) if "_id" in current_user else current_user.get("id"),
        "username": current_user.get("username"),
        "email": current_user.get("email"),
        "full_name": current_user.get("full_name"),
        "avatar_url": current_user.get("avatar_url"),
        "banner_url": current_user.get("banner_url"),
        "joinedDate": "2024-01-15",
        "stats": {
            "forecasts": 128,
            "accuracy": "94.2%",
            "lastLogin": "2 hours ago"
        }
    }

@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    file_extension = file.filename.split(".")[-1]
    file_name = f"avatar_{current_user['_id']}_{int(datetime.now().timestamp())}.{file_extension}"
    file_path = f"app/static/uploads/{file_name}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    avatar_url = f"http://localhost:8000/static/uploads/{file_name}"
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"avatar_url": avatar_url}}
    )
    return {"avatar_url": avatar_url}

@router.post("/upload-banner")
async def upload_banner(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    file_extension = file.filename.split(".")[-1]
    file_name = f"banner_{current_user['_id']}_{int(datetime.now().timestamp())}.{file_extension}"
    file_path = f"app/static/uploads/{file_name}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    banner_url = f"http://localhost:8000/static/uploads/{file_name}"
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"banner_url": banner_url}}
    )
    return {"banner_url": banner_url}

@router.put("/profile")
async def update_user_profile(profile_update: UserUpdate, current_user = Depends(get_current_user)):
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    
    if "username" in update_data:
        existing_user = await users_collection.find_one({"username": update_data["username"]})
        if existing_user and str(existing_user["_id"]) != str(current_user["_id"]):
            raise HTTPException(status_code=400, detail="Username already taken")

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    return {"message": "Profile updated successfully"}

@router.put("/password")
async def update_user_password(password_update: PasswordUpdate, current_user = Depends(get_current_user)):
    if not verify_password(password_update.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    hashed_password = get_password_hash(password_update.new_password)
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": hashed_password}}
    )
    return {"message": "Password updated successfully"}