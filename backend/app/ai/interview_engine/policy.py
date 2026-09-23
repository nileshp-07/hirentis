import re
from typing import Optional, Set, Tuple

from app.ai.interview_engine.schemas import (
    Action,
    Difficulty,
    EngineState,
    InterviewConfig,
)

DIFFICULTY_ORDER = ["EASY", "MEDIUM", "HARD"]
# One follow-up per this many main questions
FOLLOWUP_RATIO = 3
THIN_ANSWER_WORDS = 25


def planned_question_count(state: EngineState, config: InterviewConfig) -> int:
    return min(config.total_questions, len(state.plan))


def followup_budget(config: InterviewConfig) -> int:
    """Follow-ups allowed in the whole interview: roughly one per three questions."""
    return max(1, round(config.total_questions / FOLLOWUP_RATIO))


def invites_followup(answer_text: Optional[str]) -> bool:
    return bool(answer_text) and len(answer_text.split()) <= THIN_ANSWER_WORDS


def allowed_actions(
    state: EngineState,
    config: InterviewConfig,
    has_answer: bool,
    last_answer: Optional[str] = None,
) -> Set[Action]:
    """Actions the interviewer may take next.

    - First question: always the first plan topic.
    - Follow-ups: only after a short answer, at most one per main question, and
      only while the interview's follow-up budget is left.
    - END only once every planned main question has been asked.
    """
    if state.main_questions_asked == 0:
        return {Action.NEXT_TOPIC}

    allowed: Set[Action] = set()
    has_followup_budget = state.followups_total < followup_budget(config)
    if (
        has_answer
        and not state.followup_used
        and has_followup_budget
        and invites_followup(last_answer)
    ):
        allowed.add(Action.FOLLOW_UP)

    if state.main_questions_asked < planned_question_count(state, config):
        allowed.add(Action.NEXT_TOPIC)
    else:
        allowed.add(Action.END)

    return allowed


def difficulty_bounds(experience_level: Optional[str]) -> Tuple[str, str]:
    """Allowed difficulty range for an experience level such as "3-5 years"."""
    match = re.search(r"\d+", experience_level or "")
    if not match:
        return "EASY", "HARD"
    years = int(match.group())
    if years < 2:
        return "EASY", "MEDIUM"
    if years < 5:
        return "EASY", "HARD"
    return "MEDIUM", "HARD"


def clamp_difficulty(
    requested: Difficulty,
    previous: Optional[Difficulty],
    experience_level: Optional[str],
) -> Difficulty:
    """Keep difficulty within the level's range and move at most one step per question."""
    low, high = (DIFFICULTY_ORDER.index(d) for d in difficulty_bounds(experience_level))
    index = DIFFICULTY_ORDER.index(requested)

    if previous is not None:
        prev = DIFFICULTY_ORDER.index(previous)
        index = max(prev - 1, min(prev + 1, index))

    return DIFFICULTY_ORDER[max(low, min(high, index))]


def apply_action(state: EngineState, action: Action) -> EngineState:
    """Advance the engine state after a question is chosen."""
    updated = state.model_copy(deep=True)
    if action == Action.NEXT_TOPIC:
        updated.plan_cursor += 1
        updated.main_questions_asked += 1
        updated.followup_used = False
    elif action == Action.FOLLOW_UP:
        updated.followup_used = True
        updated.followups_total += 1
    return updated
