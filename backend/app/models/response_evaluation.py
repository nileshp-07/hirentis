import uuid
from enum import Enum
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.interview_response import InterviewResponse

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
    "score",
    "technical_score",
    "communication_score",
    "problem_solving_score",
    "confidence_score",
)


class EvaluationStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ResponseEvaluation(BaseModel):
    __tablename__ = "response_evaluations"
    __table_args__ = tuple(
        CheckConstraint(
            f"{column} IS NULL OR ({column} >= 0 AND {column} <= 10)",
            name=f"ck_response_evaluations_{column}_range",
        )
        for column in SCORE_COLUMNS
    )

    # unique: an answer has at most one evaluation
    response_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interview_responses.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    status: Mapped[EvaluationStatus] = mapped_column(
        SqlEnum(EvaluationStatus, name="evaluationstatus"),
        default=EvaluationStatus.PENDING,
        nullable=False,
    )

    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    technical_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    communication_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    problem_solving_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    strengths: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    weaknesses: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    improvements: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    ai_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    response: Mapped["InterviewResponse"] = relationship(
        "InterviewResponse", back_populates="evaluation"
    )
