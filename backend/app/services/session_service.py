import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.ai.interview_engine import (
    CandidateProfile,
    InterviewConfig,
    NextQuestion,
    decide_next_question,
    plan_interview,
    AskedQuestion,
    EngineState,
)
from app.ai.llm.openai_client import LLMError
from app.ai.llm.tracing import trace_owner
from app.models.interview import Interview
from app.models.interview_question import (
    InterviewQuestion,
    QuestionDifficulty,
    QuestionType,
)
from app.models.interview_response import InterviewResponse
from app.models.interview_session import InterviewSession, InterviewSessionStatus
from app.models.response_evaluation import ResponseEvaluation
from app.schemas.session import AnswerSubmit, SessionAttempt, SessionSummary
from app.services.profile_service import get_candidate_profile


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
    config: InterviewConfig,
    resume_data: dict,
    profile: Optional[CandidateProfile],
) -> Tuple[dict, NextQuestion]:
    try:
        state = plan_interview(config, resume_data, profile)
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
    profile = get_candidate_profile(db, user_id)
    existing_id = existing.id if existing else None
    session_id = existing_id or uuid.uuid4()
    db.commit()

    with trace_owner(user_id=user_id, session_id=session_id):
        context_memory, first_question = _prepare_first_question(
            config, resume_data, profile
        )

    session = db.get(InterviewSession, existing_id) if existing_id else None
    if session is None:
        session = InterviewSession(
            id=session_id,
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


def get_question(
    db: Session, user_id: uuid.UUID, session_id: uuid.UUID, question_id: uuid.UUID
) -> InterviewQuestion:
    session = get_session(db, user_id, session_id)
    question = next((q for q in session.questions if q.id == question_id), None)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


def list_sessions(
    db: Session, user_id: uuid.UUID, interview_id: uuid.UUID
) -> List[InterviewSession]:
    _get_owned_interview(db, user_id, interview_id)
    return (
        _attempts_query(db, user_id)
        .filter(InterviewSession.interview_id == interview_id)
        .all()
    )


def list_user_sessions(db: Session, user_id: uuid.UUID) -> List[InterviewSession]:
    """Every attempt of the user across all interviews, newest first."""
    return _attempts_query(db, user_id).all()


def _attempts_query(db: Session, user_id: uuid.UUID):
    """The user's sessions with what an attempt row needs, newest first."""
    return (
        db.query(InterviewSession)
        .options(
            selectinload(InterviewSession.questions).selectinload(
                InterviewQuestion.response
            ),
            selectinload(InterviewSession.report),
        )
        .filter(InterviewSession.user_id == user_id)
        .order_by(InterviewSession.created_at.desc())
    )


def to_attempt(session: InterviewSession) -> SessionAttempt:
    report = session.report
    return SessionAttempt(
        **SessionSummary.model_validate(session).model_dump(),
        answered_count=sum(1 for question in session.questions if question.response),
        overall_score=report.overall_score if report else None,
        report_status=report.status if report else None,
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


def _build_history(
    questions: List[InterviewQuestion], latest_answer: str
) -> List[AskedQuestion]:
    """All asked questions for the engine, with the new answer on the latest one."""
    history = [
        AskedQuestion(
            question_text=q.question_text,
            topic=q.topic,
            difficulty=q.difficulty.value,
            is_followup=q.question_type == QuestionType.FOLLOWUP,
            answer_text=q.response.response_text if q.response else None,
            key_points=(q.rubric or {}).get("key_points", []),
        )
        for q in questions
    ]
    history[-1].answer_text = latest_answer
    return history


def submit_answer(
    db: Session,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    question_id: uuid.UUID,
    answer: AnswerSubmit,
) -> InterviewSession:
    """Save the answer and the next question together, or finish the interview."""
    session = get_session(db, user_id, session_id)
    if session.status != InterviewSessionStatus.IN_PROGRESS:
        raise HTTPException(status_code=409, detail="This interview is not in progress")

    question = next((q for q in session.questions if q.id == question_id), None)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    if question.response is not None:
        raise HTTPException(
            status_code=409, detail="This question has already been answered"
        )
    if question is not session.questions[-1]:
        raise HTTPException(
            status_code=409, detail="Only the current question can be answered"
        )

    config = _build_engine_config(session.interview)
    state = EngineState.model_validate(session.context_memory)
    history = _build_history(session.questions, answer.response_text)
    next_order_index = question.order_index + 1
    db.commit()

    try:
        with trace_owner(user_id=user_id, session_id=session_id):
            result = decide_next_question(config, state, history)
    except LLMError:
        raise HTTPException(
            status_code=502,
            detail="We couldn't get the next question right now. "
            "Please submit your answer again.",
        )

    session = db.get(InterviewSession, session_id)
    if session.status != InterviewSessionStatus.IN_PROGRESS:
        raise HTTPException(status_code=409, detail="This interview is not in progress")

    db.add(
        InterviewResponse(
            question_id=question_id,
            response_text=answer.response_text,
            response_time_seconds=answer.response_time_seconds,
            evaluation=ResponseEvaluation(),
        )
    )
    session.context_memory = result.state.model_dump()

    if result.question is not None:
        db.add(
            _to_question_row(
                session_id,
                next_order_index,
                result.question,
                parent_question_id=question_id if result.question.is_followup else None,
            )
        )
    else:
        _finish_session(session, InterviewSessionStatus.COMPLETED)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="This question has already been answered"
        )
    return get_session(db, user_id, session_id)
