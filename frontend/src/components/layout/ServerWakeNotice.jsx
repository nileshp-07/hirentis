'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, ServerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Free hosting puts the API to sleep when idle and waking it takes up to a minute.
// This checks the API as soon as any page opens and explains the wait, instead of
// leaving a first-time visitor on a blank screen or an error.
const SLOW_AFTER_MS = 2500;
const ATTEMPT_TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 3000;
const GIVE_UP_AFTER_MS = 150000;
const READY_SHOWN_MS = 2500;

const getHealthUrl = () => {
  try {
    return new URL('/health', process.env.NEXT_PUBLIC_API_URL).href;
  } catch {
    return null;
  }
};

const isReachable = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const MESSAGES = {
  waking: {
    icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
    title: 'Starting the server…',
    text: 'This demo runs on free hosting that sleeps when idle, so the first load can take up to a minute. Thanks for waiting!',
  },
  ready: {
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    title: 'Server is ready',
    text: null,
  },
  failed: {
    icon: <ServerOff className="h-5 w-5 text-destructive" />,
    title: "Can't reach the server right now",
    text: 'It may still be starting. Please try again in a moment.',
  },
};

const ServerWakeNotice = () => {
  const [phase, setPhase] = useState('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const url = getHealthUrl();
    if (!url) return undefined;

    let cancelled = false;
    let retryTimer;
    let readyTimer;
    const startedAt = Date.now();

    const slowTimer = setTimeout(() => {
      setPhase((current) => (current === 'checking' ? 'waking' : current));
    }, SLOW_AFTER_MS);

    const check = async () => {
      const reachable = await isReachable(url);
      if (cancelled) return;

      if (reachable) {
        clearTimeout(slowTimer);
        setPhase((current) => (current === 'waking' ? 'ready' : 'ok'));
        readyTimer = setTimeout(() => {
          setPhase((current) => (current === 'ready' ? 'ok' : current));
        }, READY_SHOWN_MS);
      } else if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
        clearTimeout(slowTimer);
        setPhase('failed');
      } else {
        retryTimer = setTimeout(check, RETRY_DELAY_MS);
      }
    };
    check();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
      clearTimeout(retryTimer);
      clearTimeout(readyTimer);
    };
  }, [attempt]);

  const message = MESSAGES[phase];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={phase}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed left-1/2 top-4 z-100 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg"
        >
          <div className="mt-0.5 shrink-0">{message.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{message.title}</p>
            {message.text && (
              <p className="mt-1 text-sm text-muted-foreground">
                {message.text}
              </p>
            )}
            {phase === 'failed' && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => {
                  setPhase('waking');
                  setAttempt((value) => value + 1);
                }}
              >
                Try again
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServerWakeNotice;
