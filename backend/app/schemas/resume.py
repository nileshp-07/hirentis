import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ParsedData(BaseModel):
    skills: List[str]
    experience_years: int 
    projects: List[dict] 
    work_experience: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    summary: Optional[str] = None

class ResumeResponse(BaseModel):
    id: uuid.UUID
    title: str
    parsed_data: Optional[ParsedData] = None
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True