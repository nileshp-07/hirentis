import uuid
from datetime import datetime
from typing import Annotated, List, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.models.interview_question import QuestionDifficulty, QuestionType
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


class AnswerSubmit(BaseModel):
    response_text: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=5000)
    ]
    response_time_seconds: Optional[int] = Field(default=None, ge=0)
