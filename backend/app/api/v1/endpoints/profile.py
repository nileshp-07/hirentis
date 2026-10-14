from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.profile import ProfileOut, ProfileUpdate
from app.services import profile_service

router = APIRouter()


@router.get("/", response_model=ProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return profile_service.get_or_create_profile(db, current_user)


@router.put("/", response_model=ProfileOut)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return profile_service.update_profile(db, current_user, data)
