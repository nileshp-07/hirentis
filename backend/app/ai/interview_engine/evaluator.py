from typing import List, Optional

from app.ai.interview_engine import prompts
from app.ai.interview_engine.context import format_candidate_answer
from app.ai.interview_engine.schemas import AnswerEvaluation, InterviewConfig
from app.ai.llm.openai_client import generate_structured
from app.core.config import settings


def _bullets(items: Optional[List[str]]) -> str:
    return "\n".join(f"- {item}" for item in items or []) or "None"


def evaluate_answer(
    config: InterviewConfig,
    question_text: str,
    answer_text: str,
    rubric: Optional[dict] = None,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    llm=generate_structured,
) -> AnswerEvaluation:
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
                difficulty=difficulty or "MEDIUM",
                question_text=question_text,
                key_points=_bullets(rubric.get("key_points")),
                good_answer_signals=_bullets(rubric.get("good_answer_signals")),
                red_flags=_bullets(rubric.get("red_flags")),
                answer=format_candidate_answer(answer_text),
            ),
        },
    ]
    return llm(
        messages,
        schema=AnswerEvaluation,
        model=settings.LLM_MODEL_EVALUATOR,
        temperature=0,
    )
