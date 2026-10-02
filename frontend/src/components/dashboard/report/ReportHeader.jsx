'use client';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Clock3,
  PhoneOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDuration } from './chartTheme';

const STATUS_BADGES = {
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500',
  },
  ABANDONED: {
    label: 'Ended early',
    icon: PhoneOff,
    className: 'border-border bg-secondary text-muted-foreground',
  },
  IN_PROGRESS: {
    label: 'In progress',
    icon: CircleDot,
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
};

const ReportHeader = ({ interview, backHref }) => {
  const badge = STATUS_BADGES[interview.status] ?? STATUS_BADGES.IN_PROGRESS;
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

      <Badge className={cn('self-start border', badge.className)}>
        <badge.icon className="mr-1 h-3 w-3" />
        {badge.label}
      </Badge>
    </header>
  );
};

export default ReportHeader;
