import { useMemo } from 'react';
import { toast } from 'sonner';
import { useGetInterviewQuery } from '@/redux/api/interviewApi';
import {
  useAbandonSessionMutation,
  useGetSessionQuery,
  useSubmitAnswerMutation,
} from '@/redux/api/sessionApi';

export const SESSION_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
};

const numberQuestions = (questions) => {
  let mainNumber = 0;
  return questions.map((question) => {
    const isFollowup = question.question_type === 'FOLLOWUP';
    if (!isFollowup) mainNumber += 1;
    return { ...question, isFollowup, mainNumber };
  });
};

export const useInterviewSession = (sessionId) => {
  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useGetSessionQuery(sessionId);
  const { data: interview } = useGetInterviewQuery(session?.interview_id, {
    skip: !session?.interview_id,
  });
  const [submitAnswerMutation, { isLoading: isSubmitting }] =
    useSubmitAnswerMutation();
  const [abandonSessionMutation, { isLoading: isEnding }] =
    useAbandonSessionMutation();

  const questions = useMemo(
    () => numberQuestions(session?.questions ?? []),
    [session?.questions]
  );

  const latest = questions.at(-1);
  const isInProgress = session?.status === SESSION_STATUS.IN_PROGRESS;
  const currentQuestion =
    isInProgress && latest && !latest.response ? latest : null;
  const mainQuestionsAsked = latest?.mainNumber ?? 0;
  const totalQuestions = Math.max(
    interview?.total_questions ?? 0,
    mainQuestionsAsked
  );

  const submitAnswer = async ({ text, responseTimeSeconds }) => {
    if (!currentQuestion) return false;
    try {
      await submitAnswerMutation({
        sessionId,
        questionId: currentQuestion.id,
        response_text: text,
        response_time_seconds: responseTimeSeconds,
      }).unwrap();
      return true;
    } catch (err) {
      if (err?.status === 409) {
        toast.info(err.data?.detail || 'This interview was updated elsewhere.');
        refetch();
      } else {
        toast.error("Couldn't submit your answer", {
          description:
            err?.data?.detail ||
            'Your answer is still here. Please try submitting again.',
        });
      }
      return false;
    }
  };

  const endInterview = async () => {
    try {
      await abandonSessionMutation(sessionId).unwrap();
      toast.success('Interview ended');
      return true;
    } catch (err) {
      toast.error("Couldn't end the interview", {
        description: err?.data?.detail || 'Please try again.',
      });
      return false;
    }
  };

  return {
    session,
    interview,
    questions,
    currentQuestion,
    mainQuestionsAsked,
    totalQuestions,
    isLoading,
    error,
    isSubmitting,
    isEnding,
    refetch,
    submitAnswer,
    endInterview,
  };
};
