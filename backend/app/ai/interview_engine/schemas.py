from enum import Enum
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

QuestionKind = Literal["TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN"]
Difficulty = Literal["EASY", "MEDIUM", "HARD"]


class Action(str, Enum):
    NEXT_TOPIC = "NEXT_TOPIC"
    FOLLOW_UP = "FOLLOW_UP"
    END = "END"


class InterviewConfig(BaseModel):
    role: str
    experience_level: Optional[str] = None
    interview_type: str
    tech_stack: List[str] = []
    job_description: Optional[str] = None
    total_questions: int = Field(ge=1)


class AskedQuestion(BaseModel):
    """A question already asked in the session, with the answer once submitted."""

    question_text: str
    topic: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    is_followup: bool = False
    answer_text: Optional[str] = None
    key_points: List[str] = []


class PlanItem(BaseModel):
    topic: str = Field(description='Short label, e.g. "React hooks"')
    question_type: QuestionKind
    difficulty: Difficulty
    focus: str = Field(description="What this topic should probe and why it matters")


class InterviewPlan(BaseModel):
    resume_brief: str = Field(
        description="3-5 sentence summary of the candidate relevant to this role"
    )
    items: List[PlanItem]


class Rubric(BaseModel):
    key_points: List[str] = Field(description="3-5 points a strong answer must cover")
    good_answer_signals: List[str]
    red_flags: List[str]


class InterviewerDecision(BaseModel):
    previous_answer_summary: str = Field(
        description="One sentence summarising the candidate's last answer; "
        "empty string when there is no previous answer"
    )
    missing_key_points: List[str] = Field(
        description="Key points of the last question the answer did not cover; "
        "empty list when it covered them or there is no previous answer"
    )
    action: Action
    followup_reason: str = Field(
        description="Why this answer needs probing, naming the exact claim, "
        "technique or gap; empty string unless the action is FOLLOW_UP"
    )
    question_text: str
    difficulty: Difficulty
    rubric: Rubric


class EngineState(BaseModel):
    resume_brief: str = ""
    plan: List[PlanItem] = []
    # Index of the plan item currently being asked about; -1 before the first question
    plan_cursor: int = -1
    main_questions_asked: int = 0
    followup_used: bool = False
    followups_total: int = 0
    # One line per answered question, oldest first
    running_summary: List[str] = []


class NextQuestion(BaseModel):
    question_text: str
    question_type: QuestionKind
    difficulty: Difficulty
    topic: str
    rubric: Rubric
    is_followup: bool


class InterviewerResult(BaseModel):
    """Output of one interviewer step: the next question (None when the interview
    is finished) and the updated state to save back to context_memory."""

    question: Optional[NextQuestion]
    state: EngineState

    @property
    def is_finished(self) -> bool:
        return self.question is None
