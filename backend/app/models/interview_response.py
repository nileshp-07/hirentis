import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.interview_question import InterviewQuestion
    from app.models.response_evaluation import ResponseEvaluation

from sqlalchemy import DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models.base import BaseModel


class InterviewResponse(BaseModel):
    __tablename__ = "interview_responses"

    question_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interview_questions.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    response_text: Mapped[str] = mapped_column(Text, nullable=False)
    audio_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    response_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    question: Mapped["InterviewQuestion"] = relationship(
        "InterviewQuestion", back_populates="response"
    )
    evaluation: Mapped[Optional["ResponseEvaluation"]] = relationship(
        "ResponseEvaluation",
        back_populates="response",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
