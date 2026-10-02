'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Sparkles, CircleDashed, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import { ActiveInterviewCard } from '@/components/dashboard/interviews/ActiveInterviewCard';
import { CompletedInterviewCard } from '@/components/dashboard/interviews/CompletedInterviewCard';
import { useGetInterviewsQuery } from '@/redux/api/interviewApi';
import { useGetSessionsQuery } from '@/redux/api/sessionApi';

const FINISHED_STATUSES = ['COMPLETED', 'ABANDONED'];

export default function InterviewsPage() {
  const { data: interviews = [], isLoading } = useGetInterviewsQuery();
  const { data: sessions = [] } = useGetSessionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const activeSessionIds = Object.fromEntries(
    sessions
      .filter((session) => session.status === 'IN_PROGRESS')
      .map((session) => [session.interview_id, session.id])
  );

  const transformInterview = (interview) => ({
    ...interview,
    status: activeSessionIds[interview.id]
      ? 'in_progress'
      : interview.interview_overview
        ? 'scheduled'
        : 'pending',
    activeSessionId: activeSessionIds[interview.id],
    date: interview.created_at
      ? new Date(interview.created_at).toLocaleDateString()
      : 'TBD',
    duration: interview.interview_overview?.estimated_duration || '45 mins',
    techStack: interview.tech_stack || [],
    totalQuestions: interview.total_questions,
    type: interview.interview_type,
  });

  const activeInterviews = interviews.map(transformInterview);
  const interviewsById = Object.fromEntries(
    activeInterviews.map((interview) => [interview.id, interview])
  );

  const pastAttempts = sessions.filter(
    (session) =>
      FINISHED_STATUSES.includes(session.status) &&
      session.answered_count > 0 &&
      interviewsById[session.interview_id]
  );

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your interviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Interviews"
        subtitle="Create, manage, and scale your technical prowess with AI-driven interview simulations."
        buttons={
          <Button
            asChild
            className="gradient-bg text-primary-foreground hover:opacity-90 shadow-md"
          >
            <Link href="/dashboard/interviews/create">
              <Plus className="h-4 w-4" />
              Create Interview
            </Link>
          </Button>
        }
      />

      <section className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-semibold text-primary/80">Ongoing Sessions</h2>
            <p className="text-sm text-muted-foreground">
              Continue or start your upcoming interviews.
            </p>
          </div>

          <div className="space-y-4">
            {activeInterviews.map((interview, index) => (
              <ActiveInterviewCard
                key={interview.id}
                interview={interview}
                index={index}
              />
            ))}
            {activeInterviews.length === 0 && (
              <div className="p-12 text-center border border-dashed rounded-2xl bg-secondary/10 italic text-muted-foreground text-sm">
                No active interviews found. Start your first session now.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-semibold text-primary/80">
              Performance History
            </h2>
            <p className="text-sm text-muted-foreground">
              Review your past evaluation results.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {pastAttempts.map((attempt, index) => (
              <CompletedInterviewCard
                key={attempt.id}
                attempt={attempt}
                interview={interviewsById[attempt.interview_id]}
                index={index}
              />
            ))}
            {pastAttempts.length === 0 && (
              <div className="p-8 text-center border border-dashed rounded-2xl bg-secondary/10 italic text-muted-foreground text-xs">
                Your history is currently empty.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 pt-4">
        {[
          {
            icon: CircleDashed,
            title: 'Adaptive Builder',
            description:
              'Dynamic interview flows tailored for technical and behavioral depth.',
          },
          {
            icon: Sparkles,
            title: 'Resume-aware Intelligence',
            description:
              'Personalized question banks based on your active resume strengths.',
          },
          {
            icon: LoaderCircle,
            title: 'Continuity Shield',
            description:
              'Pick up exactly where you left off without losing session context.',
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + index * 0.08 }}
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/20 transition-colors"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">{item.title}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </section>
    </motion.div>
  );
}
