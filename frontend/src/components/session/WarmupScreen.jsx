'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const tips = [
  'Speak clearly and structure your answer with context, action, and result.',
  'Take a brief pause before answering to organize your thoughts.',
  'Use specific examples from your experience whenever possible.',
  "It's okay to ask the AI to repeat or clarify a question.",
  'Focus on impact and measurable outcomes in your responses.',
];

const loadingStages = [
  'Initializing session...',
  'Calibrating AI interview engine...',
  'Loading your profile context...',
  'Preparing personalized questions...',
  'Almost ready...',
];

const STAGE_AT = [0, 20, 45, 70, 90];
const WAITING_PROGRESS = 90;

const WarmupScreen = ({ isReady = true, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const readyRef = useRef(isReady);

  useEffect(() => {
    readyRef.current = isReady;
  }, [isReady]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) =>
        readyRef.current
          ? Math.min(p + 2.5, 100)
          : Math.min(p + 1.2, WAITING_PROGRESS)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const timeout = setTimeout(onComplete, 600);
    return () => clearTimeout(timeout);
  }, [progress, onComplete]);

  useEffect(() => {
    const interval = setInterval(
      () => setTipIndex((i) => (i + 1) % tips.length),
      3500
    );
    return () => clearInterval(interval);
  }, []);

  const stageIndex = STAGE_AT.reduce(
    (acc, val, i) => (progress >= val ? i : acc),
    0
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative bg-background">
      <motion.div className="relative mb-12">
        <motion.div
          className="absolute inset-0 w-40 h-40 rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--primary) 15%, transparent), transparent 70%)',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -inset-4 w-48 h-48 rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--primary) 8%, transparent), transparent 70%)',
          }}
          animate={{ scale: [1.1, 1.4, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />

        <motion.div
          className="w-40 h-40 rounded-full gradient-bg relative flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-1 rounded-full bg-card/30 backdrop-blur-sm" />
          <motion.div
            className="relative z-10 text-primary-foreground"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <circle
                cx="24"
                cy="24"
                r="12"
                stroke="currentColor"
                strokeOpacity="0.6"
                strokeWidth="1.5"
              />
              <circle
                cx="24"
                cy="24"
                r="4"
                fill="currentColor"
                fillOpacity="0.9"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.h2
        key={stageIndex}
        className="text-xl md:text-2xl font-semibold text-foreground mb-3 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {loadingStages[stageIndex]}
      </motion.h2>

      <p className="text-sm text-muted-foreground mb-8 text-center">
        Preparing your personalized interview experience
      </p>

      <div className="w-full max-w-md mb-10">
        <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full gradient-bg"
            style={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.1 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {Math.round(Math.min(progress, 100))}%
        </p>
      </div>

      <motion.div
        className="max-w-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-lg px-6 py-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">
          Interview Tip
        </p>
        <motion.p
          key={tipIndex}
          className="text-sm text-secondary-foreground leading-relaxed"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
        >
          {tips[tipIndex]}
        </motion.p>
      </motion.div>

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default WarmupScreen;
