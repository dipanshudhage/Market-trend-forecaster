from pydantic import BaseModel
from typing import Optional

class ReportRequest(BaseModel):
    type: str  # "summary" | "trend" | "alerts" | "topics"
    format: str  # "pdf" | "xlsx"
    brand: Optional[str] = "all"
    channel: Optional[str] = "all"
    fromDate: Optional[str] = ""
    toDate: Optional[str] = ""
