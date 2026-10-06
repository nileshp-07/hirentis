import { useMemo } from 'react';
import { useGetDashboardQuery } from '@/redux/api/dashboardApi';

const formatExperience = (level) =>
  level && /^\d+(\.\d+)?$/.test(level.trim()) ? `${level.trim()} years` : level;

const toDashboardView = (dashboard) => {
  const {
    focus,
    active_attempt: active,
    stats,
    skill_averages: skills,
  } = dashboard;

  return {
    focus: focus && {
      role: focus.role,
      experienceLevel: formatExperience(focus.experience_level),
    },
    activeAttempt: active && {
      id: active.id,
      interviewId: active.interview_id,
      interviewTitle: active.interview_title,
      questionsAnswered: active.questions_answered,
      totalQuestions: active.total_questions,
    },
    stats: {
      attempts: stats.attempts,
      completed: stats.completed,
      endedEarly: stats.ended_early,
      averageScore: stats.average_score,
      recentAverage: stats.recent_average,
      bestScore: stats.best_score,
      bestInterviewTitle: stats.best_interview_title,
    },
    skillAverages: [
      { skill: 'Technical', score: skills.technical_score },
      { skill: 'Communication', score: skills.communication_score },
      { skill: 'Problem solving', score: skills.problem_solving_score },
      { skill: 'Confidence', score: skills.confidence_score },
    ],
    scoreTrend: dashboard.score_trend.map((point) => ({
      id: point.session_id,
      date: point.date,
      interviewTitle: point.interview_title,
      score: point.score,
    })),
    topics: dashboard.topics,
    recentAttempts: dashboard.recent_attempts.map((attempt) => ({
      id: attempt.id,
      interviewId: attempt.interview_id,
      interviewTitle: attempt.interview_title,
      status: attempt.status,
      score: attempt.overall_score,
      reportStatus: attempt.report_status,
      durationSeconds: attempt.duration_seconds,
      answeredCount: attempt.answered_count,
      startedAt: attempt.started_at ?? attempt.created_at,
    })),
  };
};

export const useDashboard = () => {
  const { data, isLoading, error, refetch } = useGetDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const dashboard = useMemo(
    () => (data ? toDashboardView(data) : null),
    [data]
  );

  return { dashboard, isLoading, error, refetch };
};
