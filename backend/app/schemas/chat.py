from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = "sentiment_dashboard"

class ChatResponse(BaseModel):
    success: bool
    reply: str