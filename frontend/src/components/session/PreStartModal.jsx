'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mic,
  Monitor,
  RotateCcw,
  Volume2,
  Wifi,
  X,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSpeechRecognitionSupported } from '@/hooks/useSpeechRecognition';
import { cn } from '@/lib/utils';

const INSTRUCTIONS = [
  'The AI interviewer asks one question at a time and adapts its follow-ups to your answers.',
  'Click Speak and answer out loud. Your words appear as text while you talk.',
  'Click Stop when you finish, then read the transcript and fix anything it misheard.',
  'Submit when your answer reads right. You can also type, or mix speaking and typing.',
  'Explain your reasoning in detail. Answers are scored on accuracy, depth, clarity and problem-solving.',
  'Use headphones in a quiet room for the most accurate transcript.',
];

const checkVoiceSupport = async () =>
  isSpeechRecognitionSupported()
    ? { status: 'success', detail: 'You can answer by speaking.' }
    : {
        status: 'warning',
        detail:
          'Voice answers need Chrome, Edge or Safari. You can still type.',
      };

const checkMicrophone = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      status: 'warning',
      detail: "This browser can't use a microphone. You can still type.",
    };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { status: 'success', detail: 'Microphone access granted.' };
  } catch (err) {
    return {
      status: 'warning',
      detail:
        err?.name === 'NotFoundError'
          ? 'No microphone found. You can still type.'
          : 'Microphone access is blocked. Allow it from the address bar, or type your answers.',
    };
  }
};

const checkConnection = async () =>
  navigator.onLine
    ? { status: 'success', detail: "You're online." }
    : {
        status: 'error',
        detail: "You're offline. Reconnect to start the interview.",
      };

const CHECKS = [
  {
    id: 'voice',
    label: 'Voice input support',
    icon: Monitor,
    run: checkVoiceSupport,
  },
  { id: 'mic', label: 'Microphone access', icon: Mic, run: checkMicrophone },
  {
    id: 'internet',
    label: 'Internet connection',
    icon: Wifi,
    run: checkConnection,
  },
];

const playTestSound = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;
  const context = new AudioContext();
  const now = context.currentTime;
  [660, 880].forEach((frequency, i) => {
    const start = now + i * 0.18;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.17);
  });
  setTimeout(() => context.close(), 600);
  return true;
};

const StatusIcon = ({ status }) => {
  if (status === 'checking') {
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  }
  if (status === 'success') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      </motion.div>
    );
  }
  if (status === 'warning') {
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  }
  if (status === 'error') {
    return <XCircle className="h-5 w-5 text-destructive" />;
  }
  return (
    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
  );
};

const CheckRow = ({ icon: Icon, label, status, detail, action, index }) => (
  <motion.div
    className="flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/30 px-5 py-4"
    initial={{ opacity: 0, x: 15 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 + index * 0.1 }}
  >
    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {detail && (
        <p
          className={cn(
            'mt-0.5 text-xs',
            status === 'warning' && 'text-amber-500',
            status === 'error' && 'text-destructive',
            (status === 'success' || status === 'pending') &&
              'text-muted-foreground'
          )}
        >
          {detail}
        </p>
      )}
    </div>
    {action}
    <StatusIcon status={status} />
  </motion.div>
);

const PreStartModal = ({ onStart, onClose }) => {
  const [results, setResults] = useState({});
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const runChecks = async () => {
      for (const check of CHECKS) {
        const result = await check.run();
        if (cancelled) return;
        setResults((current) => ({ ...current, [check.id]: result }));
      }
    };
    runChecks();
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = async (check) => {
    setResults((current) => {
      const { [check.id]: _, ...rest } = current;
      return rest;
    });
    const result = await check.run();
    setResults((current) => ({ ...current, [check.id]: result }));
  };

  const running = CHECKS.find((check) => !results[check.id]);
  const finished = !running;
  const canStart = finished && results.internet?.status !== 'error';
  const hasWarnings = CHECKS.some(
    (check) => results[check.id]?.status === 'warning'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.div
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-2xl backdrop-blur-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="gradient-bg h-1 w-full" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-10 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid max-h-[90vh] gap-0 overflow-y-auto md:grid-cols-2">
          <div className="border-border/40 p-8 md:border-r md:p-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                Interview Practice Instructions
              </h2>
              <p className="mb-8 text-sm text-muted-foreground">
                Prepare for your AI-powered interview session
              </p>
            </motion.div>

            <motion.div
              className="gradient-border mb-8 rounded-xl border border-border/50 bg-secondary/40 p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="gradient-bg flex h-14 w-14 items-center justify-center rounded-full">
                    <span className="text-xl font-bold text-primary-foreground">
                      AI
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card bg-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Hirentis AI Interviewer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Adaptive • Context-Aware • Real-time
                  </p>
                </div>
              </div>
            </motion.div>

            <ol className="space-y-4">
              {INSTRUCTIONS.map((text, i) => (
                <motion.li
                  key={text}
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                >
                  <span className="gradient-bg flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed text-secondary-foreground">
                    {text}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col p-8 md:p-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="mb-1 text-2xl font-bold text-foreground">
                Compatibility Test
              </h2>
              <p className="mb-8 text-sm text-muted-foreground">
                Setup Checklist
              </p>
            </motion.div>

            <div className="flex-1 space-y-3">
              {CHECKS.map((check, i) => {
                const result = results[check.id];
                const status = result
                  ? result.status
                  : check === running
                    ? 'checking'
                    : 'pending';
                return (
                  <CheckRow
                    key={check.id}
                    index={i}
                    icon={check.icon}
                    label={check.label}
                    status={status}
                    detail={result?.detail}
                    action={
                      result && result.status !== 'success' ? (
                        <button
                          type="button"
                          onClick={() => retry(check)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Retry
                        </button>
                      ) : null
                    }
                  />
                );
              })}

              <CheckRow
                index={CHECKS.length}
                icon={Volume2}
                label="Speakers"
                status={soundPlayed ? 'success' : 'pending'}
                detail={
                  soundPlayed
                    ? "Didn't hear it? Turn up your volume."
                    : 'Play a short sound to check your volume.'
                }
                action={
                  <button
                    type="button"
                    onClick={() => setSoundPlayed(playTestSound())}
                    className="text-xs text-primary hover:underline"
                  >
                    {soundPlayed ? 'Play again' : 'Play test sound'}
                  </button>
                }
              />
            </div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: canStart ? 1 : 0.5, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onStart}
                disabled={!canStart}
                className="group relative h-13 w-full overflow-hidden rounded-xl text-base font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
                size="lg"
              >
                {canStart && (
                  <motion.div
                    className="gradient-bg absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    animate={{
                      boxShadow: [
                        '0 0 20px color-mix(in srgb, var(--primary) 30%, transparent)',
                        '0 0 40px color-mix(in srgb, var(--primary) 50%, transparent)',
                        '0 0 20px color-mix(in srgb, var(--primary) 30%, transparent)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <span className="relative z-10">
                  {finished ? 'Start Interview' : 'Running checks...'}
                </span>
              </Button>
              {finished && hasWarnings && canStart && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Some checks need attention, but you can still start and type
                  your answers.
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PreStartModal;
