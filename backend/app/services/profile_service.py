import logging

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileUpdate
from app.services import user_service

logger = logging.getLogger(__name__)


def _starting_name(user: User) -> str:
    """Clerk's name for the user; their username or email if Clerk can't answer."""
    try:
        clerk_user = user_service.fetch_clerk_user(user.auth_provider_id)
        return user_service.full_name_from_clerk(clerk_user, user.email)
    except HTTPException:
        return user.username or user.email.split("@")[0]


def get_or_create_profile(db: Session, user: User) -> Profile:
    """The user's profile, created empty for accounts made before profiles were."""
    if user.profile:
        return user.profile
    db.add(Profile(user_id=user.id, full_name=_starting_name(user)))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    db.refresh(user)
    return user.profile


def update_profile(db: Session, user: User, data: ProfileUpdate) -> Profile:
    profile = get_or_create_profile(db, user)
    for field, value in data.model_dump().items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
