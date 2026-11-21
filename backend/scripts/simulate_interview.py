import sys

from app.ai.interview_engine import (
    AskedQuestion,
    InterviewConfig,
    decide_next_question,
    evaluate_answer,
    plan_interview,
)
from app.ai.llm.openai_client import generate_text

RESUME = {
    "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Celery"],
    "experience_years": 2,
    "summary": "Backend developer with 2 years building APIs and async job pipelines.",
    "work_experience": [
        {
            "company": "Finlytics",
            "role": "Backend Developer",
            "duration": "2 years",
            "description": "Built FastAPI services for a payments dashboard, added "
            "Redis caching that cut p95 latency from 900ms to 250ms, moved report "
            "generation to Celery workers.",
        }
    ],
    "projects": [
        {
            "title": "AI Chatbot",
            "description": "RAG assistant over company docs using embeddings and pgvector",
            "technologies": ["Python", "FastAPI", "pgvector"],
        },
        {
            "title": "Ecommerce API",
            "description": "Order and inventory service with JWT auth",
            "technologies": ["FastAPI", "PostgreSQL"],
        },
    ],
}
CONFIG = InterviewConfig(
    role="Backend Developer",
    experience_level="2 years",
    interview_type="TECHNICAL",
    tech_stack=["Python", "FastAPI", "PostgreSQL", "Redis"],
    job_description="Build and scale REST APIs and background job systems.",
    total_questions=6,
)

BEHAVIOURS = [
    "Introduce yourself naturally in about 50 words.",
    "Answer well: about 90 words, a concrete example from your work, mention a trade-off.",
    "Sorry, could you repeat that? I'm not sure what you're asking.",
    "Answer well: about 80 words with a concrete example.",
    "Give a thin answer of about 15 words that names a buzzword and explains nothing.",
    "You are nervous and don't really know. Say so in 1-2 flustered sentences.",
    "Say you honestly don't know this one but think it through out loud in 2 sentences.",
    "Tell a short story about a real mistake you made: situation, what YOU did, the "
    "result, and what you learned, about 100 words.",
    "Answer very well: about 100 words with a concrete example and a trade-off.",
    "Answer well: about 80 words.",
]
MAX_TURNS = 14


def candidate_says(question: str, behaviour: str) -> str:
    if behaviour.startswith("Sorry"):
        return behaviour
    return generate_text(
        [
            {
                "role": "system",
                "content": "You are a job candidate in a spoken interview: a backend "
                "developer with 2 years' experience (Finlytics, FastAPI, Redis, Celery). "
                "Reply with only your spoken answer, no quotes.",
            },
            {
                "role": "user",
                "content": f"Interviewer said: {question}\n\nHow to answer: {behaviour}",
            },
        ],
        temperature=0.8,
        max_tokens=300,
    ).strip()


def main() -> None:
    state = plan_interview(CONFIG, RESUME)
    print("PLAN")
    for i, item in enumerate(state.plan, 1):
        print(f"  {i}. [{item.question_type}/{item.difficulty}] {item.topic}")
        print(f"       focus: {item.focus}\n       anchor: {item.anchor or '-'}")
    print()

    history: list[AskedQuestion] = []
    rubrics: list[dict] = []
    result = decide_next_question(CONFIG, state, history)
    state = result.state
    turn = 0

    while result.question is not None and turn < MAX_TURNS:
        q = result.question
        behaviour = BEHAVIOURS[min(turn, len(BEHAVIOURS) - 1)]
        answer = candidate_says(q.question_text, behaviour)
        kind = (
            "REPHRASED"
            if q.is_rephrase
            else "FOLLOW-UP"
            if q.is_followup
            else "question"
        )
        print(f"--- {turn + 1}. {kind} | {q.topic} | {q.question_type} {q.difficulty}")
        print(f"INTERVIEWER: {q.question_text}")
        print(f"CANDIDATE:   {answer}\n")
        sys.stdout.flush()

        if q.is_rephrase and history and history[-1].answer_text is None:
            # The reworded question replaces the one just asked
            history[-1].question_text = q.question_text
        else:
            history.append(
                AskedQuestion(
                    question_text=q.question_text,
                    topic=q.topic,
                    difficulty=q.difficulty,
                    is_followup=q.is_followup,
                    key_points=q.rubric.key_points,
                )
            )
            rubrics.append(q.rubric.model_dump())
        history[-1].answer_text = answer

        result = decide_next_question(CONFIG, state, history)
        state = result.state
        if result.question is not None and result.question.is_rephrase:
            history[-1].answer_text = None  # the question is asked again
        turn += 1

    print("=" * 70)
    print("CLOSING:", state.closing_message or "(interview did not finish)")
    print(
        f"follow-ups used: {state.followups_total}, questions asked: {len(history)}\n"
    )

    print("SCORING")
    for asked, rubric in zip(history, rubrics):
        if not asked.answer_text or asked.answer_text.startswith("Sorry, could"):
            continue
        scored = evaluate_answer(
            CONFIG,
            asked.question_text,
            asked.answer_text,
            rubric=rubric,
            topic=asked.topic,
            difficulty=asked.difficulty,
            question_type="FOLLOWUP" if asked.is_followup else "TECHNICAL",
        )
        covered = sum(1 for c in scored.point_checks if c.covered)
        print(
            f"- {asked.topic}: {scored.score}/10 | covered {covered}/{len(scored.point_checks)}"
            f" | confidence {scored.confidence_score}"
        )
        print(f"    answer:   {asked.answer_text[:110]}")
        print(f"    feedback: {scored.feedback}")


if __name__ == "__main__":
    main()
