'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Brain, MessageSquare, Shield, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { scoreTextClass } from './chartTheme';

const ANIMATION_MS = 900;

const AnimatedScore = ({ target }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    let startedAt;
    const step = (timestamp) => {
      if (!startedAt) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / ANIMATION_MS, 1);
      setValue(progress * target);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <>{value.toFixed(1)}</>;
};

const ScoreCards = ({ scores }) => {
  const cards = [
    { key: 'overall', label: 'Overall', icon: Award, value: scores.overall },
    {
      key: 'technical',
      label: 'Technical',
      icon: Brain,
      value: scores.technical,
    },
    {
      key: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      value: scores.communication,
    },
    {
      key: 'problemSolving',
      label: 'Problem solving',
      icon: Target,
      value: scores.problemSolving,
    },
    {
      key: 'confidence',
      label: 'Confidence',
      icon: Shield,
      value: scores.confidence,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.07, duration: 0.4 }}
        >
          <Card
            className={cn(
              'flex h-full flex-col items-center gap-2 p-4 text-center transition-colors hover:border-primary/30',
              card.key === 'overall' && 'gradient-border border-transparent'
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">{card.label}</span>
            <span
              className={cn('text-2xl font-bold', scoreTextClass(card.value))}
            >
              <AnimatedScore target={card.value} />
              <span className="text-sm font-medium text-muted-foreground">
                /10
              </span>
            </span>
            <Progress
              value={card.value * 10}
              aria-label={`${card.label} score ${card.value} out of 10`}
              className="h-1.5 bg-secondary"
            />
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ScoreCards;
