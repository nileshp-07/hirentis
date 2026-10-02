import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScoreRing } from './ScoreRing';

export const CompletedInterviewCard = ({ attempt, interview, index }) => {
  const finishedOn = new Date(
    attempt.completed_at ?? attempt.created_at
  ).toLocaleDateString(undefined, { dateStyle: 'medium' });
  const isScored =
    attempt.report_status === 'COMPLETED' && attempt.overall_score != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.08, duration: 0.45 }}
    >
      <Card
        className="p-5 transition-all hover:y-[-4px] glow-card-small cursor-default"
        gradientBorder
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold leading-tight">{interview.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {interview.type}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {interview.techStack.map((item) => (
                <Badge key={item} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
            <p className="mb-2 mt-4 text-sm text-muted-foreground italic">
              {attempt.status === 'ABANDONED' ? 'Ended early' : 'Completed'}{' '}
              {finishedOn}
            </p>
          </div>
          {isScored ? (
            <ScoreRing score={attempt.overall_score} />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-8 border-border text-[10px] text-muted-foreground">
              Scoring…
            </div>
          )}
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full border-border bg-background/60 hover:bg-secondary/70"
        >
          <Link
            href={`/dashboard/interviews/${interview.id}/session/${attempt.id}/report`}
          >
            View Report
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </Card>
    </motion.div>
  );
};
