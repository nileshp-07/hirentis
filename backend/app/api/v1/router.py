from fastapi import APIRouter
from app.api.v1.endpoints import webhooks
from app.api.v1.endpoints import resume
from app.api.v1.endpoints import interviews
from app.api.v1.endpoints import sessions
from app.api.v1.endpoints import dashboard

api_router = APIRouter()

api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
