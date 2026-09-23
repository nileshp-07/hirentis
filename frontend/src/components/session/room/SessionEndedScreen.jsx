'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  CornerDownRight,
  MessageSquareText,
  PhoneOff,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration } from './format';

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-border bg-secondary/30 p-4 text-left">
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </div>
    <p className="mt-2 text-xl font-semibold">{value}</p>
  </div>
);

const SessionEndedScreen = ({ session, questions, interviewId }) => {
  const isCompleted = session.status === 'COMPLETED';
  const answered = questions.filter((q) => q.response).length;
  const followups = questions.filter((q) => q.isFollowup).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(600px circle at 50% 20%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="gradient-border relative w-full max-w-xl rounded-2xl bg-card p-8 text-center shadow-2xl md:p-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 18,
            delay: 0.15,
          }}
          className={
            isCompleted
              ? 'mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-bg shadow-lg shadow-primary/30'
              : 'mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary'
          }
        >
          {isCompleted ? (
            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
          ) : (
            <PhoneOff className="h-7 w-7 text-muted-foreground" />
          )}
        </motion.div>

        <h1 className="mt-6 text-2xl font-bold md:text-3xl">
          {isCompleted ? (
            <>
              Interview <span className="gradient-text">complete</span>
            </>
          ) : (
            'Interview ended'
          )}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {isCompleted
            ? 'Great work! Thanks for taking the time to practice. Your answers are being evaluated and your detailed report will be ready soon.'
            : 'You ended this interview early. Your answers so far are saved, and you can start a fresh attempt anytime.'}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={MessageSquareText} label="Answered" value={answered} />
          <Stat icon={CornerDownRight} label="Follow-ups" value={followups} />
          <Stat
            icon={Clock3}
            label="Duration"
            value={formatDuration(session.duration_seconds ?? 0)}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isCompleted ? (
            <Button
              disabled
              title="Detailed reports are coming soon"
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View report
              <span className="rounded-full bg-primary-foreground/20 px-1.5 py-px text-[10px] font-semibold uppercase">
                Soon
              </span>
            </Button>
          ) : (
            <Button asChild className="gap-2">
              <Link href={`/dashboard/interviews/${interviewId}`}>
                <RotateCcw className="h-4 w-4" />
                Start a new attempt
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2 border-border">
            <Link href="/dashboard/interviews">
              <ArrowLeft className="h-4 w-4" />
              Back to interviews
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SessionEndedScreen;
