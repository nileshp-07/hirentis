import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.session import AnswerSubmit, SessionDetail
from app.services import session_service

router = APIRouter()


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return session_service.get_session(db, current_user.id, session_id)


@router.post("/{session_id}/abandon", response_model=SessionDetail)
def abandon_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return session_service.abandon_session(db, current_user.id, session_id)


@router.post(
    "/{session_id}/questions/{question_id}/answer", response_model=SessionDetail
)
def submit_answer(
    session_id: uuid.UUID,
    question_id: uuid.UUID,
    answer: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return session_service.submit_answer(
        db, current_user.id, session_id, question_id, answer
    )
