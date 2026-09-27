'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock3,
  PanelRightClose,
  PanelRightOpen,
  PhoneOff,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration } from './format';

const useNow = () => {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
};

const SessionHeader = ({
  title,
  role,
  startedAt,
  mainQuestionsAsked,
  totalQuestions,
  sidebarOpen,
  onToggleSidebar,
  onEnd,
}) => {
  const now = useNow();
  const elapsedSeconds =
    now && startedAt ? (now - new Date(startedAt).getTime()) / 1000 : 0;
  const progress = totalQuestions
    ? Math.min(100, (mainQuestionsAsked / totalQuestions) * 100)
    : 0;

  return (
    <header className="relative z-20 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="gradient-bg shrink-0 rounded-lg p-1.5">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {role || 'Interview'}
            </p>
            {title && (
              <p className="truncate text-xs text-muted-foreground">{title}</p>
            )}
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-xs flex-col gap-1.5 md:flex">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              Question {mainQuestionsAsked} of {totalQuestions}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full gradient-bg"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 font-mono text-xs text-muted-foreground sm:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <Clock3 className="h-3.5 w-3.5" />
            {formatDuration(elapsedSeconds)}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Hide conversation' : 'Show conversation'}
            className="gap-2 border-border bg-background/60"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Conversation</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEnd}
            className="gap-2 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
          >
            <PhoneOff className="h-4 w-4" />
            <span className="hidden sm:inline">End interview</span>
          </Button>
        </div>
      </div>

      <div className="h-0.5 bg-secondary md:hidden">
        <motion.div
          className="h-full gradient-bg"
          initial={false}
          animate={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
};

export default SessionHeader;
