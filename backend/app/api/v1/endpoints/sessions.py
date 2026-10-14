import logging
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.ai.tts import TTSUnavailable, synthesize_speech
from app.api.deps import get_current_user, get_db
from app.models.interview_report import ReportStatus
from app.models.interview_session import InterviewSessionStatus
from app.models.user import User
from app.schemas.session import AnswerSubmit, ReportOut, SessionAttempt, SessionDetail
from app.services import evaluation_service, report_service, session_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[SessionAttempt])
def list_my_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = session_service.list_user_sessions(db, current_user.id)
    return [session_service.to_attempt(session) for session in sessions]


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


@router.get("/{session_id}/questions/{question_id}/speech")
def question_speech(
    session_id: uuid.UUID,
    question_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """The question read aloud in the interviewer's voice, as a WAV file."""
    question = session_service.get_question(
        db, current_user.id, session_id, question_id
    )
    text = question.question_text
    db.commit()
    try:
        audio = synthesize_speech(text)
    except TTSUnavailable as e:
        logger.warning(str(e))
        raise HTTPException(status_code=503, detail="Interviewer voice unavailable")
    except Exception as e:
        logger.error(f"Speech synthesis failed for question {question_id}: {e}")
        raise HTTPException(status_code=503, detail="Interviewer voice unavailable")
    return Response(
        content=audio,
        media_type="audio/wav",
        headers={"Cache-Control": "private, max-age=86400"},
    )


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
    needs_report = (
        report is None
        or report.status == ReportStatus.FAILED
        or report_service.is_stalled(session)
    )
    if needs_report and report_service.is_reportable(session):
        evaluation_service.enqueue_session_evaluations(db, session.id)
        report_service.request_report(db, session_id)
        session, report = report_service.get_report(db, current_user.id, session_id)
    return report_service.to_report_payload(session, report)
