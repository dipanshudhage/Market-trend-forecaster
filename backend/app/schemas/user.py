from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    password: str

class UserOut(BaseModel):
    id: Optional[str] = None
    username: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    username: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str