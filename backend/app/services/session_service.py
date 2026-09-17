import uuid
from datetime import datetime, timezone
from typing import List, Tuple

from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from app.models.interview import Interview
from app.models.interview_question import InterviewQuestion
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


def start_session(
    db: Session, user_id: uuid.UUID, interview_id: uuid.UUID
) -> Tuple[InterviewSession, bool]:
    """Return the user's in-progress session for the interview, or create one."""
    _get_owned_interview(db, user_id, interview_id)

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
    if existing:
        return get_session(db, user_id, existing.id), False

    session = InterviewSession(
        interview_id=interview_id,
        user_id=user_id,
        status=InterviewSessionStatus.IN_PROGRESS,
        started_at=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()
    return get_session(db, user_id, session.id), True


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
