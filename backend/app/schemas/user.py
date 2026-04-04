from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    password: str

    @field_validator("username", "email")
    @classmethod
    def trim_whitespace(cls, v: str) -> str:
        return v.strip()

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v

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

    @field_validator("username")
    @classmethod
    def trim_username(cls, v: str) -> str:
        return v.strip()

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
