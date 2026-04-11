from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.resume import ResumeResponse
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services import resume_service

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
