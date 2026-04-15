import { motion } from 'framer-motion';

export const ScoreRing = ({ score }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient
            id={`score-ring-${score}`}
            x1="0"
            y1="0"
            x2="80"
            y2="80"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--gradient-purple)" />
            <stop offset="1" stopColor="var(--gradient-blue)" />
          </linearGradient>
        </defs>
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="var(--border)"
          strokeWidth="8"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke={`url(#score-ring-${score})`}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: circumference - progress,
          }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold">{score.toFixed(1)}</span>
        <span className="text-[10px] text-muted-foreground">/10</span>
      </div>
    </div>
  );
};
