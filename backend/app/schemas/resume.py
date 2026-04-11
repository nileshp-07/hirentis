import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class ProjectSchema(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)

class WorkExperienceSchema(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    description: Optional[str] = None

class EducationSchema(BaseModel):
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None

class ParsedData(BaseModel):
    skills: List[str] = Field(default_factory=list)
    experience_years: int = 0
    projects: List[ProjectSchema] = Field(default_factory=list)
    work_experience: Optional[List[WorkExperienceSchema]] = None
    education: Optional[List[EducationSchema]] = None
    summary: Optional[str] = None

class ResumeResponse(BaseModel):
    id: uuid.UUID
    title: str
    parsed_data: Optional[ParsedData] = None
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True