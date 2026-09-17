import uuid
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.resume import Resume
    from app.models.interview_session import InterviewSession

from sqlalchemy import String, Integer, Text, ForeignKey, Enum as SqlEnum, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class InterviewType(str, Enum):
    TECHNICAL = "TECHNICAL"
    HR = "HR"
    SYSTEM_DESIGN = "SYSTEM_DESIGN"
    BEHAVIORAL = "BEHAVIORAL"


class Interview(BaseModel):
    __tablename__ = "interviews"

    title: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(255))
    job_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    experience_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    tech_stack: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String), nullable=True
    )

    interview_type: Mapped[InterviewType] = mapped_column(
        SqlEnum(InterviewType, name="interviewtype"),
        default=InterviewType.TECHNICAL,
        nullable=False,
    )

    total_questions: Mapped[int] = mapped_column(Integer, default=5)

    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    resume_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True, index=True
    )

    interview_overview: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    user: Mapped["User"] = relationship("User", backref="interviews")
    resume: Mapped[Optional["Resume"]] = relationship("Resume")
    sessions: Mapped[List["InterviewSession"]] = relationship(
        "InterviewSession",
        back_populates="interview",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
