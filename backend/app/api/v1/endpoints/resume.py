from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.resume import ResumeResponse
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services import resume_service
import uuid

router = APIRouter()


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a PDF or Word document.",
        )
    if file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail="File too large. Maximum size is 5MB."
        )

    resume = await resume_service.process_resume_upload(db, current_user.id, file)

    return resume


@router.get("/", response_model= list[ResumeResponse])
async def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await resume_service.get_user_resumes(current_user.id, db)

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await resume_service.delete_resume(db, resume_id, current_user.id)
    return {"message": "Resume deleted successfully"}


@router.put("/{resume_id}/activate")
async def activate_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await resume_service.set_active_resume(db, resume_id, current_user.id)
    return {"message": "Resume activated successfully"}