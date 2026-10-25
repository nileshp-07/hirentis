import uuid
import json
import logging
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.interview import Interview, InterviewType
from app.models.resume import Resume
from app.schemas.interview import InterviewCreate, InterviewUpdate
from app.services.profile_service import get_candidate_profile
from app.ai.interview_engine import CandidateProfile
from app.ai.interview_engine.context import _format_profile
from app.ai.llm.openai_client import LLMError, generate_structured
from app.ai.llm.output_schemas import InterviewOverview
from app.ai.llm.prompt_templates import (
    INTERVIEW_OVERVIEW_SYSTEM_PROMPT,
    INTERVIEW_OVERVIEW_USER_PROMPT,
)

logger = logging.getLogger(__name__)


def generate_overview(
    resume_data: dict,
    job_description: Optional[str],
    role: str,
    experience_level: Optional[str],
    tech_stack: Optional[List[str]],
    interview_type: InterviewType,
    total_questions: int,
    profile: Optional[CandidateProfile] = None,
) -> dict:
    exp_display = experience_level
    if experience_level and experience_level.isdigit():
        exp_display = f"{experience_level} Years"
    elif not experience_level:
        exp_display = "Not specified"

    messages = [
        {"role": "system", "content": INTERVIEW_OVERVIEW_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": INTERVIEW_OVERVIEW_USER_PROMPT.format(
                role=role,
                experience_level=exp_display,
                interview_type=InterviewType(interview_type).value,
                total_questions=total_questions,
                tech_stack=json.dumps(tech_stack) if tech_stack else "None",
                job_description=job_description or "None",
                resume_data=json.dumps(resume_data),
                profile=_format_profile(profile),
            ),
        },
    ]

    try:
        overview = generate_structured(messages, InterviewOverview)
    except LLMError:
        raise HTTPException(
            status_code=502,
            detail="We couldn't generate the interview overview right now. Please try again.",
        )
    return overview.model_dump()


def create_interview(
    db: Session,
    user_id: uuid.UUID,
    interview_in: InterviewCreate,
):
    resume = None
    if interview_in.resume_id:
        resume = (
            db.query(Resume)
            .filter(Resume.id == interview_in.resume_id, Resume.user_id == user_id)
            .first()
        )

    if not resume:
        resume = (
            db.query(Resume).filter(Resume.user_id == user_id, Resume.is_active).first()
        )

    if not resume:
        raise HTTPException(
            status_code=400, detail="Please upload an active resume first"
        )

    overview = generate_overview(
        resume_data=resume.parsed_data,
        job_description=interview_in.job_description,
        role=interview_in.role,
        experience_level=interview_in.experience_level,
        tech_stack=interview_in.tech_stack,
        interview_type=interview_in.interview_type,
        total_questions=interview_in.total_questions,
        profile=get_candidate_profile(db, user_id),
    )

    new_interview = Interview(
        **interview_in.model_dump(exclude={"resume_id"}),
        created_by=user_id,
        resume_id=resume.id,
        interview_overview=overview,
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    return new_interview


def get_interviews(db: Session, user_id: uuid.UUID):
    return (
        db.query(Interview)
        .filter(Interview.created_by == user_id)
        .order_by(Interview.created_at.desc())
        .all()
    )


def get_interview(db: Session, user_id: uuid.UUID, interview_id: uuid.UUID):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.created_by == user_id)
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


def update_interview(
    db: Session,
    user_id: uuid.UUID,
    interview_id: uuid.UUID,
    interview_in: InterviewUpdate,
):
    db_interview = get_interview(db, user_id, interview_id)
    update_data = interview_in.model_dump(exclude_unset=True)

    ai_triggered_fields = {
        "job_description",
        "role",
        "experience_level",
        "tech_stack",
        "interview_type",
        "resume_id",
    }

    need_regeneration = any(
        field in update_data and update_data[field] != getattr(db_interview, field)
        for field in ai_triggered_fields
    )

    if "resume_id" in update_data:
        new_resume = (
            db.query(Resume)
            .filter(Resume.id == update_data["resume_id"], Resume.user_id == user_id)
            .first()
        )
        if not new_resume:
            raise HTTPException(
                status_code=400, detail="Invalid or unauthorized resume ID"
            )

    new_overview = None
    if need_regeneration:
        current_resume_id = update_data.get("resume_id", db_interview.resume_id)
        resume = db.query(Resume).filter(Resume.id == current_resume_id).first()

        if resume and resume.parsed_data:
            new_overview = generate_overview(
                resume_data=resume.parsed_data,
                job_description=update_data.get(
                    "job_description", db_interview.job_description
                ),
                role=update_data.get("role", db_interview.role),
                experience_level=update_data.get(
                    "experience_level", db_interview.experience_level
                ),
                tech_stack=update_data.get("tech_stack", db_interview.tech_stack),
                interview_type=update_data.get(
                    "interview_type", db_interview.interview_type
                ),
                total_questions=update_data.get(
                    "total_questions", db_interview.total_questions
                ),
                profile=get_candidate_profile(db, user_id),
            )

    for field, value in update_data.items():
        setattr(db_interview, field, value)

    if new_overview:
        db_interview.interview_overview = new_overview

    db.commit()
    db.refresh(db_interview)
    return db_interview


def delete_interview(db: Session, user_id: uuid.UUID, interview_id: uuid.UUID):
    db_interview = get_interview(db, user_id, interview_id)
    db.delete(db_interview)
    db.commit()
    return True
