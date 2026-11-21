from typing import Optional

from app.ai.interview_engine.context import build_planner_messages
from app.ai.interview_engine.schemas import (
    CandidateProfile,
    EngineState,
    InterviewConfig,
    InterviewPlan,
    PlanItem,
)
from app.ai.llm.openai_client import LLMError, generate_structured
from app.core.config import settings


def plan_interview(
    config: InterviewConfig,
    resume_data: dict,
    profile: Optional[CandidateProfile] = None,
    practice_history: Optional[str] = None,
    llm=generate_structured,
) -> EngineState:
    """Create the interview plan and the initial engine state for a new session.

    `practice_history` describes the candidate's earlier attempts, so a retake
    asks about new things and revisits their weak areas.
    """
    plan = llm(
        build_planner_messages(config, resume_data, profile, practice_history),
        InterviewPlan,
        model=settings.LLM_MODEL_PLANNER,
        temperature=0.5,
    )

    items = [
        PlanItem(**item.model_dump()) for item in plan.items[: config.total_questions]
    ]
    if not items:
        raise LLMError("Planner returned an empty interview plan.")

    return EngineState(resume_brief=plan.resume_brief, plan=items)
