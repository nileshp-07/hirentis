import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.interview import Interview
    from app.models.interview_question import InterviewQuestion

from sqlalchemy import DateTime, Integer, ForeignKey, Enum as SqlEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class InterviewSessionStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class InterviewSession(BaseModel):
    __tablename__ = "interview_sessions"

    interview_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("interviews.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    status: Mapped[InterviewSessionStatus] = mapped_column(
        SqlEnum(InterviewSessionStatus, name="interviewsessionstatus"),
        default=InterviewSessionStatus.SCHEDULED,
        nullable=False,
    )

    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    context_memory: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    interview: Mapped["Interview"] = relationship(
        "Interview", back_populates="sessions"
    )
    user: Mapped["User"] = relationship("User")
    questions: Mapped[List["InterviewQuestion"]] = relationship(
        "InterviewQuestion",
        back_populates="session",
        order_by="InterviewQuestion.order_index",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
