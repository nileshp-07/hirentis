from typing import List, Optional, Tuple

from app.ai.interview_engine import prompts
from app.ai.interview_engine.context import format_candidate_answer
from app.ai.interview_engine.schemas import AnswerEvaluation, InterviewConfig
from app.ai.llm.openai_client import generate_structured
from app.core.config import settings

BAND_BELOW, BAND_ABOVE = 1.5, 1.0
MIN_EXPECTED, MAX_EXPECTED = 1.5, 8.5
ANCHORED_FIELDS = ("score", "technical_score")


def _bullets(items: Optional[List[str]]) -> str:
    return "\n".join(f"- {item}" for item in items or []) or "None"


def coverage(evaluation: AnswerEvaluation) -> Optional[float]:
    """Share of key points covered, counting only points backed by a quote."""
    if not evaluation.point_checks:
        return None
    covered = sum(
        1
        for check in evaluation.point_checks
        if check.covered and check.evidence.strip()
    )
    return covered / len(evaluation.point_checks)


def anchor_scores(evaluation: AnswerEvaluation) -> AnswerEvaluation:
    """Keep the overall and technical scores near what the key points covered imply.

    The model sometimes scores an answer that covers every key point at 5, or one
    that covers none at 6. The per-point checks come with quotes and are far more
    reliable than the single number, so the number may only drift within a band.
    """
    ratio = coverage(evaluation)
    if ratio is None:
        return evaluation

    expected = MIN_EXPECTED + (MAX_EXPECTED - MIN_EXPECTED) * ratio
    low, high = max(0.0, expected - BAND_BELOW), min(10.0, expected + BAND_ABOVE)
    changes = {
        field: round(min(high, max(low, getattr(evaluation, field))), 1)
        for field in ANCHORED_FIELDS
    }
    return evaluation.model_copy(update=changes)


def _earlier_exchange(earlier: Optional[Tuple[str, str]]) -> str:
    if not earlier:
        return ""
    question, answer = earlier
    return (
        "\n"
        + prompts.EARLIER_EXCHANGE.format(
            question=question, answer=format_candidate_answer(answer)
        )
        + "\n"
    )


def evaluate_answer(
    config: InterviewConfig,
    question_text: str,
    answer_text: str,
    rubric: Optional[dict] = None,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    earlier: Optional[Tuple[str, str]] = None,
    llm=generate_structured,
) -> AnswerEvaluation:
    """Score one answer. `earlier` is the (question, answer) a follow-up builds on."""
    rubric = rubric or {}
    messages = [
        {"role": "system", "content": prompts.EVALUATOR_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": prompts.EVALUATOR_USER_PROMPT.format(
                role=config.role,
                experience_level=config.experience_level or "Not specified",
                interview_type=config.interview_type,
                topic=topic or "general",
                question_type=question_type or config.interview_type,
                difficulty=difficulty or "MEDIUM",
                question_text=question_text,
                earlier_exchange=_earlier_exchange(earlier),
                key_points=_bullets(rubric.get("key_points")),
                good_answer_signals=_bullets(rubric.get("good_answer_signals")),
                red_flags=_bullets(rubric.get("red_flags")),
                answer=format_candidate_answer(answer_text),
            ),
        },
    ]
    evaluation = llm(
        messages,
        schema=AnswerEvaluation,
        model=settings.LLM_MODEL_EVALUATOR,
        temperature=0,
    )
    return anchor_scores(evaluation)
