import uuid
from typing import Optional, List, TYPE_CHECKING
from enum import Enum

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.resume import Resume

from sqlalchemy import String, Integer, Text, ForeignKey, Enum as SqlEnum
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class InterviewType(str, Enum):
    TECHNICAL = "Technical"
    HR = "HR"
    SYSTEM_DESIGN = "System Design"
    BEHAVIORAL = "Behavioral"


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
        SqlEnum(InterviewType),
        default=InterviewType.TECHNICAL,
        nullable=False,
    )

    total_question: Mapped[int] = mapped_column(Integer, default=5)

    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    resume_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True, index=True
    )

    interview_overview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", backref="interviews")
    resume: Mapped[Optional["Resume"]] = relationship("Resume")
