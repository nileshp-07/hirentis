import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.interview_report import ReportStatus
from app.models.interview_session import InterviewSessionStatus
from app.models.user import User
from app.schemas.session import AnswerSubmit, ReportOut, SessionDetail
from app.services import evaluation_service, report_service, session_service

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
    session = session_service.abandon_session(db, current_user.id, session_id)
    if any(question.response for question in session.questions):
        report_service.request_report(db, session.id)
    return session


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
    session = session_service.submit_answer(
        db, current_user.id, session_id, question_id, answer
    )
    evaluation_service.enqueue_session_evaluations(db, session.id)
    if session.status == InterviewSessionStatus.COMPLETED:
        report_service.request_report(db, session.id)
    return session


@router.get("/{session_id}/report", response_model=ReportOut)
def get_report(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session, report = report_service.get_report(db, current_user.id, session_id)
    if report is None or report.status == ReportStatus.FAILED:
        report_service.request_report(db, session_id)
        session, report = report_service.get_report(db, current_user.id, session_id)
    return report_service.to_report_payload(session, report)
