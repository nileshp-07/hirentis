from enum import Enum
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.profile import Profile
    from app.models.resume import Resume


class UserRole(str, Enum):
    CANDIDATE = "Candidate"
    RECRUITER = "Recruiter"


class User(BaseModel):
    __tablename__ = "users"

    auth_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    auth_provider_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), default=UserRole.CANDIDATE, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    username: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # 1-to-1 relationship with Profile
    profile: Mapped["Profile"] = relationship(
        "Profile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

    resumes: Mapped[list["Resume"]] = relationship(
        "Resume", back_populates="user", cascade="all, delete-orphan"
    )
