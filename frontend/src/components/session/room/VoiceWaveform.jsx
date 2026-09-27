'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BARS = Array.from(
  { length: 28 },
  (_, i) => 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))
);

const VoiceWaveform = ({ active = false, className }) => (
  <div
    aria-hidden="true"
    className={cn('flex h-8 items-center gap-[3px]', className)}
  >
    {BARS.map((height, i) => (
      <motion.span
        key={i}
        className={cn(
          'w-[3px] rounded-full',
          active ? 'gradient-bg' : 'bg-muted-foreground/25'
        )}
        animate={
          active
            ? { height: ['20%', `${height * 100}%`, '30%'] }
            : { height: '15%' }
        }
        transition={
          active
            ? {
                duration: 0.9 + (i % 5) * 0.12,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
      />
    ))}
  </div>
);

export default VoiceWaveform;
