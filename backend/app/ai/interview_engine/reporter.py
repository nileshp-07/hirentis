from typing import List

from app.ai.interview_engine import prompts
from app.ai.interview_engine.schemas import InterviewConfig, ReportNarrative
from app.ai.llm.openai_client import generate_structured
from app.core.config import settings


def _lines(items: List[str]) -> str:
    return "\n".join(items) or "None"


def write_report_narrative(
    config: InterviewConfig,
    session_status: str,
    answered_count: int,
    scores: dict,
    topic_scores: dict,
    question_results: List[str],
    llm=generate_structured,
) -> ReportNarrative:
    """Write the report summary from results that were already scored."""
    messages = [
        {"role": "system", "content": prompts.REPORT_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": prompts.REPORT_USER_PROMPT.format(
                role=config.role,
                experience_level=config.experience_level or "Not specified",
                interview_type=config.interview_type,
                session_status=session_status,
                answered_count=answered_count,
                planned_questions=config.total_questions,
                overall_score=scores.get("overall_score"),
                technical_score=scores.get("technical_score"),
                communication_score=scores.get("communication_score"),
                problem_solving_score=scores.get("problem_solving_score"),
                confidence_score=scores.get("confidence_score"),
                topic_scores=_lines(
                    [f"- {topic}: {score}" for topic, score in topic_scores.items()]
                ),
                question_results=_lines(question_results),
            ),
        },
    ]
    return llm(
        messages,
        schema=ReportNarrative,
        model=settings.LLM_MODEL_REPORTER,
        temperature=0.3,
    )
