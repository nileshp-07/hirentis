'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CornerDownRight,
  Lightbulb,
  MessageSquareQuote,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { scoreBadgeClass } from './chartTheme';

const FeedbackList = ({ title, items, icon: Icon, tone }) => (
  <div>
    <h4
      className={cn(
        'mb-2 flex items-center gap-1.5 text-xs font-semibold',
        tone
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {title}
    </h4>
    {items.length > 0 ? (
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item}
            className="text-xs leading-relaxed text-muted-foreground"
          >
            • {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs italic text-muted-foreground/70">None noted.</p>
    )}
  </div>
);

const QuestionItem = ({ question, index }) => {
  const [open, setOpen] = useState(false);
  const panelId = `question-panel-${question.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.06, 0.3) }}
    >
      <Card className="overflow-hidden p-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-secondary/30 sm:p-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {question.isFollowup ? (
                <CornerDownRight className="h-3.5 w-3.5 text-primary" />
              ) : (
                `Q${question.number}`
              )}
            </span>
            <span className="truncate text-sm font-medium">
              {question.text}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {question.score == null ? (
              <Badge className="border border-border bg-secondary text-xs text-muted-foreground">
                Not scored
              </Badge>
            ) : (
              <Badge
                className={cn(
                  'border text-xs',
                  scoreBadgeClass(question.score)
                )}
              >
                {question.score.toFixed(1)}/10
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                open && 'rotate-180'
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-border px-4 pb-5 pt-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  {question.topic && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {question.topic}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-muted-foreground">
                    {question.difficulty.charAt(0) +
                      question.difficulty.slice(1).toLowerCase()}
                  </Badge>
                  {question.isFollowup && (
                    <Badge className="border-primary/25 bg-primary/10 text-primary">
                      Follow-up to Q{question.number}
                    </Badge>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-secondary/25 p-3.5">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Your answer
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary-foreground">
                    {question.answer}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FeedbackList
                    title="Strengths"
                    items={question.strengths}
                    icon={CheckCircle2}
                    tone="text-emerald-500"
                  />
                  <FeedbackList
                    title="Weaknesses"
                    items={question.weaknesses}
                    icon={AlertTriangle}
                    tone="text-amber-500"
                  />
                  <FeedbackList
                    title="Improvements"
                    items={question.improvements}
                    icon={Lightbulb}
                    tone="text-sky-500"
                  />
                </div>

                {question.feedback && (
                  <div className="flex gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                    <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-secondary-foreground">
                      {question.feedback}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const QuestionBreakdown = ({ questions }) => (
  <section className="space-y-3">
    <div>
      <h2 className="text-sm font-semibold">Question breakdown</h2>
      <p className="text-xs text-muted-foreground">
        Open a question to see your answer and the feedback on it.
      </p>
    </div>
    {questions.map((question, index) => (
      <QuestionItem key={question.id} question={question} index={index} />
    ))}
  </section>
);

export default QuestionBreakdown;
