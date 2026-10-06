import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.schemas.session import SessionAttempt


class DashboardFocus(BaseModel):
    role: str
    experience_level: Optional[str] = None


class ActiveAttempt(BaseModel):
    id: uuid.UUID
    interview_id: uuid.UUID
    interview_title: str
    questions_answered: int
    total_questions: int


class DashboardStats(BaseModel):
    attempts: int = 0
    completed: int = 0
    ended_early: int = 0
    average_score: Optional[float] = None
    recent_average: Optional[float] = None
    best_score: Optional[float] = None
    best_interview_title: Optional[str] = None


class SkillAverages(BaseModel):
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    problem_solving_score: Optional[float] = None
    confidence_score: Optional[float] = None


class TrendPoint(BaseModel):
    session_id: uuid.UUID
    date: datetime
    interview_title: str
    score: float


class TopicScore(BaseModel):
    topic: str
    score: float
    answers: int


class DashboardTopics(BaseModel):
    strong: List[TopicScore] = []
    weak: List[TopicScore] = []


class RecentAttempt(SessionAttempt):
    interview_title: str


class DashboardOut(BaseModel):
    focus: Optional[DashboardFocus] = None
    active_attempt: Optional[ActiveAttempt] = None
    stats: DashboardStats
    skill_averages: SkillAverages
    score_trend: List[TrendPoint] = []
    topics: DashboardTopics
    recent_attempts: List[RecentAttempt] = []
