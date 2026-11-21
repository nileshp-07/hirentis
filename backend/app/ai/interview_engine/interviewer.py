import logging
import re
from typing import List, Optional, Set

from app.ai.interview_engine import prompts
from app.ai.interview_engine.context import (
    build_closing_messages,
    build_interviewer_messages,
    format_actions,
)
from app.ai.interview_engine.policy import (
    allowed_actions,
    apply_action,
    clamp_difficulty,
)
from app.ai.interview_engine.schemas import (
    Action,
    AnswerQuality,
    AnswerType,
    AskedQuestion,
    ClosingMessage,
    EngineState,
    InterviewConfig,
    InterviewerDecision,
    InterviewerResult,
    NextQuestion,
    Rubric,
)
from app.ai.llm.openai_client import LLMError, generate_structured
from app.core.config import settings

logger = logging.getLogger(__name__)

SUMMARY_FALLBACK_CHARS = 200
MAX_KEY_POINTS = 5
FALLBACK_CLOSING = (
    "That's everything from me. Thanks so much for talking it through today. "
    "Your detailed report will be ready in a moment."
)

JUDGING_WORDS = re.compile(
    r"\b(great|good|excellent|perfect|correct|incorrect|wrong|exactly|impressive|"
    r"nice|solid|well done|awesome|fantastic|brilliant|right answer|spot on|"
    r"informative|insightful|insights?)\b",
    re.IGNORECASE,
)
STOCK_PHRASES = re.compile(
    r"(thanks? (you )?for sharing|thank you for (that|your)|i appreciate|"
    r"let'?s (move on|shift|turn|switch|dive|talk about|change gears)|(change|changing) gears|moving on|"
    r"(that'?s|that is) (interesting|helpful|insightful))",
    re.IGNORECASE,
)
OPENING_WORDS = 2
REPHRASABLE = {AnswerType.CLARIFICATION_REQUEST, AnswerType.UNCLEAR}
NO_FOLLOWUP_ANSWERS = {
    AnswerType.DONT_KNOW,
    AnswerType.UNCLEAR,
    AnswerType.OFF_TOPIC,
    AnswerType.CLARIFICATION_REQUEST,
}


def _plain(text: str) -> str:
    """Straight apostrophes, so "Let\u2019s" matches "let's"."""
    return text.replace("\u2019", "'").replace("\u2018", "'")


def _sentences(text: str) -> List[str]:
    return [part for part in re.split(r"(?<=[.!?])\s+", text.strip()) if part]


def _opening(text: str) -> str:
    words = re.findall(r"[a-z']+", _plain(text).lower())
    return " ".join(words[:OPENING_WORDS])


# Sentences of lead-in: a greeting needs room, a reaction is one short line
GREETING_SENTENCES = 3
REPHRASE_SENTENCES = 2
REACTION_SENTENCES = 1


def clean_decision(
    decision: InterviewerDecision, is_first: bool = False
) -> InterviewerDecision:
    """Fix wording slips in code, so the candidate never hears them.

    - The lead-in is a statement; a question in it is dropped (the model sometimes
      asks the question there and then asks it again), and it is kept short.
    - A question repeated twice becomes one, and two different questions become the
      first one.
    """
    if decision.action == Action.END:
        return decision

    limit = (
        GREETING_SENTENCES
        if is_first
        else REPHRASE_SENTENCES
        if decision.action == Action.REPHRASE
        else REACTION_SENTENCES
    )
    statements = [s for s in _sentences(decision.reaction) if "?" not in s]
    reaction = " ".join(statements[:limit])

    seen, kept = set(), []
    for sentence in _sentences(decision.question_text):
        key = re.sub(r"\W+", " ", sentence.lower()).strip()
        if key not in seen:
            seen.add(key)
            kept.append(sentence)
    question = " ".join(kept)
    if question.count("?") > 1:
        question = question[: question.index("?") + 1]

    return decision.model_copy(update={"reaction": reaction, "question_text": question})


def _invalid_reason(
    decision: InterviewerDecision, allowed: Set[Action], has_answer: bool
) -> Optional[str]:
    """Rule breaks that cannot be repaired in code."""
    if decision.action not in allowed:
        return f"action {decision.action.value} is not allowed"
    if decision.action == Action.END:
        return None

    if not decision.question_text.strip():
        return "question_text is empty"

    if decision.action == Action.FOLLOW_UP:
        if not decision.followup_reason.strip():
            return "followup_reason is empty; a follow-up must name what it probes"
        if decision.answer_type in NO_FOLLOWUP_ANSWERS:
            return (
                f"a {decision.answer_type.value} answer cannot get a follow-up; "
                "use NEXT_TOPIC or REPHRASE"
            )
    if decision.action == Action.REPHRASE and decision.answer_type not in REPHRASABLE:
        return "REPHRASE is only for CLARIFICATION_REQUEST or UNCLEAR answers"
    if (
        has_answer
        and decision.answer_type in REPHRASABLE
        and Action.REPHRASE in allowed
        and decision.action != Action.REPHRASE
    ):
        return (
            "the candidate asked for the question again or was not understood; "
            "use REPHRASE"
        )
    return None


def _style_problem(
    decision: InterviewerDecision, history: List[AskedQuestion]
) -> Optional[str]:
    """Things worth one retry, but never worth failing the interview over."""
    if decision.action == Action.END:
        return None
    reaction = _plain(decision.reaction)
    if JUDGING_WORDS.search(reaction):
        return (
            "the reaction judges the answer (for example 'great' or 'correct'); "
            "acknowledge what was said without rating it"
        )
    if STOCK_PHRASES.search(reaction):
        return (
            "the reaction uses a stock phrase ('thanks for sharing', 'let's move "
            "on'); react to one specific thing the candidate said instead"
        )
    recent = [asked.question_text for asked in history[-2:]]
    if decision.reaction and _opening(decision.reaction) in {
        _opening(text) for text in recent
    }:
        return "the reaction starts with the same words as a recent turn; vary it"
    if (
        decision.action == Action.FOLLOW_UP
        and decision.answer_quality == AnswerQuality.STRONG
        and not decision.missing_key_points
    ):
        return (
            "the answer was strong and complete; save the follow-up for a weaker "
            "answer and move to the next topic"
        )
    return None


def _decide(
    llm,
    messages,
    allowed: Set[Action],
    history: List[AskedQuestion],
) -> InterviewerDecision:
    """Ask the LLM for a decision, re-asking once if it breaks a rule."""
    call = dict(
        schema=InterviewerDecision,
        model=settings.LLM_MODEL_INTERVIEWER,
        temperature=0.7,
    )
    has_answer = bool(history)
    is_first = not history
    decision = clean_decision(llm(messages, **call), is_first)
    reason = _invalid_reason(decision, allowed, has_answer) or _style_problem(
        decision, history
    )
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
    decision = clean_decision(llm(retry_messages, **call), is_first)
    reason = _invalid_reason(decision, allowed, has_answer)
    if reason is not None:
        raise LLMError(f"Interviewer returned an invalid decision: {reason}")
    plain = _plain(decision.reaction)
    if JUDGING_WORDS.search(plain) or STOCK_PHRASES.search(plain):
        # Still not right after a retry: say nothing extra rather than say it wrong
        decision = decision.model_copy(update={"reaction": ""})
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


def _trim_rubric(rubric: Rubric) -> Rubric:
    return rubric.model_copy(update={"key_points": rubric.key_points[:MAX_KEY_POINTS]})


def _spoken(decision: InterviewerDecision) -> str:
    """What the interviewer says: the lead-in, then the question."""
    return f"{decision.reaction.strip()} {decision.question_text.strip()}".strip()


def write_closing(
    config: InterviewConfig, state: EngineState, llm=generate_structured
) -> str:
    """The interviewer's goodbye. Never fails the interview: falls back to fixed words."""
    try:
        closing = llm(
            build_closing_messages(config, state),
            ClosingMessage,
            model=settings.LLM_MODEL_INTERVIEWER,
            temperature=0.7,
        )
    except LLMError as e:
        logger.warning(f"Could not write the closing words: {e}")
        return FALLBACK_CLOSING
    message = closing.message.strip()
    if not message or JUDGING_WORDS.search(_plain(message)):
        return FALLBACK_CLOSING
    return message


def _finish(config: InterviewConfig, state: EngineState, llm) -> InterviewerResult:
    state = state.model_copy(deep=True)
    state.closing_message = write_closing(config, state, llm=llm)
    return InterviewerResult(question=None, state=state)


def decide_next_question(
    config: InterviewConfig,
    state: EngineState,
    history: List[AskedQuestion],
    llm=generate_structured,
) -> InterviewerResult:
    """Choose and write the next question, or finish the interview.

    `history` is every question asked so far, oldest first; the latest one must be
    answered. Returns the next question plus the updated state to persist. When the
    candidate asked for the question again or could not be understood, the result is
    the same question reworded (`is_rephrase`) and nothing else changes.
    """
    last = history[-1] if history else None
    if last is not None and not last.answer_text:
        raise ValueError("The latest question has not been answered yet.")

    allowed = allowed_actions(state, config, has_answer=last is not None)
    messages = build_interviewer_messages(config, state, history, allowed)
    decision = _decide(llm, messages, allowed, history)

    if decision.action == Action.REPHRASE:
        # Not a real answer: leave the summary and the plan alone
        state = apply_action(state, Action.REPHRASE)
        item = state.plan[state.plan_cursor]
        question = NextQuestion(
            question_text=_spoken(decision),
            question_type=item.question_type,
            difficulty=last.difficulty or item.difficulty,
            topic=item.topic,
            rubric=_trim_rubric(decision.rubric),
            is_followup=last.is_followup,
            is_rephrase=True,
        )
        return InterviewerResult(question=question, state=state)

    state = _record_answer_summary(state, history, decision.previous_answer_summary)

    if decision.action == Action.END:
        return _finish(config, state, llm)

    state = apply_action(state, decision.action)
    item = state.plan[state.plan_cursor]
    is_followup = decision.action == Action.FOLLOW_UP

    question = NextQuestion(
        question_text=_spoken(decision),
        question_type=item.question_type,
        difficulty=clamp_difficulty(
            decision.difficulty,
            last.difficulty if last else None,
            config.experience_level,
        ),
        topic=item.topic,
        rubric=_trim_rubric(decision.rubric),
        is_followup=is_followup,
    )
    return InterviewerResult(question=question, state=state)
