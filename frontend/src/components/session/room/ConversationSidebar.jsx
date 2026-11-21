'use client';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessagesSquare, Sparkles, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDuration } from './format';

const InterviewerMessage = ({ question, isCurrent }) => (
  <div className="flex gap-3">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-bg">
      <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
    </div>
    <div
      className={cn(
        'min-w-0 flex-1 rounded-2xl rounded-tl-sm border px-3.5 py-2.5',
        isCurrent
          ? 'gradient-border border-transparent bg-primary/5'
          : 'border-border bg-secondary/30'
      )}
    >
      <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span>Question {question.mainNumber}</span>
        {isCurrent && (
          <span className="rounded-full bg-primary/15 px-1.5 py-px text-[10px] font-semibold text-primary">
            Current
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed">{question.question_text}</p>
    </div>
  </div>
);

const CandidateMessage = ({ response, avatarUrl, initials }) => (
  <div className="flex flex-row-reverse gap-3">
    {avatarUrl ? (
      <img
        src={avatarUrl}
        alt=""
        className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover"
      />
    ) : (
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">
        {initials}
      </div>
    )}
    <div className="min-w-0 max-w-[85%] rounded-2xl rounded-tr-sm border border-border bg-card px-3.5 py-2.5">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-secondary-foreground">
        {response.response_text}
      </p>
      {response.response_time_seconds != null && (
        <p className="mt-1.5 text-right font-mono text-[10px] text-muted-foreground">
          {formatDuration(response.response_time_seconds)}
        </p>
      )}
    </div>
  </div>
);

const ThinkingMessage = () => (
  <div className="flex items-center gap-3">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-bg">
      <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
    </div>
    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-secondary/30 px-4 py-3">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
        />
      ))}
    </div>
  </div>
);

const ConversationSidebar = ({
  open,
  onClose,
  questions,
  currentQuestionId,
  isThinking,
}) => {
  const { user } = useUser();
  const endRef = useRef(null);
  const answeredCount = questions.filter((q) => q.response).length;
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') ||
    'You';

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, questions.length, answeredCount, isThinking]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="sidebar"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-border bg-sidebar lg:relative lg:inset-auto lg:z-auto lg:w-[380px] lg:max-w-none"
            aria-label="Interview conversation"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Conversation</h2>
                <span className="rounded-full bg-secondary px-2 py-px text-[11px] text-muted-foreground">
                  {answeredCount} answered
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Hide conversation"
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <InterviewerMessage
                    question={question}
                    isCurrent={question.id === currentQuestionId}
                  />
                  {question.response && (
                    <CandidateMessage
                      response={question.response}
                      avatarUrl={user?.imageUrl}
                      initials={initials}
                    />
                  )}
                </div>
              ))}
              {isThinking && <ThinkingMessage />}
              <div ref={endRef} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConversationSidebar;
