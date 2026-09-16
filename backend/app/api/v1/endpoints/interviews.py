import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse
from app.services import interview_service

router = APIRouter()


@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
    interview: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return interview_service.create_interview(db, current_user.id, interview)


@router.get("/", response_model=List[InterviewResponse])
def get_all_interviews(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return interview_service.get_interviews(db, current_user.id)


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(
    interview_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return interview_service.get_interview(db, current_user.id, interview_id)


@router.patch("/{interview_id}", response_model=InterviewResponse)
def update_interview(
    interview_id: uuid.UUID,
    interview: InterviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return interview_service.update_interview(
        db, current_user.id, interview_id, interview
    )


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(
    interview_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview_service.delete_interview(db, current_user.id, interview_id)
    return None
