import uuid
import logging
from fastapi import HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.utils.file_parser import extract_text_from_upload
from app.ai.llm.openai_client import LLMError, generate_structured
from app.ai.llm.tracing import trace_owner
from app.ai.llm.output_schemas import ParsedResume
from app.ai.llm.prompt_templates import (
    RESUME_PARSING_SYSTEM_PROMPT,
    RESUME_PARSING_USER_PROMPT,
)

logger = logging.getLogger(__name__)


def parse_resume_content(text: str) -> ParsedResume:
    messages = [
        {"role": "system", "content": RESUME_PARSING_SYSTEM_PROMPT},
        {"role": "user", "content": RESUME_PARSING_USER_PROMPT.format(text=text)},
    ]
    return generate_structured(messages, ParsedResume)


def process_resume_upload(db: Session, user_id: uuid.UUID, file):
    text = extract_text_from_upload(file)

    try:
        with trace_owner(user_id=user_id):
            parsed = parse_resume_content(text)
    except LLMError:
        raise HTTPException(
            status_code=502,
            detail="We couldn't analyze your resume right now. Please try again.",
        )

    if not parsed.is_resume:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file does not appear to be a professional resume. Please upload a valid resume.",
        )
    parsed_json = parsed.model_dump(exclude={"is_resume"})

    db.query(Resume).filter(
        Resume.user_id == user_id, Resume.is_active.is_(True)
    ).update({"is_active": False})

    new_resume = Resume(
        user_id=user_id,
        title=file.filename,
        raw_text=text,
        parsed_data=parsed_json,
        is_active=True,
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume


def get_user_resumes(user_id: uuid.UUID, db: Session):
    return (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .all()
    )


def get_user_resume(
    db: Session, resume_id: uuid.UUID, user_id: uuid.UUID
) -> Optional["Resume"]:
    return (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == user_id,
        )
        .first()
    )


def delete_resume(db: Session, resume_id: uuid.UUID, user_id: uuid.UUID):
    resume = get_user_resume(db, resume_id, user_id)

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    db.delete(resume)
    db.commit()
    return True


def set_active_resume(db: Session, resume_id: uuid.UUID, user_id: uuid.UUID):
    resume = get_user_resume(db, resume_id, user_id)

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # deactivate all active resumes for user (single query)
    db.query(Resume).filter(
        Resume.user_id == user_id,
        Resume.is_active.is_(True),
    ).update(
        {Resume.is_active: False},
        synchronize_session=False,
    )

    resume.is_active = True
    db.commit()
    return True
