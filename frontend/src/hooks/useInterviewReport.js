import { useEffect, useMemo, useState } from 'react';
import { useGetSessionReportQuery } from '@/redux/api/sessionApi';
import { SESSION_STATUS } from '@/hooks/useInterviewSession';

export const REPORT_STATE = {
  IN_PROGRESS: 'IN_PROGRESS',
  NO_ANSWERS: 'NO_ANSWERS',
  GENERATING: 'GENERATING',
  DELAYED: 'DELAYED',
  READY: 'READY',
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 45;

const secondsSince = (start, timestamp) =>
  start && timestamp ? (new Date(timestamp) - new Date(start)) / 1000 : null;

const getReportState = (report, pollsExhausted) => {
  const isFinished =
    report.session_status === SESSION_STATUS.COMPLETED ||
    report.session_status === SESSION_STATUS.ABANDONED;
  if (!isFinished) return REPORT_STATE.IN_PROGRESS;
  if (!report.questions.some((question) => question.answer_text)) {
    return REPORT_STATE.NO_ANSWERS;
  }
  if (report.status === 'COMPLETED') return REPORT_STATE.READY;
  if (report.status === 'FAILED' || pollsExhausted) return REPORT_STATE.DELAYED;
  return REPORT_STATE.GENERATING;
};

const toReportView = (report) => {
  let mainNumber = 0;
  const asked = report.questions.map((question) => {
    const isFollowup = question.question_type === 'FOLLOWUP';
    if (!isFollowup) mainNumber += 1;
    return { ...question, isFollowup, number: mainNumber };
  });

  const questions = asked
    .filter((question) => question.answer_text)
    .map((question) => ({
      id: question.question_id,
      number: question.number,
      isFollowup: question.isFollowup,
      topic: question.topic,
      difficulty: question.difficulty,
      text: question.question_text,
      answer: question.answer_text,
      score: question.score,
      strengths: question.strengths,
      weaknesses: question.weaknesses,
      improvements: question.improvements,
      feedback: question.feedback,
      pointChecks: question.point_checks ?? [],
      modelAnswer: question.model_answer,
    }));

  const transcript = asked.flatMap((question) => {
    const messages = [
      {
        role: 'ai',
        text: question.question_text,
        elapsedSeconds: secondsSince(report.started_at, question.asked_at),
      },
    ];
    if (question.answer_text) {
      messages.push({
        role: 'user',
        text: question.answer_text,
        elapsedSeconds: secondsSince(report.started_at, question.submitted_at),
      });
    }
    return messages;
  });

  const topicOrder = [...new Set(questions.map((question) => question.topic))];
  const topicScores = Object.entries(report.topic_scores)
    .map(([topic, score]) => ({ topic, score }))
    .sort((a, b) => topicOrder.indexOf(a.topic) - topicOrder.indexOf(b.topic));

  const scores = {
    overall: report.overall_score,
    technical: report.technical_score,
    communication: report.communication_score,
    problemSolving: report.problem_solving_score,
    confidence: report.confidence_score,
  };

  return {
    interview: {
      title: report.interview_title,
      role: report.interview_role,
      date: report.completed_at ?? report.started_at,
      durationSeconds: report.duration_seconds,
      status: report.session_status,
    },
    scores,
    skillRadar: [
      { skill: 'Technical', score: scores.technical },
      { skill: 'Communication', score: scores.communication },
      { skill: 'Problem solving', score: scores.problemSolving },
      { skill: 'Confidence', score: scores.confidence },
    ],
    topicScores,
    questions,
    unscoredCount: questions.filter((question) => question.score == null)
      .length,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    suggestions: report.improvement_suggestions,
    aiSummary: report.ai_summary,
    readinessVerdict: report.readiness_verdict,
    topPriorities: report.top_priorities ?? [],
    transcript,
  };
};

export const useInterviewReport = (sessionId) => {
  const { data, isLoading, isFetching, error, refetch } =
    useGetSessionReportQuery(sessionId, { refetchOnMountOrArgChange: true });
  const [polls, setPolls] = useState(0);

  const report = useMemo(() => (data ? toReportView(data) : null), [data]);
  const state = data ? getReportState(data, polls >= MAX_POLLS) : null;
  const isGenerating = state === REPORT_STATE.GENERATING;

  useEffect(() => {
    if (!isGenerating || isFetching) return;
    const timer = setTimeout(() => {
      setPolls((count) => count + 1);
      refetch();
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [isGenerating, isFetching, refetch]);

  const checkAgain = () => {
    setPolls(0);
    refetch();
  };

  return { report, state, isLoading, error, checkAgain };
};
