from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

class RawData(BaseModel):
    id: Optional[str] = None
    content: str
    sentiment: Optional[str] = None
    # Add more fields as needed

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
