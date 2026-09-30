import logging
import uuid
from statistics import mean
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session, selectinload

from app.ai.interview_engine import write_report_narrative
from app.models.interview_question import InterviewQuestion
from app.models.interview_report import InterviewReport, ReportStatus
from app.models.interview_response import InterviewResponse
from app.models.interview_session import InterviewSession
from app.models.response_evaluation import EvaluationStatus
from app.db.session import SessionLocal
from app.services.session_service import _build_engine_config, get_session

logger = logging.getLogger(__name__)

SCORE_FIELDS = (
    "technical_score",
    "communication_score",
    "problem_solving_score",
    "confidence_score",
)


class ReportNotReady(Exception):
    """Some answers of the session have not been scored yet."""


def _load_session(db: Session, session_id: uuid.UUID) -> Optional[InterviewSession]:
    return (
        db.query(InterviewSession)
        .options(
            selectinload(InterviewSession.questions)
            .selectinload(InterviewQuestion.response)
            .selectinload(InterviewResponse.evaluation),
            selectinload(InterviewSession.interview),
        )
        .filter(InterviewSession.id == session_id)
        .first()
    )


def _scored_questions(session: InterviewSession) -> List[InterviewQuestion]:
    return [
        question
        for question in session.questions
        if question.response
        and question.response.evaluation
        and question.response.evaluation.status == EvaluationStatus.COMPLETED
    ]


def _unscored_count(session: InterviewSession) -> int:
    return sum(
        1
        for question in session.questions
        if question.response
        and (
            question.response.evaluation is None
            or question.response.evaluation.status != EvaluationStatus.COMPLETED
        )
    )


def aggregate_scores(
    questions: List[InterviewQuestion],
) -> Tuple[Dict[str, float], Dict[str, float]]:
    """Average the answer scores overall and per topic. Plain maths, no LLM."""
    evaluations = [question.response.evaluation for question in questions]

    scores: Dict[str, float] = {}
    overall = [e.score for e in evaluations if e.score is not None]
    if overall:
        scores["overall_score"] = round(mean(overall), 1)
    for field in SCORE_FIELDS:
        values = [
            getattr(e, field) for e in evaluations if getattr(e, field) is not None
        ]
        if values:
            scores[field] = round(mean(values), 1)

    by_topic: Dict[str, List[float]] = {}
    for question in questions:
        score = question.response.evaluation.score
        if question.topic and score is not None:
            by_topic.setdefault(question.topic, []).append(score)
    topic_scores = {
        topic: round(mean(values), 1) for topic, values in sorted(by_topic.items())
    }
    return scores, topic_scores


def _question_results(questions: List[InterviewQuestion]) -> List[str]:
    """One line per answered question for the narrative prompt."""
    results = []
    for question in questions:
        evaluation = question.response.evaluation
        results.append(
            f"- [{question.topic or 'general'}] {question.question_text} "
            f"-> score {evaluation.score}; "
            f"strengths: {', '.join(evaluation.strengths) or 'none'}; "
            f"gaps: {', '.join(evaluation.weaknesses) or 'none'}"
        )
    return results


def generate_report(session_id: uuid.UUID, allow_partial: bool = False) -> bool:
    """Build the report for a session. Opens its own DB session for the worker."""
    db = SessionLocal()
    try:
        session = _load_session(db, session_id)
        if session is None:
            return False

        report = session.report
        if report is None:
            report = InterviewReport(session_id=session_id)
            db.add(report)
            db.flush()
        if report.status == ReportStatus.COMPLETED:
            return False

        scored = _scored_questions(session)
        if not scored:
            raise ReportNotReady("No answer of this session has been scored yet")
        if _unscored_count(session) and not allow_partial:
            raise ReportNotReady(f"{_unscored_count(session)} answers still scoring")

        scores, topic_scores = aggregate_scores(scored)
        narrative = write_report_narrative(
            _build_engine_config(session.interview),
            session_status=session.status.value,
            answered_count=len(scored),
            scores=scores,
            topic_scores=topic_scores,
            question_results=_question_results(scored),
        )

        for field, value in scores.items():
            setattr(report, field, value)
        report.topic_scores = topic_scores
        report.strengths = narrative.strengths
        report.weaknesses = narrative.weaknesses
        report.improvement_suggestions = narrative.improvement_suggestions
        report.ai_summary = narrative.summary
        report.error_message = None
        report.status = ReportStatus.COMPLETED
        db.commit()
        return True
    finally:
        db.close()


def mark_failed(session_id: uuid.UUID, message: str) -> None:
    db = SessionLocal()
    try:
        report = (
            db.query(InterviewReport)
            .filter(InterviewReport.session_id == session_id)
            .first()
        )
        if report is None or report.status == ReportStatus.COMPLETED:
            return
        report.status = ReportStatus.FAILED
        report.error_message = message[:1000]
        db.commit()
    finally:
        db.close()


def request_report(db: Session, session_id: uuid.UUID) -> bool:
    """Create the report row if needed and queue generation."""
    from app.workers.tasks.report_tasks import generate_report_task

    report = (
        db.query(InterviewReport)
        .filter(InterviewReport.session_id == session_id)
        .first()
    )
    if report is None:
        report = InterviewReport(session_id=session_id)
        db.add(report)
        db.commit()
    elif report.status == ReportStatus.COMPLETED:
        return False
    elif report.status == ReportStatus.FAILED:
        report.status = ReportStatus.PENDING
        report.error_message = None
        db.commit()

    try:
        generate_report_task.delay(str(session_id))
        return True
    except Exception as e:
        logger.error(f"Could not queue report for session {session_id}: {e}")
        return False


def get_report(
    db: Session, user_id: uuid.UUID, session_id: uuid.UUID
) -> Tuple[InterviewSession, Optional[InterviewReport]]:
    """The session with its questions, answers, evaluations and report."""
    get_session(db, user_id, session_id)
    session = _load_session(db, session_id)
    return session, session.report


def to_report_payload(
    session: InterviewSession, report: Optional[InterviewReport]
) -> dict:
    """Flatten the session, its report and per-question feedback for the API."""
    questions = []
    for question in session.questions:
        response = question.response
        evaluation = response.evaluation if response else None
        questions.append(
            {
                "question_id": question.id,
                "order_index": question.order_index,
                "question_text": question.question_text,
                "topic": question.topic,
                "question_type": question.question_type,
                "difficulty": question.difficulty,
                "answer_text": response.response_text if response else None,
                "score": evaluation.score if evaluation else None,
                "technical_score": evaluation.technical_score if evaluation else None,
                "communication_score": (
                    evaluation.communication_score if evaluation else None
                ),
                "problem_solving_score": (
                    evaluation.problem_solving_score if evaluation else None
                ),
                "confidence_score": evaluation.confidence_score if evaluation else None,
                "strengths": evaluation.strengths if evaluation else [],
                "weaknesses": evaluation.weaknesses if evaluation else [],
                "improvements": evaluation.improvements if evaluation else [],
                "feedback": evaluation.ai_feedback if evaluation else None,
            }
        )

    return {
        "session_id": session.id,
        "interview_id": session.interview_id,
        "session_status": session.status,
        "status": report.status if report else ReportStatus.PENDING,
        "duration_seconds": session.duration_seconds,
        "overall_score": report.overall_score if report else None,
        "technical_score": report.technical_score if report else None,
        "communication_score": report.communication_score if report else None,
        "problem_solving_score": report.problem_solving_score if report else None,
        "confidence_score": report.confidence_score if report else None,
        "topic_scores": report.topic_scores if report else {},
        "strengths": report.strengths if report else [],
        "weaknesses": report.weaknesses if report else [],
        "improvement_suggestions": report.improvement_suggestions if report else [],
        "ai_summary": report.ai_summary if report else None,
        "questions": questions,
    }
