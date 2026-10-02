'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ActiveAttemptBanner = ({ attempt }) => {
  const progress = Math.min(
    100,
    Math.round((attempt.questionsAnswered / attempt.totalQuestions) * 100)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="flex flex-col gap-4 border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <PlayCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-semibold">Pick up where you left off</p>
            <p className="text-sm text-muted-foreground">
              {attempt.interviewTitle} · {attempt.questionsAnswered} of{' '}
              {attempt.totalQuestions} questions answered
            </p>
          </div>
          <Progress
            value={progress}
            aria-label={`${attempt.questionsAnswered} of ${attempt.totalQuestions} questions answered`}
            className="h-1.5 max-w-sm bg-secondary"
          />
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link
            href={`/dashboard/interviews/${attempt.interviewId}/session/${attempt.id}`}
          >
            Continue interview
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>
    </motion.div>
  );
};

export default ActiveAttemptBanner;
