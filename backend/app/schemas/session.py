import uuid
from datetime import datetime
from typing import Annotated, List, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.models.interview_question import QuestionDifficulty, QuestionType
from app.models.interview_report import ReportStatus
from app.models.interview_session import InterviewSessionStatus


class QuestionAnswer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    response_text: str
    response_time_seconds: Optional[int] = None
    submitted_at: datetime


class SessionQuestion(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_text: str
    question_type: QuestionType
    difficulty: QuestionDifficulty
    order_index: int
    parent_question_id: Optional[uuid.UUID] = None
    created_at: datetime
    response: Optional[QuestionAnswer] = None


class SessionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    interview_id: uuid.UUID
    status: InterviewSessionStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class SessionDetail(SessionSummary):
    questions: List[SessionQuestion] = []
    # What the interviewer said to wrap up; set once the interview finishes
    closing_message: Optional[str] = None


class SessionAttempt(SessionSummary):
    """One attempt in an interview's history, with its result."""

    answered_count: int = 0
    overall_score: Optional[float] = None
    report_status: Optional[ReportStatus] = None


class AnswerSubmit(BaseModel):
    response_text: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=5000)
    ]
    response_time_seconds: Optional[int] = Field(default=None, ge=0)


class QuestionFeedback(BaseModel):
    """One question with the candidate's answer and how it was scored."""

    model_config = ConfigDict(from_attributes=True)

    question_id: uuid.UUID
    order_index: int
    question_text: str
    topic: Optional[str] = None
    question_type: QuestionType
    difficulty: QuestionDifficulty
    asked_at: datetime
    answer_text: Optional[str] = None
    submitted_at: Optional[datetime] = None
    score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    problem_solving_score: Optional[float] = None
    confidence_score: Optional[float] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    improvements: List[str] = []
    feedback: Optional[str] = None
    # Each key point of the question and whether the answer covered it
    point_checks: List[dict] = []
    model_answer: Optional[str] = None


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: uuid.UUID
    interview_id: uuid.UUID
    interview_title: str
    interview_role: str
    session_status: InterviewSessionStatus
    status: ReportStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    overall_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    problem_solving_score: Optional[float] = None
    confidence_score: Optional[float] = None
    topic_scores: dict = {}
    strengths: List[str] = []
    weaknesses: List[str] = []
    improvement_suggestions: List[str] = []
    ai_summary: Optional[str] = None
    readiness_verdict: Optional[str] = None
    top_priorities: List[str] = []
    questions: List[QuestionFeedback] = []
