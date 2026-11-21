'use client';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SECTION_TONES = {
  strengths: {
    title: 'Strengths',
    icon: CheckCircle2,
    tone: 'text-emerald-500',
    dot: 'bg-emerald-500',
  },
  weaknesses: {
    title: 'Weaknesses',
    icon: AlertTriangle,
    tone: 'text-amber-500',
    dot: 'bg-amber-500',
  },
  suggestions: {
    title: 'Suggestions',
    icon: Lightbulb,
    tone: 'text-sky-500',
    dot: 'bg-sky-500',
  },
};

export const InsightCards = ({ strengths, weaknesses, suggestions }) => {
  const sections = [
    { key: 'strengths', items: strengths },
    { key: 'weaknesses', items: weaknesses },
    { key: 'suggestions', items: suggestions },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {sections.map(({ key, items }, index) => {
        const { title, icon: Icon, tone, dot } = SECTION_TONES[key];
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="h-full p-5">
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-1.5', tone)}>
                  <Icon className="h-4 w-4" />
                  {title}
                </CardTitle>
              </CardHeader>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-1 w-1 shrink-0 rounded-full',
                        dot
                      )}
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export const ReadinessCard = ({ verdict, priorities }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="gradient-border border-transparent bg-gradient-to-r from-primary/5 via-card to-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Flag className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="mb-1 text-sm font-semibold">Where you stand</h3>
          <p className="text-sm leading-relaxed text-secondary-foreground">
            {verdict}
          </p>
          {priorities.length > 0 && (
            <>
              <p className="mb-1.5 mt-4 text-xs font-semibold text-muted-foreground">
                Fix these first
              </p>
              <ol className="space-y-1.5">
                {priorities.map((priority, index) => (
                  <li
                    key={priority}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span className="font-mono text-xs text-primary">
                      {index + 1}.
                    </span>
                    <span className="leading-relaxed">{priority}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
);

export const AiSummaryCard = ({ summary }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <Card className="gradient-border border-transparent bg-gradient-to-r from-primary/5 via-card to-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold">AI insight</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </div>
      </div>
    </Card>
  </motion.div>
);
