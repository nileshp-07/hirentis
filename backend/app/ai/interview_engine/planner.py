from typing import Optional

from app.ai.interview_engine.context import build_planner_messages
from app.ai.interview_engine.schemas import (
    CandidateProfile,
    EngineState,
    InterviewConfig,
    InterviewPlan,
)
from app.ai.llm.openai_client import LLMError, generate_structured
from app.core.config import settings


def plan_interview(
    config: InterviewConfig,
    resume_data: dict,
    profile: Optional[CandidateProfile] = None,
    llm=generate_structured,
) -> EngineState:
    """Create the interview plan and the initial engine state for a new session."""
    plan = llm(
        build_planner_messages(config, resume_data, profile),
        InterviewPlan,
        model=settings.LLM_MODEL_PLANNER,
        temperature=0.4,
    )

    items = plan.items[: config.total_questions]
    if not items:
        raise LLMError("Planner returned an empty interview plan.")

    return EngineState(resume_brief=plan.resume_brief, plan=items)
