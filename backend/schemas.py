from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class AnalysisRequest(BaseModel):
    """Schema for the request to analyze content"""

    content: str
    content_type: str  # "email", "sms", "url"


class AnalysisResponse(BaseModel):
    """Schema for the response from an analysis"""

    id: int
    content_type: str
    risk_level: str
    risk_percentage: int
    ml_confidence: Optional[float] = None
    created_at: datetime

    class Config:
        orm_mode = True
