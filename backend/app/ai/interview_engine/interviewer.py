from typing import List, Optional, Set

from app.ai.interview_engine import prompts
from app.ai.interview_engine.context import build_interviewer_messages, format_actions
from app.ai.interview_engine.policy import (
    allowed_actions,
    apply_action,
    clamp_difficulty,
)
from app.ai.interview_engine.schemas import (
    Action,
    InterviewerResult,
    EngineState,
    InterviewConfig,
    InterviewerDecision,
    NextQuestion,
    AskedQuestion,
)
from app.ai.llm.openai_client import LLMError, generate_structured
from app.core.config import settings

SUMMARY_FALLBACK_CHARS = 200


def _invalid_reason(
    decision: InterviewerDecision, allowed: Set[Action]
) -> Optional[str]:
    if decision.action not in allowed:
        return f"action {decision.action.value} is not allowed"
    if decision.action != Action.END and not decision.question_text.strip():
        return "question_text is empty"
    return None


def _decide(llm, messages, allowed: Set[Action]) -> InterviewerDecision:
    """Ask the LLM for a decision, re-asking once if it breaks the rules."""
    call = dict(
        schema=InterviewerDecision,
        model=settings.LLM_MODEL_INTERVIEWER,
        temperature=0.4,
    )
    decision = llm(messages, **call)
    reason = _invalid_reason(decision, allowed)
    if reason is None:
        return decision

    retry_messages = messages + [
        {"role": "assistant", "content": decision.model_dump_json()},
        {
            "role": "user",
            "content": prompts.INVALID_DECISION_PROMPT.format(
                reason=reason, allowed_actions=format_actions(allowed)
            ),
        },
    ]
    decision = llm(retry_messages, **call)
    reason = _invalid_reason(decision, allowed)
    if reason is not None:
        raise LLMError(f"Interviewer returned an invalid decision: {reason}")
    return decision


def _record_answer_summary(
    state: EngineState, history: List[AskedQuestion], summary: str
) -> EngineState:
    if not history:
        return state
    last = history[-1]
    text = (
        summary.strip()
        or f"Answered: {last.answer_text.strip()[:SUMMARY_FALLBACK_CHARS]}"
    )
    updated = state.model_copy(deep=True)
    updated.running_summary.append(
        f"Q{len(history)} [{last.topic or 'general'}]: {text}"
    )
    return updated


def decide_next_question(
    config: InterviewConfig,
    state: EngineState,
    history: List[AskedQuestion],
    llm=generate_structured,
) -> InterviewerResult:
    """Choose and write the next question, or finish the interview.

    `history` is every question asked so far, oldest first; the latest one must be
    answered. Returns the next question plus the updated state to persist.
    """
    last = history[-1] if history else None
    if last is not None and not last.answer_text:
        raise ValueError("The latest question has not been answered yet.")

    allowed = allowed_actions(state, config, has_answer=last is not None)
    if allowed == {Action.END}:
        return InterviewerResult(question=None, state=state)

    messages = build_interviewer_messages(config, state, history, allowed)
    decision = _decide(
        llm, messages, allowed
    )  # Gets the next question and validates it.
    state = _record_answer_summary(
        state, history, decision.previous_answer_summary
    )  # update the running_summary for the EngineState

    if decision.action == Action.END:
        return InterviewerResult(question=None, state=state)

    state = apply_action(state, decision.action)  # Update the EngineState
    item = state.plan[state.plan_cursor]
    is_followup = decision.action == Action.FOLLOW_UP

    question = NextQuestion(
        question_text=decision.question_text.strip(),
        question_type=item.question_type,
        difficulty=clamp_difficulty(
            decision.difficulty,
            last.difficulty if last else None,
            config.experience_level,
        ),
        topic=item.topic,
        rubric=decision.rubric,
        is_followup=is_followup,
    )
    return InterviewerResult(question=question, state=state)
