'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SessionStatusBadge from '@/components/session/SessionStatusBadge';
import {
  formatDuration,
  scoreTextClass,
} from '@/components/dashboard/report/chartTheme';
import { cn } from '@/lib/utils';

const attemptHref = (attempt) => {
  const sessionHref = `/dashboard/interviews/${attempt.interviewId}/session/${attempt.id}`;
  if (attempt.status === 'IN_PROGRESS') return sessionHref;
  return attempt.answeredCount > 0 ? `${sessionHref}/report` : null;
};

const ScoreCell = ({ attempt }) => {
  if (attempt.reportStatus === 'COMPLETED' && attempt.score != null) {
    return (
      <span className="tabular-nums">
        <span className={cn('font-semibold', scoreTextClass(attempt.score))}>
          {attempt.score.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">/10</span>
      </span>
    );
  }
  if (attempt.reportStatus) {
    return <span className="text-xs text-muted-foreground">Scoring…</span>;
  }
  return <span className="text-muted-foreground">—</span>;
};

const RecentAttempts = ({ attempts }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-semibold">Recent interviews</h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-primary"
          >
            <Link href="/dashboard/interviews">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Interview</th>
                <th className="px-5 py-3 text-left font-medium">Score</th>
                <th className="hidden px-5 py-3 text-left font-medium sm:table-cell">
                  Duration
                </th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="hidden px-5 py-3 text-left font-medium md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt, index) => {
                const href = attemptHref(attempt);
                return (
                  <motion.tr
                    key={attempt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + index * 0.06 }}
                    onClick={href ? () => router.push(href) : undefined}
                    className={cn(
                      'border-b border-border transition-colors last:border-0',
                      href && 'cursor-pointer hover:bg-secondary/40'
                    )}
                  >
                    <td className="px-5 py-3.5 font-medium">
                      {href ? (
                        <Link href={href} className="hover:text-primary">
                          {attempt.interviewTitle}
                        </Link>
                      ) : (
                        attempt.interviewTitle
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <ScoreCell attempt={attempt} />
                    </td>
                    <td className="hidden px-5 py-3.5 text-muted-foreground sm:table-cell">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="h-3 w-3" />
                        {attempt.durationSeconds != null
                          ? formatDuration(attempt.durationSeconds)
                          : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <SessionStatusBadge status={attempt.status} />
                    </td>
                    <td className="hidden px-5 py-3.5 text-muted-foreground md:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(attempt.startedAt).toLocaleDateString(
                          undefined,
                          { dateStyle: 'medium' }
                        )}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

export default RecentAttempts;
