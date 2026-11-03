import logging
import uuid
from typing import List

from sqlalchemy.orm import Session, joinedload

from app.ai.interview_engine import AnswerEvaluation, evaluate_answer
from app.ai.llm.tracing import trace_owner
from app.db.session import SessionLocal
from app.models.interview_question import InterviewQuestion
from app.models.interview_response import InterviewResponse
from app.models.interview_session import InterviewSession
from app.models.response_evaluation import EvaluationStatus, ResponseEvaluation
from app.services.session_service import _build_engine_config

logger = logging.getLogger(__name__)

MIN_SCORE, MAX_SCORE = 0.0, 10.0


def _clamp(value: float) -> float:
    """Keep LLM scores inside the 0-10 range the database enforces."""
    return round(min(MAX_SCORE, max(MIN_SCORE, float(value))), 1)


def _apply(evaluation: ResponseEvaluation, scored: AnswerEvaluation) -> None:
    evaluation.score = _clamp(scored.score)
    evaluation.technical_score = _clamp(scored.technical_score)
    evaluation.communication_score = _clamp(scored.communication_score)
    evaluation.problem_solving_score = _clamp(scored.problem_solving_score)
    evaluation.confidence_score = _clamp(scored.confidence_score)
    evaluation.strengths = scored.strengths
    evaluation.weaknesses = scored.weaknesses
    evaluation.improvements = scored.improvements
    evaluation.ai_feedback = scored.feedback
    evaluation.error_message = None
    evaluation.status = EvaluationStatus.COMPLETED


def score_response(response_id: uuid.UUID) -> bool:
    """Score one answer, opening its own DB session so it can run in a worker.

    Returns False when there is nothing to score. Lets LLMError bubble up so the
    caller can retry.
    """
    db = SessionLocal()
    try:
        evaluation = (
            db.query(ResponseEvaluation)
            .filter(ResponseEvaluation.response_id == response_id)
            .first()
        )
        if evaluation is None or evaluation.status == EvaluationStatus.COMPLETED:
            return False

        response = (
            db.query(InterviewResponse)
            .options(
                joinedload(InterviewResponse.question)
                .joinedload(InterviewQuestion.session)
                .joinedload(InterviewSession.interview)
            )
            .filter(InterviewResponse.id == response_id)
            .first()
        )
        question = response.question

        with trace_owner(
            user_id=question.session.user_id, session_id=question.session_id
        ):
            scored = evaluate_answer(
                _build_engine_config(question.session.interview),
                question_text=question.question_text,
                answer_text=response.response_text,
                rubric=question.rubric,
                topic=question.topic,
                difficulty=question.difficulty.value,
            )
        _apply(evaluation, scored)
        db.commit()
        return True
    finally:
        db.close()


def mark_failed(response_id: uuid.UUID, message: str) -> None:
    """Record that scoring gave up, so the answer can be scored again later."""
    db = SessionLocal()
    try:
        evaluation = (
            db.query(ResponseEvaluation)
            .filter(ResponseEvaluation.response_id == response_id)
            .first()
        )
        if evaluation is None or evaluation.status == EvaluationStatus.COMPLETED:
            return
        evaluation.status = EvaluationStatus.FAILED
        evaluation.error_message = message[:1000]
        db.commit()
    finally:
        db.close()


def unscored_response_ids(db: Session, session_id: uuid.UUID) -> List[uuid.UUID]:
    rows = (
        db.query(ResponseEvaluation.response_id)
        .join(InterviewResponse, ResponseEvaluation.response_id == InterviewResponse.id)
        .join(InterviewQuestion, InterviewResponse.question_id == InterviewQuestion.id)
        .filter(
            InterviewQuestion.session_id == session_id,
            ResponseEvaluation.status != EvaluationStatus.COMPLETED,
        )
        .all()
    )
    return [response_id for (response_id,) in rows]


def enqueue_session_evaluations(db: Session, session_id: uuid.UUID) -> int:
    """Queue scoring for every unscored answer of a session.

    Run after each answer, so answers whose task was lost (broker down, worker
    restarted) are queued again on the next submit.
    """
    from app.workers.tasks.evaluation_tasks import score_response_task

    queued = 0
    for response_id in unscored_response_ids(db, session_id):
        try:
            score_response_task.delay(str(response_id))
            queued += 1
        except Exception as e:
            logger.error(f"Could not queue scoring for {response_id}: {e}")
    return queued
