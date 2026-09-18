import uuid
from enum import Enum
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.interview_session import InterviewSession
    from app.models.interview_response import InterviewResponse

from sqlalchemy import (
    Integer,
    String,
    Text,
    ForeignKey,
    Enum as SqlEnum,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class QuestionType(str, Enum):
    TECHNICAL = "TECHNICAL"
    BEHAVIORAL = "BEHAVIORAL"
    SYSTEM_DESIGN = "SYSTEM_DESIGN"
    FOLLOWUP = "FOLLOWUP"


class QuestionDifficulty(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class InterviewQuestion(BaseModel):
    __tablename__ = "interview_questions"
    __table_args__ = (
        UniqueConstraint(
            "session_id", "order_index", name="uq_interview_questions_session_order"
        ),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True
    )
    parent_question_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("interview_questions.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[QuestionType] = mapped_column(
        SqlEnum(QuestionType, name="questiontype"),
        default=QuestionType.TECHNICAL,
        nullable=False,
    )
    difficulty: Mapped[QuestionDifficulty] = mapped_column(
        SqlEnum(QuestionDifficulty, name="questiondifficulty"),
        default=QuestionDifficulty.MEDIUM,
        nullable=False,
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    # Plan topic the question covers, e.g. "React hooks"; used for per-topic analytics
    topic: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # Hidden scoring guide written with the question, e.g. {"key_points": [...]}
    rubric: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    session: Mapped["InterviewSession"] = relationship(
        "InterviewSession", back_populates="questions"
    )
    parent: Mapped[Optional["InterviewQuestion"]] = relationship(
        "InterviewQuestion",
        remote_side="InterviewQuestion.id",
        back_populates="followups",
    )
    followups: Mapped[List["InterviewQuestion"]] = relationship(
        "InterviewQuestion", back_populates="parent", passive_deletes=True
    )
    response: Mapped[Optional["InterviewResponse"]] = relationship(
        "InterviewResponse",
        back_populates="question",
        uselist=False,  # Returns single object, not a list
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
