import re
from typing import Optional, Set, Tuple

from app.ai.interview_engine.schemas import (
    Action,
    Difficulty,
    EngineState,
    InterviewConfig,
)

INTERVIEWER_NAME = "Alex"

DIFFICULTY_ORDER = ["EASY", "MEDIUM", "HARD"]
FOLLOWUP_SHARE = 0.4
MIN_MAIN_QUESTIONS_BEFORE_FOLLOWUP = 2
MAX_CLARIFICATIONS = 2
MIN_QUESTIONS_FOR_INTRO = 4


def planned_question_count(state: EngineState, config: InterviewConfig) -> int:
    return min(config.total_questions, len(state.plan))


def followup_budget(config: InterviewConfig) -> int:
    """Follow-ups allowed in the whole interview: about two per five questions."""
    return max(1, round(config.total_questions * FOLLOWUP_SHARE))


def includes_intro(config: InterviewConfig) -> bool:
    return config.total_questions >= MIN_QUESTIONS_FOR_INTRO


def allowed_actions(
    state: EngineState,
    config: InterviewConfig,
    has_answer: bool,
) -> Set[Action]:
    """Actions the interviewer may take next.

    - First question: always the first plan topic.
    - Follow-ups: at most one per main question, not on the warm-up, and only
      while the interview's follow-up budget is left. Whether an answer earns one
      is the interviewer's call, based on what was said and not on how long it was.
    - REPHRASE: while the question has been repeated fewer than the limit.
    - END only once every planned main question has been asked.
    """
    if state.main_questions_asked == 0:
        return {Action.NEXT_TOPIC}

    allowed: Set[Action] = set()
    if (
        has_answer
        and not state.followup_used
        and state.main_questions_asked >= MIN_MAIN_QUESTIONS_BEFORE_FOLLOWUP
        and state.followups_total < followup_budget(config)
    ):
        allowed.add(Action.FOLLOW_UP)

    if has_answer and state.clarifications_used < MAX_CLARIFICATIONS:
        allowed.add(Action.REPHRASE)

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
        updated.clarifications_used = 0
    elif action == Action.FOLLOW_UP:
        updated.followup_used = True
        updated.followups_total += 1
        updated.clarifications_used = 0
    elif action == Action.REPHRASE:
        updated.clarifications_used += 1
    return updated
