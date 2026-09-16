"""Pydantic models the LLM must fill via Structured Outputs.

Every field is required (Structured Outputs strict mode); use an empty list or
empty string when the source has no value.
"""

from typing import List

from pydantic import BaseModel, Field


class ResumeProject(BaseModel):
    title: str
    tech_stack: List[str] = Field(description="Technologies used in the project")
    description: str = Field(description="Brief description of the work done")


class ResumeWorkExperience(BaseModel):
    company: str
    role: str
    duration: str
    description: str = Field(description="Brief description of responsibilities")


class ResumeEducation(BaseModel):
    degree: str
    institution: str
    duration: str
    description: str


class ParsedResume(BaseModel):
    is_resume: bool = Field(
        description="False if the text is not a professional resume "
        "(random text, a generic document, a book, etc.)"
    )
    skills: List[str] = Field(description="Technical and soft skills")
    experience_years: int = Field(
        description="Total years of professional experience, rounded down"
    )
    projects: List[ResumeProject]
    work_experience: List[ResumeWorkExperience]
    education: List[ResumeEducation]
    summary: str = Field(
        description="Brief summary of the candidate's professional background"
    )


class ResumeHighlights(BaseModel):
    resume_name: str
    experience_summary: str
    skills: List[str]


class InterviewOverview(BaseModel):
    overview_title: str
    summary: str = Field(description="Summary of what the interview will focus on")
    estimated_duration: str = Field(description='Human readable, e.g. "45 mins"')
    focus_areas: List[str]
    requirements: List[str]
    culture_fit: List[str]
    preparation_tips: List[str] = Field(
        description="3-5 concrete tips for preparing for this interview"
    )
    resume_highlights: ResumeHighlights
