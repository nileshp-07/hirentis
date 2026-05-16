from pydantic import BaseModel
from app.models.interview import InterviewType
from typing import Optional, List
import uuid
from datetime import datetime


class InterviewBase(BaseModel):
    title: str
    role: str
    job_description: Optional[str] = None
    experience_level: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    interview_type: InterviewType = InterviewType.TECHNICAL
    total_questions: int = 5
    resume_id: Optional[uuid.UUID] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    title: Optional[str] = None
    role: Optional[str] = None
    job_description: Optional[str] = None
    experience_level: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    interview_type: Optional[InterviewType] = None
    total_questions: Optional[int] = None
    resume_id: Optional[uuid.UUID] = None


class InterviewResponse(InterviewBase):
    id: uuid.UUID
    created_by: uuid.UUID
    interview_overview: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
