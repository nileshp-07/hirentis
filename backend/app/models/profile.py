import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User


class Profile(BaseModel):
    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    target_role: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Back reference to User
    user: Mapped["User"] = relationship("User", back_populates="profile")
