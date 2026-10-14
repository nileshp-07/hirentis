'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownRight, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InterviewerOrb, { OrbStatusPill } from './InterviewerOrb';
import { DIFFICULTY_STYLES, QUESTION_TYPE_LABELS, toTitleCase } from './format';

const WORD_DELAY = 0.045;

const QuestionStage = ({
  question,
  isThinking,
  totalQuestions,
  voiceStatus,
  onReplay,
  onStopVoice,
}) => {
  const [askedQuestionId, setAskedQuestionId] = useState(null);
  const words = question.question_text.split(/\s+/);

  useEffect(() => {
    const revealMs = Math.min(4000, 700 + words.length * WORD_DELAY * 1000);
    const timeout = setTimeout(() => setAskedQuestionId(question.id), revealMs);
    return () => clearTimeout(timeout);
  }, [question.id, words.length]);

  const isSpeaking = voiceStatus === 'speaking';
  const status = isThinking
    ? 'thinking'
    : isSpeaking || askedQuestionId !== question.id
      ? 'asking'
      : 'listening';

  return (
    <section className="flex flex-col items-center text-center">
      <InterviewerOrb status={status} size={96} />

      <div className="mt-5 flex flex-col items-center gap-2">
        <p className="text-sm font-semibold">Hirentis AI Interviewer</p>
        <OrbStatusPill status={status} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isThinking ? 0.45 : 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="mt-8 w-full"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            {question.isFollowup ? (
              <Badge className="gap-1 border-primary/25 bg-primary/10 text-primary">
                <CornerDownRight />
                Follow-up to Q{question.mainNumber}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Question {question.mainNumber} of {totalQuestions}
              </Badge>
            )}
            <Badge variant="outline" className="text-muted-foreground">
              {QUESTION_TYPE_LABELS[question.question_type] ??
                toTitleCase(question.question_type)}
            </Badge>
            <Badge
              variant="outline"
              className={cn(DIFFICULTY_STYLES[question.difficulty])}
            >
              {toTitleCase(question.difficulty)}
            </Badge>
          </div>

          <h1
            aria-live="polite"
            className="mx-auto mt-6 max-w-2xl text-balance text-2xl font-semibold leading-snug tracking-tight md:text-[1.75rem]"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: i * WORD_DELAY, duration: 0.25 }}
              >
                {word}{' '}
              </motion.span>
            ))}
          </h1>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={isSpeaking ? onStopVoice : onReplay}
            disabled={isThinking}
            className={cn(
              'mt-5 gap-2',
              voiceStatus === 'blocked'
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-4 w-4" />
                Stop speaking
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                {voiceStatus === 'blocked'
                  ? 'Play question'
                  : 'Replay question'}
              </>
            )}
          </Button>
          {voiceStatus === 'blocked' && (
            <p className="mt-1 text-xs text-muted-foreground">
              Your browser paused the audio. Click to hear the question.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default QuestionStage;
