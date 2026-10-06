import uuid
from statistics import mean
from typing import Dict, List, Optional

from sqlalchemy.orm import Session, selectinload

from app.models.interview import Interview
from app.models.interview_question import InterviewQuestion, QuestionType
from app.models.interview_report import ReportStatus
from app.models.interview_response import InterviewResponse
from app.models.interview_session import InterviewSession, InterviewSessionStatus
from app.models.response_evaluation import EvaluationStatus
from app.schemas.dashboard import (
    ActiveAttempt,
    DashboardFocus,
    DashboardOut,
    DashboardStats,
    DashboardTopics,
    RecentAttempt,
    SkillAverages,
    TopicScore,
    TrendPoint,
)
from app.services.session_service import to_attempt

FINISHED_STATUSES = (InterviewSessionStatus.COMPLETED, InterviewSessionStatus.ABANDONED)
RECENT_WINDOW = 5
TREND_POINTS = 20
RECENT_ATTEMPTS = 5
STRONG_TOPIC_SCORE = 7.5
WEAK_TOPIC_SCORE = 6.0
TOPICS_PER_GROUP = 5
SKILL_FIELDS = (
    "technical_score",
    "communication_score",
    "problem_solving_score",
    "confidence_score",
)


def _average(values: List[float]) -> Optional[float]:
    return round(mean(values), 1) if values else None


def _load_sessions(db: Session, user_id: uuid.UUID) -> List[InterviewSession]:
    """Every session of the user, newest first, with all the dashboard reads."""
    return (
        db.query(InterviewSession)
        .options(
            selectinload(InterviewSession.interview),
            selectinload(InterviewSession.report),
            selectinload(InterviewSession.questions)
            .selectinload(InterviewQuestion.response)
            .selectinload(InterviewResponse.evaluation),
        )
        .filter(InterviewSession.user_id == user_id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )


def _answered(session: InterviewSession) -> List[InterviewQuestion]:
    return [question for question in session.questions if question.response]


def _focus(db: Session, user_id: uuid.UUID) -> Optional[DashboardFocus]:
    interview = (
        db.query(Interview)
        .filter(Interview.created_by == user_id)
        .order_by(Interview.created_at.desc())
        .first()
    )
    if interview is None:
        return None
    return DashboardFocus(
        role=interview.role, experience_level=interview.experience_level
    )


def _active_attempt(sessions: List[InterviewSession]) -> Optional[ActiveAttempt]:
    session = next(
        (s for s in sessions if s.status == InterviewSessionStatus.IN_PROGRESS), None
    )
    if session is None:
        return None
    return ActiveAttempt(
        id=session.id,
        interview_id=session.interview_id,
        interview_title=session.interview.title,
        questions_answered=sum(
            1
            for question in _answered(session)
            if question.question_type != QuestionType.FOLLOWUP
        ),
        total_questions=session.interview.total_questions,
    )


def _topics(finished: List[InterviewSession]) -> DashboardTopics:
    scores: Dict[str, List[float]] = {}
    names: Dict[str, str] = {}
    for session in finished:
        for question in _answered(session):
            evaluation = question.response.evaluation
            if (
                not question.topic
                or evaluation is None
                or evaluation.status != EvaluationStatus.COMPLETED
                or evaluation.score is None
            ):
                continue
            key = question.topic.strip().lower()
            names.setdefault(key, question.topic.strip())
            scores.setdefault(key, []).append(evaluation.score)

    ranked = sorted(
        (
            TopicScore(
                topic=names[key], score=round(mean(values), 1), answers=len(values)
            )
            for key, values in scores.items()
        ),
        key=lambda topic: topic.score,
        reverse=True,
    )
    return DashboardTopics(
        strong=[t for t in ranked if t.score >= STRONG_TOPIC_SCORE][:TOPICS_PER_GROUP],
        weak=[t for t in reversed(ranked) if t.score < WEAK_TOPIC_SCORE][
            :TOPICS_PER_GROUP
        ],
    )


def get_dashboard(db: Session, user_id: uuid.UUID) -> DashboardOut:
    sessions = _load_sessions(db, user_id)
    finished = [s for s in sessions if s.status in FINISHED_STATUSES and _answered(s)]
    finished_ids = {s.id for s in finished}

    scored = sorted(
        (
            s
            for s in finished
            if s.report
            and s.report.status == ReportStatus.COMPLETED
            and s.report.overall_score is not None
        ),
        key=lambda s: s.completed_at or s.created_at,
    )
    overall = [s.report.overall_score for s in scored]
    best = max(scored, key=lambda s: s.report.overall_score, default=None)

    stats = DashboardStats(
        attempts=len(finished),
        completed=sum(
            1 for s in finished if s.status == InterviewSessionStatus.COMPLETED
        ),
        ended_early=sum(
            1 for s in finished if s.status == InterviewSessionStatus.ABANDONED
        ),
        average_score=_average(overall),
        recent_average=(
            _average(overall[-RECENT_WINDOW:]) if len(overall) > RECENT_WINDOW else None
        ),
        best_score=best.report.overall_score if best else None,
        best_interview_title=best.interview.title if best else None,
    )

    skill_averages = SkillAverages(
        **{
            field: _average(
                [
                    getattr(s.report, field)
                    for s in scored
                    if getattr(s.report, field) is not None
                ]
            )
            for field in SKILL_FIELDS
        }
    )

    score_trend = [
        TrendPoint(
            session_id=s.id,
            date=s.completed_at or s.created_at,
            interview_title=s.interview.title,
            score=s.report.overall_score,
        )
        for s in scored[-TREND_POINTS:]
    ]

    recent = [
        s
        for s in sessions
        if s.status == InterviewSessionStatus.IN_PROGRESS or s.id in finished_ids
    ][:RECENT_ATTEMPTS]

    return DashboardOut(
        focus=_focus(db, user_id),
        active_attempt=_active_attempt(sessions),
        stats=stats,
        skill_averages=skill_averages,
        score_trend=score_trend,
        topics=_topics(finished),
        recent_attempts=[
            RecentAttempt(
                **to_attempt(s).model_dump(), interview_title=s.interview.title
            )
            for s in recent
        ],
    )
