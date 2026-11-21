import uuid
from enum import Enum
from typing import Dict, List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.interview_session import InterviewSession

from sqlalchemy import (
    CheckConstraint,
    Float,
    Text,
    ForeignKey,
    Enum as SqlEnum,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

SCORE_COLUMNS = (
    "overall_score",
    "technical_score",
    "communication_score",
    "problem_solving_score",
    "confidence_score",
)


class ReportStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class InterviewReport(BaseModel):
    __tablename__ = "interview_reports"
    __table_args__ = tuple(
        CheckConstraint(
            f"{column} IS NULL OR ({column} >= 0 AND {column} <= 10)",
            name=f"ck_interview_reports_{column}_range",
        )
        for column in SCORE_COLUMNS
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    status: Mapped[ReportStatus] = mapped_column(
        SqlEnum(ReportStatus, name="reportstatus"),
        default=ReportStatus.PENDING,
        nullable=False,
    )

    # Averages of the answer evaluations; NULL until the report is COMPLETED
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    technical_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    communication_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    problem_solving_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Average score per interview topic, e.g. {"Caching with Redis": 6.0}
    topic_scores: Mapped[Dict[str, float]] = mapped_column(
        JSON, default=dict, nullable=False
    )

    strengths: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    weaknesses: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    improvement_suggestions: Mapped[List[str]] = mapped_column(
        JSON, default=list, nullable=False
    )
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    readiness_verdict: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    top_priorities: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)

    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    session: Mapped["InterviewSession"] = relationship(
        "InterviewSession", back_populates="report"
    )
