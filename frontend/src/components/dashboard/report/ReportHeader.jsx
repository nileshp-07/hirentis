'use client';
import Link from 'next/link';
import { ArrowLeft, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SessionStatusBadge from '@/components/session/SessionStatusBadge';
import { formatDuration } from './chartTheme';

const ReportHeader = ({ interview, backHref }) => {
  const date = interview.date
    ? new Date(interview.date).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      })
    : null;

  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          aria-label="Back to interview"
        >
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{interview.title}</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span>{interview.role}</span>
            {date && (
              <>
                <span>·</span>
                <span>{date}</span>
              </>
            )}
            {interview.durationSeconds != null && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {formatDuration(interview.durationSeconds)}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <SessionStatusBadge status={interview.status} className="self-start" />
    </header>
  );
};

export default ReportHeader;
