'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Clock3,
  History,
  MessageSquareText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SessionStatusBadge from '@/components/session/SessionStatusBadge';
import {
  formatDuration,
  scoreTextClass,
} from '@/components/dashboard/report/chartTheme';
import { cn } from '@/lib/utils';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const AttemptScore = ({ attempt }) => {
  if (attempt.report_status === 'COMPLETED' && attempt.overall_score != null) {
    return (
      <span
        className={cn(
          'text-lg font-semibold',
          scoreTextClass(attempt.overall_score)
        )}
      >
        {attempt.overall_score.toFixed(1)}
        <span className="text-xs font-medium text-muted-foreground">/10</span>
      </span>
    );
  }
  if (attempt.report_status) {
    return <span className="text-xs text-muted-foreground">Scoring…</span>;
  }
  return null;
};

const AttemptRow = ({ attempt, number, interviewId, index }) => {
  const sessionHref = `/dashboard/interviews/${interviewId}/session/${attempt.id}`;
  const startedAt = new Date(
    attempt.started_at ?? attempt.created_at
  ).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Attempt {number}</span>
          <SessionStatusBadge status={attempt.status} />
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{startedAt}</span>
          {attempt.duration_seconds != null && (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {formatDuration(attempt.duration_seconds)}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MessageSquareText className="h-3 w-3" />
            {plural(attempt.answered_count, 'answer')}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <AttemptScore attempt={attempt} />
        {attempt.status === 'IN_PROGRESS' ? (
          <Button asChild size="sm" className="gap-1.5">
            <Link href={sessionHref}>
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        ) : (
          attempt.answered_count > 0 && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-1.5 border-border"
            >
              <Link href={`${sessionHref}/report`}>
                <BarChart3 className="h-3.5 w-3.5" />
                View report
              </Link>
            </Button>
          )
        )}
      </div>
    </motion.li>
  );
};

const AttemptHistory = ({ interviewId, attempts }) => (
  <Card>
    <div className="mb-5 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-xl font-semibold leading-none tracking-tight">
        <History className="h-5 w-5 text-primary" />
        Your attempts
      </h3>
      <span className="text-sm text-muted-foreground">
        {plural(attempts.length, 'attempt')}
      </span>
    </div>
    {/* Newest first, numbered from the oldest */}
    <ul className="divide-y divide-border">
      {attempts.map((attempt, index) => (
        <AttemptRow
          key={attempt.id}
          attempt={attempt}
          number={attempts.length - index}
          interviewId={interviewId}
          index={index}
        />
      ))}
    </ul>
  </Card>
);

export default AttemptHistory;
