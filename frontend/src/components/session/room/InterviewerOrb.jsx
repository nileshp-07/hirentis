'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ORB_STATUS = {
  asking: { label: 'Asking', dot: 'bg-primary' },
  listening: { label: 'Your turn', dot: 'bg-emerald-500' },
  thinking: { label: 'Thinking', dot: 'bg-amber-500' },
};

const glow = (percent) =>
  `radial-gradient(circle, color-mix(in srgb, var(--primary) ${percent}%, transparent), transparent 70%)`;

const InterviewerOrb = ({ status = 'listening', size = 88, className }) => {
  const isAsking = status === 'asking';
  const isThinking = status === 'thinking';

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {isAsking &&
        [0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute inset-0 rounded-full border border-primary/40"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: ring * 0.6,
              ease: 'easeOut',
            }}
          />
        ))}

      <motion.div
        className="absolute -inset-4 rounded-full"
        style={{ background: glow(isThinking ? 12 : 22) }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative flex h-full w-full items-center justify-center rounded-full gradient-bg shadow-lg shadow-primary/30"
        animate={{ scale: isAsking ? [1, 1.06, 1] : [1, 1.03, 1] }}
        transition={{
          duration: isAsking ? 1.2 : 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="absolute inset-1 rounded-full bg-card/30 backdrop-blur-sm" />
        <motion.svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 48 48"
          fill="none"
          className="relative z-10 text-primary-foreground"
          animate={{ rotate: 360 }}
          transition={{
            duration: isThinking ? 2 : 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeDasharray={isThinking ? '10 6' : '4 6'}
          />
          <circle
            cx="24"
            cy="24"
            r="12"
            stroke="currentColor"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
          <circle cx="24" cy="24" r="4" fill="currentColor" fillOpacity="0.9" />
        </motion.svg>
      </motion.div>
    </div>
  );
};

export const OrbStatusPill = ({ status }) => {
  const config = ORB_STATUS[status] ?? ORB_STATUS.listening;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
            config.dot
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            config.dot
          )}
        />
      </span>
      {config.label}
    </span>
  );
};

export default InterviewerOrb;
