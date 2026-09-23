import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from app.ai.interview_engine import (
    InterviewConfig,
    NextQuestion,
    decide_next_question,
    plan_interview,
)
from app.ai.llm.openai_client import LLMError
from app.models.interview import Interview
from app.models.interview_question import (
    InterviewQuestion,
    QuestionDifficulty,
    QuestionType,
)
from app.models.interview_session import InterviewSession, InterviewSessionStatus


def _get_owned_interview(
    db: Session, user_id: uuid.UUID, interview_id: uuid.UUID
) -> Interview:
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.created_by == user_id)
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


def _get_owned_session(
    db: Session, user_id: uuid.UUID, session_id: uuid.UUID
) -> InterviewSession:
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def _finish_session(session: InterviewSession, status: InterviewSessionStatus) -> None:
    now = datetime.now(timezone.utc)
    session.status = status
    session.completed_at = now
    if session.started_at:
        session.duration_seconds = int((now - session.started_at).total_seconds())


def _build_engine_config(interview: Interview) -> InterviewConfig:
    return InterviewConfig(
        role=interview.role,
        experience_level=interview.experience_level,
        interview_type=interview.interview_type.value,
        tech_stack=interview.tech_stack or [],
        job_description=interview.job_description,
        total_questions=interview.total_questions,
    )


def _to_question_row(
    session_id: uuid.UUID,
    order_index: int,
    question: NextQuestion,
    parent_question_id: Optional[uuid.UUID] = None,
) -> InterviewQuestion:
    return InterviewQuestion(
        session_id=session_id,
        parent_question_id=parent_question_id,
        question_text=question.question_text,
        question_type=(
            QuestionType.FOLLOWUP
            if question.is_followup
            else QuestionType(question.question_type)
        ),
        difficulty=QuestionDifficulty(question.difficulty),
        order_index=order_index,
        topic=question.topic,
        rubric=question.rubric.model_dump(),
    )


def _prepare_first_question(
    config: InterviewConfig, resume_data: dict
) -> Tuple[dict, NextQuestion]:
    try:
        state = plan_interview(config, resume_data)
        result = decide_next_question(config, state, [])
    except LLMError:
        raise HTTPException(
            status_code=502,
            detail="We couldn't prepare your interview right now. Please try again.",
        )
    return result.state.model_dump(), result.question


def start_session(
    db: Session, user_id: uuid.UUID, interview_id: uuid.UUID
) -> Tuple[InterviewSession, bool]:
    """Return the user's in-progress session for the interview, or create one.

    A new session gets its interview plan and first question from the AI engine.
    """
    interview = _get_owned_interview(db, user_id, interview_id)

    existing = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.interview_id == interview_id,
            InterviewSession.user_id == user_id,
            InterviewSession.status == InterviewSessionStatus.IN_PROGRESS,
        )
        .order_by(InterviewSession.created_at.desc())
        .first()
    )
    if existing and existing.questions:
        return get_session(db, user_id, existing.id), False

    config = _build_engine_config(interview)
    resume_data = (interview.resume.parsed_data if interview.resume else None) or {}
    existing_id = existing.id if existing else None
    db.commit()

    context_memory, first_question = _prepare_first_question(config, resume_data)

    session = db.get(InterviewSession, existing_id) if existing_id else None
    if session is None:
        session = InterviewSession(
            interview_id=interview_id,
            user_id=user_id,
            status=InterviewSessionStatus.IN_PROGRESS,
            started_at=datetime.now(timezone.utc),
        )
        db.add(session)
    session.context_memory = context_memory
    db.flush()

    db.add(_to_question_row(session.id, 1, first_question))
    db.commit()
    return get_session(db, user_id, session.id), existing_id is None


def get_session(
    db: Session, user_id: uuid.UUID, session_id: uuid.UUID
) -> InterviewSession:
    session = (
        db.query(InterviewSession)
        # Eager load questions and their responses to avoid N+1 queries
        # This fetches the session, all questions, and all responses in just 3 optimized queries
        .options(
            selectinload(InterviewSession.questions).selectinload(
                InterviewQuestion.response
            )
        )
        .filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def list_sessions(
    db: Session, user_id: uuid.UUID, interview_id: uuid.UUID
) -> List[InterviewSession]:
    _get_owned_interview(db, user_id, interview_id)
    return (
        db.query(InterviewSession)
        .filter(
            InterviewSession.interview_id == interview_id,
            InterviewSession.user_id == user_id,
        )
        .order_by(InterviewSession.created_at.desc())
        .all()
    )


def abandon_session(
    db: Session, user_id: uuid.UUID, session_id: uuid.UUID
) -> InterviewSession:
    session = _get_owned_session(db, user_id, session_id)
    if session.status != InterviewSessionStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=409, detail="Only an in-progress session can be abandoned"
        )

    _finish_session(session, InterviewSessionStatus.ABANDONED)
    db.commit()
    return get_session(db, user_id, session_id)
