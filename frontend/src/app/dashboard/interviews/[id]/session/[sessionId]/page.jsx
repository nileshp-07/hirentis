'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import AnswerComposer from '@/components/session/room/AnswerComposer';
import ConversationSidebar from '@/components/session/room/ConversationSidebar';
import InterviewerOrb from '@/components/session/room/InterviewerOrb';
import QuestionStage from '@/components/session/room/QuestionStage';
import SessionEndedScreen from '@/components/session/room/SessionEndedScreen';
import SessionHeader from '@/components/session/room/SessionHeader';
import {
  SESSION_STATUS,
  useInterviewSession,
} from '@/hooks/useInterviewSession';

const SIDEBAR_PREF_KEY = 'hirentis:conversation-open';

const initialSidebarOpen = () => {
  try {
    const saved = window.localStorage.getItem(SIDEBAR_PREF_KEY);
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(min-width: 1024px)').matches;
  } catch {
    return false;
  }
};

const FullScreen = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-4">
    {children}
  </div>
);

export default function InterviewSessionPage({ params }) {
  const { id: interviewId, sessionId } = use(params);
  const {
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
  } = useInterviewSession(sessionId);

  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);

  const toggleSidebar = (open) => {
    setSidebarOpen(open);
    try {
      window.localStorage.setItem(SIDEBAR_PREF_KEY, String(open));
    } catch {}
  };

  const handleConfirmEnd = async () => {
    if (await endInterview()) setConfirmEndOpen(false);
  };

  if (isLoading) {
    return (
      <FullScreen>
        <Loader text="Loading your interview…" />
      </FullScreen>
    );
  }

  if (error || !session) {
    return (
      <FullScreen>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center"
        >
          <h1 className="text-2xl font-bold">Interview not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This interview session doesn&apos;t exist or you don&apos;t have
            access to it.
          </p>
          <Button asChild className="mt-6 gap-2">
            <Link href="/dashboard/interviews">
              <ArrowLeft className="h-4 w-4" />
              Back to interviews
            </Link>
          </Button>
        </motion.div>
      </FullScreen>
    );
  }

  if (session.status !== SESSION_STATUS.IN_PROGRESS) {
    return (
      <SessionEndedScreen
        session={session}
        questions={questions}
        interviewId={session.interview_id ?? interviewId}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.15]" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{
          background:
            'radial-gradient(700px circle at 50% 0%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)',
        }}
      />

      <SessionHeader
        title={interview?.title}
        role={interview?.role}
        startedAt={session.started_at}
        mainQuestionsAsked={mainQuestionsAsked}
        totalQuestions={totalQuestions}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => toggleSidebar(!sidebarOpen)}
        onEnd={() => setConfirmEndOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-10 md:px-6">
            {currentQuestion ? (
              <>
                <QuestionStage
                  question={currentQuestion}
                  isThinking={isSubmitting}
                  totalQuestions={totalQuestions}
                />
                <AnswerComposer
                  key={currentQuestion.id}
                  questionId={currentQuestion.id}
                  onSubmit={submitAnswer}
                  isSubmitting={isSubmitting}
                />
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <InterviewerOrb status="thinking" size={96} />
                <p className="mt-6 font-semibold">
                  Preparing the next question…
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This is taking longer than usual.
                </p>
                <Button
                  variant="outline"
                  onClick={refetch}
                  className="mt-5 gap-2 border-border"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </main>

        <ConversationSidebar
          open={sidebarOpen}
          onClose={() => toggleSidebar(false)}
          questions={questions}
          currentQuestionId={currentQuestion?.id}
          isThinking={isSubmitting}
        />
      </div>

      <Modal
        isOpen={confirmEndOpen}
        onClose={() => setConfirmEndOpen(false)}
        onConfirm={handleConfirmEnd}
        isLoading={isEnding}
        variant="danger"
        title="End this interview?"
        description="Your answers so far will be saved, but you won't be able to continue this attempt."
        confirmText="End interview"
        cancelText="Keep going"
      />
    </div>
  );
}
