from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

class User(BaseModel):
    id: Optional[str] = None
    username: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    hashed_password: str

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}