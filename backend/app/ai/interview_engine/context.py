import json
from typing import Dict, List, Optional, Set

from app.ai.interview_engine import prompts
from app.ai.interview_engine.policy import (
    INTERVIEWER_NAME,
    followup_budget,
    includes_intro,
    planned_question_count,
)
from app.ai.interview_engine.schemas import (
    Action,
    CandidateProfile,
    EngineState,
    InterviewConfig,
    PlanItem,
    AskedQuestion,
)

RECENT_QUESTIONS = 3
MAX_ANSWER_CHARS = 4000
ACTION_ORDER = [Action.FOLLOW_UP, Action.REPHRASE, Action.NEXT_TOPIC, Action.END]

Message = Dict[str, str]


def _or_none(value: Optional[str]) -> str:
    return value.strip() if value and value.strip() else "None"


def format_candidate_answer(answer: str) -> str:
    # wrap the answer with candidate_answer tags so llm doesn't get confused which part is the answer
    safe = answer.replace("<candidate_answer>", "").replace("</candidate_answer>", "")
    return f"<candidate_answer>\n{safe[:MAX_ANSWER_CHARS]}\n</candidate_answer>"


def _format_plan_item(item: Optional[PlanItem]) -> str:
    if item is None:
        return "None"
    anchor = f" [mention: {item.anchor}]" if item.anchor else ""
    return (
        f"{item.topic} ({item.question_type}, {item.difficulty}) - {item.focus}{anchor}"
    )


def _format_profile(profile: Optional[CandidateProfile]) -> str:
    filled = profile.model_dump(exclude_defaults=True) if profile else {}
    return json.dumps(filled, indent=2) if filled else "None"


def build_planner_messages(
    config: InterviewConfig,
    resume_data: dict,
    profile: Optional[CandidateProfile] = None,
    practice_history: Optional[str] = None,
) -> List[Message]:
    return [
        {"role": "system", "content": prompts.PLANNER_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": prompts.PLANNER_USER_PROMPT.format(
                total_questions=config.total_questions,
                include_intro="yes" if includes_intro(config) else "no",
                role=config.role,
                experience_level=_or_none(config.experience_level),
                interview_type=config.interview_type,
                tech_stack=", ".join(config.tech_stack) or "None",
                job_description=_or_none(config.job_description),
                resume_data=json.dumps(resume_data or {}, indent=2),
                profile=_format_profile(profile),
                practice_history=_or_none(practice_history),
            ),
        },
    ]


def build_interviewer_messages(
    config: InterviewConfig,
    state: EngineState,
    history: List[AskedQuestion],
    allowed: Set[Action],
) -> List[Message]:
    plan_text = "\n".join(
        f"{i + 1}. {_format_plan_item(item)}" for i, item in enumerate(state.plan)
    )
    context = prompts.INTERVIEW_CONTEXT_PROMPT.format(
        role=config.role,
        experience_level=_or_none(config.experience_level),
        interview_type=config.interview_type,
        tech_stack=", ".join(config.tech_stack) or "None",
        job_description=_or_none(config.job_description),
        planned_questions=planned_question_count(state, config),
        resume_brief=_or_none(state.resume_brief),
        plan=plan_text or "None",
    )

    recent = []
    for asked in history[
        -RECENT_QUESTIONS:
    ]:  # Find last RECENT_QUESTIONS questions and answers and format them
        kind = "Follow-up" if asked.is_followup else "Question"
        answer = (
            format_candidate_answer(asked.answer_text)
            if asked.answer_text
            else "(not answered yet)"
        )
        recent.append(
            f"{kind} [{asked.topic or 'general'}]: {asked.question_text}\n{answer}"
        )

    # Question [Redis]: What is Redis?
    # <candidate_answer>
    #   Redis is an in-memory data store.
    # </candidate_answer>

    current = (
        state.plan[state.plan_cursor]
        if 0 <= state.plan_cursor < len(state.plan)
        else None
    )
    upcoming_index = state.plan_cursor + 1
    upcoming = state.plan[upcoming_index] if upcoming_index < len(state.plan) else None

    answered = history[-1] if history and history[-1].answer_text else None

    progress_text = prompts.PROGRESS_PROMPT.format(
        main_questions_asked=state.main_questions_asked,
        planned_questions=planned_question_count(state, config),
        running_summary="\n".join(state.running_summary) or "None",
        recent_questions="\n\n".join(recent) or "None (this is the first question)",
        current_topic=_format_plan_item(current),
        next_topic=_format_plan_item(upcoming),
        last_key_points=", ".join(answered.key_points) if answered else "None",
        followups_total=state.followups_total,
        followup_budget=followup_budget(config),
        clarifications_used=state.clarifications_used,
        followup_used="yes" if state.followup_used else "no",
        allowed_actions=format_actions(allowed),
        summary_instruction=(
            prompts.SUMMARY_REQUIRED
            if history and history[-1].answer_text
            else prompts.SUMMARY_NOT_NEEDED
        ),
        opening_instruction="" if history else prompts.OPENING_INSTRUCTION,
    )

    return [
        {
            "role": "system",
            "content": prompts.INTERVIEWER_SYSTEM_PROMPT.format(
                interviewer_name=INTERVIEWER_NAME
            ),
        },
        {"role": "user", "content": context},
        {"role": "user", "content": progress_text},
    ]


def format_actions(allowed: Set[Action]) -> str:
    return ", ".join(a.value for a in ACTION_ORDER if a in allowed)


def build_closing_messages(
    config: InterviewConfig, state: EngineState
) -> List[Message]:
    return [
        {
            "role": "system",
            "content": prompts.CLOSING_SYSTEM_PROMPT.format(
                interviewer_name=INTERVIEWER_NAME
            ),
        },
        {
            "role": "user",
            "content": prompts.CLOSING_USER_PROMPT.format(
                role=config.role,
                running_summary="\n".join(state.running_summary) or "None",
            ),
        },
    ]
