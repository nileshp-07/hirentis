"""Tests for the interview engine's rules. A fake model stands in for the LLM, so
they run instantly and cost nothing:  python -m unittest discover tests
"""

import unittest
from types import SimpleNamespace

from app.ai.interview_engine import (
    AskedQuestion,
    EngineState,
    InterviewConfig,
    decide_next_question,
    plan_interview,
)
from app.ai.interview_engine.evaluator import anchor_scores
from app.ai.interview_engine.interviewer import FALLBACK_CLOSING
from app.ai.interview_engine.policy import (
    allowed_actions,
    apply_action,
    followup_budget,
)
from app.ai.interview_engine.schemas import (
    Action,
    AnswerEvaluation,
    AnswerQuality,
    AnswerType,
    ClosingMessage,
    InterviewerDecision,
    InterviewPlan,
    PlanItem,
    PlannedItem,
    PointCheck,
    Rubric,
)
from app.ai.llm.openai_client import LLMError
from app.models.interview_question import QuestionDifficulty, QuestionType
from app.services.report_service import aggregate_scores

CONFIG = InterviewConfig(
    role="Backend Developer",
    experience_level="2 years",
    interview_type="TECHNICAL",
    tech_stack=["Python", "Redis"],
    total_questions=5,
)
RUBRIC = Rubric(
    key_points=["TTL", "Invalidate on write", "Trade-offs"],
    good_answer_signals=["Concrete example"],
    red_flags=["Never stale"],
)


def plan_item(topic, anchor=""):
    return PlanItem(
        topic=topic,
        question_type="TECHNICAL",
        difficulty="MEDIUM",
        focus="focus",
        anchor=anchor,
    )


def state(asked=1, followups=0, followup_used=False, clarifications=0):
    return EngineState(
        resume_brief="brief",
        plan=[plan_item(f"Topic {i}") for i in range(5)],
        plan_cursor=asked - 1,
        main_questions_asked=asked,
        followups_total=followups,
        followup_used=followup_used,
        clarifications_used=clarifications,
    )


def decision(**overrides):
    values = dict(
        previous_answer_summary="The candidate answered.",
        answer_type=AnswerType.ANSWER,
        answer_quality=AnswerQuality.OK,
        missing_key_points=["Trade-offs"],
        action=Action.NEXT_TOPIC,
        followup_reason="",
        reaction="Okay, a five-minute TTL.",
        question_text="How would you invalidate it?",
        difficulty="MEDIUM",
        rubric=RUBRIC,
    )
    values.update(overrides)
    return InterviewerDecision(**values)


class FakeLLM:
    """Returns queued replies in order and records every call."""

    def __init__(self, *replies):
        self.replies = list(replies)
        self.calls = []

    def __call__(self, messages, schema=None, **kwargs):
        self.calls.append(schema)
        reply = self.replies.pop(0)
        if isinstance(reply, Exception):
            raise reply
        return reply


def history(
    answer="I used a TTL and deleted the key on write because reports rarely change.",
):
    return [
        AskedQuestion(
            question_text="Tell me about caching.",
            topic="Topic 0",
            difficulty="MEDIUM",
            answer_text=answer,
            key_points=RUBRIC.key_points,
        )
    ]


class PolicyTests(unittest.TestCase):
    def test_first_question_is_always_the_first_topic(self):
        fresh = state(asked=0)
        fresh.plan_cursor = -1
        self.assertEqual(
            allowed_actions(fresh, CONFIG, has_answer=False), {Action.NEXT_TOPIC}
        )

    def test_follow_up_does_not_depend_on_answer_length(self):
        actions = allowed_actions(state(asked=2), CONFIG, has_answer=True)
        self.assertIn(Action.FOLLOW_UP, actions)

    def test_no_follow_up_on_the_warm_up_question(self):
        actions = allowed_actions(state(asked=1), CONFIG, has_answer=True)
        self.assertNotIn(Action.FOLLOW_UP, actions)

    def test_follow_up_limits(self):
        self.assertNotIn(
            Action.FOLLOW_UP,
            allowed_actions(state(asked=3, followup_used=True), CONFIG, True),
        )
        self.assertNotIn(
            Action.FOLLOW_UP,
            allowed_actions(
                state(asked=3, followups=followup_budget(CONFIG)), CONFIG, True
            ),
        )

    def test_rephrase_stops_after_two_tries(self):
        self.assertIn(Action.REPHRASE, allowed_actions(state(asked=2), CONFIG, True))
        self.assertNotIn(
            Action.REPHRASE,
            allowed_actions(state(asked=2, clarifications=2), CONFIG, True),
        )

    def test_end_only_after_all_main_questions(self):
        self.assertIn(Action.END, allowed_actions(state(asked=5), CONFIG, True))
        self.assertNotIn(Action.END, allowed_actions(state(asked=4), CONFIG, True))

    def test_state_resets_per_question(self):
        s = apply_action(state(asked=2, clarifications=1), Action.NEXT_TOPIC)
        self.assertEqual(s.clarifications_used, 0)
        s = apply_action(state(asked=2), Action.REPHRASE)
        self.assertEqual((s.clarifications_used, s.plan_cursor), (1, 1))


class InterviewerTests(unittest.TestCase):
    def test_reaction_and_question_are_spoken_together(self):
        llm = FakeLLM(decision())
        result = decide_next_question(CONFIG, state(asked=2), history(), llm=llm)
        self.assertEqual(
            result.question.question_text,
            "Okay, a five-minute TTL. How would you invalidate it?",
        )
        self.assertEqual(result.state.main_questions_asked, 3)
        self.assertEqual(len(result.state.running_summary), 1)

    def test_judging_the_answer_is_retried(self):
        llm = FakeLLM(decision(reaction="Great answer!"), decision())
        result = decide_next_question(CONFIG, state(asked=2), history(), llm=llm)
        self.assertEqual(len(llm.calls), 2)
        self.assertNotIn("Great", result.question.question_text)

    def test_a_question_may_contain_the_word_good(self):
        llm = FakeLLM(decision(question_text="What makes a good cache key?"))
        decide_next_question(CONFIG, state(asked=2), history(), llm=llm)
        self.assertEqual(len(llm.calls), 1)

    def test_two_questions_become_the_first_one(self):
        two = decision(question_text="What is a TTL? And why use one?")
        result = decide_next_question(
            CONFIG, state(asked=2), history(), llm=FakeLLM(two)
        )
        self.assertEqual(
            result.question.question_text, "Okay, a five-minute TTL. What is a TTL?"
        )

    def test_a_repeated_question_is_said_once(self):
        twice = decision(
            reaction="",
            question_text="What was your role? What was your role?",
        )
        result = decide_next_question(
            CONFIG, state(asked=2), history(), llm=FakeLLM(twice)
        )
        self.assertEqual(result.question.question_text, "What was your role?")

    def test_a_question_in_the_lead_in_is_dropped(self):
        asked_early = decision(
            reaction="You used Redis. What was your role?",
            question_text="What was your role?",
        )
        result = decide_next_question(
            CONFIG, state(asked=2), history(), llm=FakeLLM(asked_early)
        )
        self.assertEqual(
            result.question.question_text, "You used Redis. What was your role?"
        )
        self.assertEqual(result.question.question_text.count("?"), 1)

    def test_stock_phrases_are_retried(self):
        stock = decision(reaction="Thanks for sharing that!")
        llm = FakeLLM(stock, decision())
        decide_next_question(CONFIG, state(asked=2), history(), llm=llm)
        self.assertEqual(len(llm.calls), 2)

    def test_a_judging_reaction_is_dropped_after_one_retry(self):
        judging = decision(reaction="Great answer!")
        llm = FakeLLM(judging, judging)
        result = decide_next_question(CONFIG, state(asked=2), history(), llm=llm)
        self.assertEqual(len(llm.calls), 2)
        self.assertEqual(result.question.question_text, "How would you invalidate it?")

    def test_the_same_opening_twice_in_a_row_is_retried(self):
        past = history()
        past[0].question_text = "Okay, a five-minute TTL. What was next?"
        llm = FakeLLM(decision(), decision(reaction="Right, deleted on write."))
        result = decide_next_question(CONFIG, state(asked=2), past, llm=llm)
        self.assertEqual(len(llm.calls), 2)
        self.assertTrue(result.question.question_text.startswith("Right"))

    def test_a_strong_complete_answer_does_not_use_up_a_follow_up(self):
        probe = decision(
            action=Action.FOLLOW_UP,
            followup_reason="Wants more detail",
            answer_quality=AnswerQuality.STRONG,
            missing_key_points=[],
        )
        llm = FakeLLM(probe, decision())
        result = decide_next_question(CONFIG, state(asked=3), history(), llm=llm)
        self.assertEqual(len(llm.calls), 2)
        self.assertFalse(result.question.is_followup)

    def test_follow_up_needs_a_reason_and_a_real_answer(self):
        no_reason = decision(action=Action.FOLLOW_UP, followup_reason="")
        with self.assertRaises(LLMError):
            decide_next_question(
                CONFIG, state(asked=3), history(), llm=FakeLLM(no_reason, no_reason)
            )
        dont_know = decision(
            action=Action.FOLLOW_UP,
            followup_reason="gap",
            answer_type=AnswerType.DONT_KNOW,
        )
        with self.assertRaises(LLMError):
            decide_next_question(
                CONFIG, state(asked=3), history(), llm=FakeLLM(dont_know, dont_know)
            )

    def test_a_long_answer_can_be_followed_up(self):
        long_answer = "word " * 120
        llm = FakeLLM(
            decision(
                action=Action.FOLLOW_UP,
                followup_reason="Cache-aside named but not explained",
            )
        )
        result = decide_next_question(
            CONFIG, state(asked=3), history(long_answer), llm=llm
        )
        self.assertTrue(result.question.is_followup)
        self.assertEqual(result.state.followups_total, 1)

    def test_clarification_request_rewords_the_same_question(self):
        llm = FakeLLM(
            decision(
                answer_type=AnswerType.CLARIFICATION_REQUEST,
                answer_quality=AnswerQuality.NONE,
                action=Action.REPHRASE,
                reaction="Sure, let me put it another way.",
                question_text="How do you stop cached data going stale?",
            )
        )
        result = decide_next_question(
            CONFIG, state(asked=2), history("Can you repeat that?"), llm=llm
        )
        self.assertTrue(result.question.is_rephrase)
        self.assertEqual(result.state.plan_cursor, 1)
        self.assertEqual(result.state.main_questions_asked, 2)
        self.assertEqual(result.state.clarifications_used, 1)
        self.assertEqual(result.state.running_summary, [])

    def test_ignoring_a_clarification_request_is_retried(self):
        ignoring = decision(answer_type=AnswerType.CLARIFICATION_REQUEST)
        rewording = decision(
            answer_type=AnswerType.CLARIFICATION_REQUEST, action=Action.REPHRASE
        )
        llm = FakeLLM(ignoring, rewording)
        result = decide_next_question(
            CONFIG, state(asked=2), history("What do you mean?"), llm=llm
        )
        self.assertTrue(result.question.is_rephrase)

    def test_after_two_rewordings_the_reply_counts_as_an_answer(self):
        llm = FakeLLM(decision(answer_type=AnswerType.CLARIFICATION_REQUEST))
        result = decide_next_question(
            CONFIG, state(asked=2, clarifications=2), history("Huh?"), llm=llm
        )
        self.assertFalse(result.question.is_rephrase)

    def test_the_interview_ends_with_closing_words(self):
        end = decision(action=Action.END, reaction="", question_text="")
        llm = FakeLLM(end, ClosingMessage(message="Thanks for talking it through."))
        result = decide_next_question(CONFIG, state(asked=5), history(), llm=llm)
        self.assertIsNone(result.question)
        self.assertEqual(result.state.closing_message, "Thanks for talking it through.")

    def test_closing_falls_back_when_the_model_fails(self):
        end = decision(action=Action.END, reaction="", question_text="")
        llm = FakeLLM(end, LLMError("down"))
        result = decide_next_question(CONFIG, state(asked=5), history(), llm=llm)
        self.assertEqual(result.state.closing_message, FALLBACK_CLOSING)


class PlannerTests(unittest.TestCase):
    def test_anchors_survive_planning(self):
        plan = InterviewPlan(
            resume_brief="brief",
            items=[
                PlannedItem(
                    topic="Redis at Finlytics",
                    question_type="TECHNICAL",
                    difficulty="MEDIUM",
                    focus="invalidation",
                    anchor="p95 latency 900ms to 250ms",
                )
            ],
        )
        result = plan_interview(CONFIG, {}, llm=FakeLLM(plan))
        self.assertEqual(result.plan[0].anchor, "p95 latency 900ms to 250ms")


def evaluation(score, covered):
    checks = [
        PointCheck(point=f"p{i}", covered=c, evidence="quote" if c else "")
        for i, c in enumerate(covered)
    ]
    return AnswerEvaluation(
        point_checks=checks,
        score=score,
        technical_score=score,
        communication_score=score,
        problem_solving_score=score,
        confidence_score=score,
        strengths=[],
        weaknesses=[],
        improvements=[],
        feedback="",
        model_answer="",
    )


class ScoreAnchoringTests(unittest.TestCase):
    def test_a_correct_answer_cannot_score_low(self):
        scored = anchor_scores(evaluation(5.0, [True, True, True, True]))
        self.assertGreaterEqual(scored.score, 7.0)
        self.assertGreaterEqual(scored.technical_score, 7.0)

    def test_an_empty_answer_cannot_score_high(self):
        scored = anchor_scores(evaluation(6.0, [False, False, False, False]))
        self.assertLessEqual(scored.score, 3.5)

    def test_a_point_without_a_quote_does_not_count(self):
        check = evaluation(9.0, [True, True])
        check.point_checks[0].evidence = ""
        self.assertLessEqual(anchor_scores(check).score, 7.5)

    def test_sensible_scores_are_left_alone(self):
        self.assertEqual(
            anchor_scores(evaluation(7.0, [True, True, True, False])).score, 7.0
        )

    def test_other_scores_are_not_touched(self):
        scored = anchor_scores(evaluation(5.0, [True, True, True, True]))
        self.assertEqual(scored.communication_score, 5.0)


def question(difficulty, kind, score, topic="T"):
    scores = dict(
        score=score,
        technical_score=score,
        communication_score=score,
        problem_solving_score=score,
        confidence_score=score,
    )
    return SimpleNamespace(
        difficulty=difficulty,
        question_type=kind,
        topic=topic,
        response=SimpleNamespace(evaluation=SimpleNamespace(**scores)),
    )


class ReportWeightTests(unittest.TestCase):
    def test_hard_questions_count_for_more(self):
        questions = [
            question(QuestionDifficulty.EASY, QuestionType.TECHNICAL, 9.0),
            question(QuestionDifficulty.HARD, QuestionType.TECHNICAL, 5.0),
        ]
        scores, _ = aggregate_scores(questions)
        self.assertLess(scores["overall_score"], 7.0)

    def test_follow_ups_count_for_less(self):
        questions = [
            question(QuestionDifficulty.MEDIUM, QuestionType.TECHNICAL, 8.0),
            question(QuestionDifficulty.MEDIUM, QuestionType.FOLLOWUP, 2.0),
        ]
        scores, _ = aggregate_scores(questions)
        self.assertGreater(scores["overall_score"], 5.0)

    def test_equal_scores_stay_equal(self):
        questions = [
            question(QuestionDifficulty.EASY, QuestionType.TECHNICAL, 6.0, "A"),
            question(QuestionDifficulty.HARD, QuestionType.FOLLOWUP, 6.0, "B"),
        ]
        scores, topics = aggregate_scores(questions)
        self.assertEqual(scores["overall_score"], 6.0)
        self.assertEqual(topics, {"A": 6.0, "B": 6.0})


if __name__ == "__main__":
    unittest.main()


class WordingTests(unittest.TestCase):
    def test_curly_apostrophes_do_not_hide_stock_phrases(self):
        curly = decision(reaction="Let\u2019s talk about your experience.")
        llm = FakeLLM(curly, decision())
        decide_next_question(CONFIG, state(asked=2), history(), llm=llm)
        self.assertEqual(len(llm.calls), 2)

    def test_the_lead_in_is_one_short_sentence(self):
        long = decision(reaction="You used Redis. You moved on to Celery. Then more.")
        result = decide_next_question(
            CONFIG, state(asked=2), history(), llm=FakeLLM(long)
        )
        self.assertEqual(
            result.question.question_text,
            "You used Redis. How would you invalidate it?",
        )

    def test_the_greeting_may_run_longer(self):
        greeting = decision(
            reaction="Hi, I'm Alex. We'll talk about your work. Relax and think out loud.",
            answer_type=AnswerType.ANSWER,
            answer_quality=AnswerQuality.NONE,
        )
        result = decide_next_question(CONFIG, state(asked=0), [], llm=FakeLLM(greeting))
        self.assertTrue(result.question.question_text.startswith("Hi, I'm Alex."))
        self.assertIn("Relax and think out loud.", result.question.question_text)

    def test_review_words_in_the_closing_fall_back(self):
        end = decision(action=Action.END, reaction="", question_text="")
        llm = FakeLLM(end, ClosingMessage(message="Your insights were great."))
        result = decide_next_question(CONFIG, state(asked=5), history(), llm=llm)
        self.assertEqual(result.state.closing_message, FALLBACK_CLOSING)
