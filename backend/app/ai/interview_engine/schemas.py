from enum import Enum
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

QuestionKind = Literal["TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN"]
Difficulty = Literal["EASY", "MEDIUM", "HARD"]


class Action(str, Enum):
    NEXT_TOPIC = "NEXT_TOPIC"
    FOLLOW_UP = "FOLLOW_UP"
    REPHRASE = "REPHRASE"
    END = "END"


class AnswerType(str, Enum):
    ANSWER = "ANSWER"
    CLARIFICATION_REQUEST = "CLARIFICATION_REQUEST"
    UNCLEAR = "UNCLEAR"
    DONT_KNOW = "DONT_KNOW"
    OFF_TOPIC = "OFF_TOPIC"


class AnswerQuality(str, Enum):
    STRONG = "STRONG"
    OK = "OK"
    WEAK = "WEAK"
    NONE = "NONE"


class InterviewConfig(BaseModel):
    role: str
    experience_level: Optional[str] = None
    interview_type: str
    tech_stack: List[str] = []
    job_description: Optional[str] = None
    total_questions: int = Field(ge=1)


class CandidateProfile(BaseModel):
    """What the candidate wrote about themselves on their profile page."""

    target_role: Optional[str] = None
    experience_years: Optional[int] = None
    tech_stack: List[str] = []
    skills: List[str] = []
    bio: Optional[str] = None


class AskedQuestion(BaseModel):
    """A question already asked in the session, with the answer once submitted."""

    question_text: str
    topic: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    is_followup: bool = False
    answer_text: Optional[str] = None
    key_points: List[str] = []


class PlannedItem(BaseModel):
    """One topic as the planner writes it (Structured Outputs allow no defaults)."""

    topic: str = Field(description='Short label, e.g. "React hooks"')
    question_type: QuestionKind
    difficulty: Difficulty
    focus: str = Field(description="What this topic should probe and why it matters")
    anchor: str = Field(
        description="One concrete detail from the candidate's resume or profile "
        "(company, project, metric, technology) the interviewer mentions when "
        "asking; empty if nothing fits"
    )


class PlanItem(PlannedItem):
    anchor: str = ""


class InterviewPlan(BaseModel):
    resume_brief: str = Field(
        description="3-5 sentence summary of the candidate relevant to this role"
    )
    items: List[PlannedItem]


class Rubric(BaseModel):
    key_points: List[str] = Field(description="3-5 points a strong answer must cover")
    good_answer_signals: List[str]
    red_flags: List[str]


class InterviewerDecision(BaseModel):
    previous_answer_summary: str = Field(
        description="One sentence summarising the candidate's last answer; "
        "empty string when there is no previous answer"
    )
    answer_type: AnswerType = Field(
        description="What the last answer was; ANSWER when there is none yet"
    )
    answer_quality: AnswerQuality = Field(
        description="How strong the last answer was; NONE when there is none yet"
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
    reaction: str = Field(
        description="What the interviewer says before the question: the greeting "
        "on the first question, otherwise at most one short human sentence"
    )
    question_text: str = Field(description="Exactly one question")
    difficulty: Difficulty
    rubric: Rubric


class ClosingMessage(BaseModel):
    message: str = Field(description="The interviewer's closing words, 2-3 sentences")


class PointCheck(BaseModel):
    point: str = Field(description="One rubric key point, copied as written")
    covered: bool
    evidence: str = Field(
        description="A short quote from the answer that shows the point was covered; "
        "empty string when it was not"
    )


class AnswerEvaluation(BaseModel):
    point_checks: List[PointCheck] = Field(
        description="One entry per rubric key point, decided before any score"
    )
    score: float = Field(description="Overall score for the answer, 0-10")
    technical_score: float = Field(description="Correctness and depth, 0-10")
    communication_score: float = Field(description="Clarity and structure, 0-10")
    problem_solving_score: float = Field(
        description="Reasoning and trade-off awareness, 0-10"
    )
    confidence_score: float = Field(
        description="How assured and specific the answer sounds, 0-10"
    )
    strengths: List[str] = Field(description="1-3 things the candidate did well")
    weaknesses: List[str] = Field(description="1-3 concrete gaps in this answer")
    improvements: List[str] = Field(description="1-3 specific, actionable suggestions")
    feedback: str = Field(
        description="2-3 sentences of feedback addressed to the candidate"
    )
    model_answer: str = Field(
        description="What a strong answer at this experience level sounds like, "
        "3-5 spoken-style sentences"
    )


class ReportNarrative(BaseModel):
    summary: str = Field(
        description="3-5 sentences addressed to the candidate, summarising how the "
        "interview went overall"
    )
    strengths: List[str] = Field(description="2-4 strengths seen across the answers")
    weaknesses: List[str] = Field(description="2-4 recurring gaps across the answers")
    improvement_suggestions: List[str] = Field(
        description="3-5 specific, actionable things to work on before the next interview"
    )
    readiness_verdict: str = Field(
        description="One honest sentence on how ready the candidate is for this role "
        'and level, e.g. "Almost ready for 2-year backend roles: the basics are '
        'solid, but you need to explain trade-offs."'
    )
    top_priorities: List[str] = Field(
        description="The 3 most important things to fix first, most important first"
    )


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
    # Times the current question was repeated or reworded; resets on a new question
    clarifications_used: int = 0
    # What the interviewer said at the end, saved when the interview finishes
    closing_message: str = ""


class NextQuestion(BaseModel):
    question_text: str
    question_type: QuestionKind
    difficulty: Difficulty
    topic: str
    rubric: Rubric
    is_followup: bool
    # The current question reworded: replaces its text, nothing is scored or added
    is_rephrase: bool = False


class InterviewerResult(BaseModel):
    """Output of one interviewer step: the next question (None when the interview
    is finished) and the updated state to save back to context_memory."""

    question: Optional[NextQuestion]
    state: EngineState

    @property
    def is_finished(self) -> bool:
        return self.question is None
