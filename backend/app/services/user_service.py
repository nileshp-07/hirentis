import logging

import httpx
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.profile import Profile
from app.models.user import User

logger = logging.getLogger(__name__)

CLERK_API_URL = "https://api.clerk.com/v1"


def _primary_email(clerk_user: dict) -> str:
    emails = clerk_user.get("email_addresses") or []
    primary_id = clerk_user.get("primary_email_address_id")
    primary = next((e for e in emails if e.get("id") == primary_id), None)
    address = (primary or (emails[0] if emails else {})).get("email_address")
    return address or f"{clerk_user['id']}@users.noreply.clerk"


def full_name_from_clerk(clerk_user: dict, email: str) -> str:
    name = " ".join(
        part
        for part in (clerk_user.get("first_name"), clerk_user.get("last_name"))
        if part
    )
    return name or clerk_user.get("username") or email.split("@")[0]


def fetch_clerk_user(clerk_user_id: str) -> dict:
    """The user as Clerk knows them; session tokens only carry the id."""
    try:
        response = httpx.get(
            f"{CLERK_API_URL}/users/{clerk_user_id}",
            headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"},
            timeout=5.0,
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Could not fetch Clerk user {clerk_user_id}: {e}")
        raise HTTPException(status_code=503, detail="Identity provider unavailable")


def create_from_clerk(db: Session, clerk_user: dict) -> User:
    """Create the user and an empty profile, or return the user if they exist."""
    clerk_user_id = clerk_user["id"]
    user = db.query(User).filter(User.auth_provider_id == clerk_user_id).first()
    if user:
        return user

    email = _primary_email(clerk_user)
    user = User(
        auth_provider="clerk",
        auth_provider_id=clerk_user_id,
        email=email,
        username=clerk_user.get("username"),
        is_active=True,
    )
    user.profile = Profile(
        full_name=full_name_from_clerk(clerk_user, email),
        avatar_url=clerk_user.get("image_url"),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        user = db.query(User).filter(User.auth_provider_id == clerk_user_id).first()
        if user is None:
            logger.error(f"Could not create user for Clerk id {clerk_user_id}")
            raise HTTPException(status_code=409, detail="Account conflict")
        return user
    logger.info(f"Created user for Clerk id {clerk_user_id}")
    return user


def get_or_create_user(db: Session, clerk_user_id: str) -> User:
    user = db.query(User).filter(User.auth_provider_id == clerk_user_id).first()
    if user:
        return user
    return create_from_clerk(db, fetch_clerk_user(clerk_user_id))
