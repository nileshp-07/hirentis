'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mic, SendHorizontal, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VoiceWaveform from './VoiceWaveform';
import { formatDuration } from './format';

const MAX_LENGTH = 5000;

// Drafts survive a page refresh; one key per question
const draftKey = (questionId) => `hirentis:answer-draft:${questionId}`;

const readDraft = (questionId) => {
  try {
    return window.localStorage.getItem(draftKey(questionId)) ?? '';
  } catch {
    return '';
  }
};

const writeDraft = (questionId, text) => {
  try {
    if (text) window.localStorage.setItem(draftKey(questionId), text);
    else window.localStorage.removeItem(draftKey(questionId));
  } catch {
    // Storage unavailable (private mode, blocked): drafts just aren't kept
  }
};

const AnswerComposer = ({ questionId, onSubmit, isSubmitting }) => {
  const [text, setText] = useState(() => readDraft(questionId));
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && !isSubmitting;

  const handleChange = (event) => {
    const value = event.target.value.slice(0, MAX_LENGTH);
    setText(value);
    writeDraft(questionId, value);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const responseTimeSeconds = Math.round(
      (Date.now() - startedAtRef.current) / 1000
    );
    const submitted = await onSubmit({ text: trimmed, responseTimeSeconds });
    if (submitted) writeDraft(questionId, '');
    else textareaRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={cn(
        'gradient-border rounded-2xl bg-card/80 shadow-xl shadow-black/10 backdrop-blur-xl',
        isSubmitting && 'opacity-80'
      )}
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative">
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled
            aria-label="Answer with your voice (coming soon)"
            title="Voice answers are coming soon — type your answer for now"
            className="h-10 w-10 rounded-full border-border bg-secondary/40"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <span className="absolute -right-2 -top-2 rounded-full gradient-bg px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
            Soon
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground">Your answer</p>
          <p className="truncate text-[11px] text-muted-foreground">
            Voice answers are coming soon. Type your answer and review it before
            submitting.
          </p>
        </div>

        <VoiceWaveform active={false} className="hidden sm:flex" />

        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-2.5 py-1 font-mono text-xs text-muted-foreground"
          title="Time spent on this answer"
        >
          <Timer className="h-3.5 w-3.5" />
          {formatDuration(elapsed)}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        autoFocus
        rows={6}
        maxLength={MAX_LENGTH}
        aria-label="Your answer"
        placeholder="Start typing your answer… Explain your reasoning as you would out loud in a real interview."
        className="block max-h-[40vh] min-h-[150px] w-full resize-y bg-transparent px-4 py-4 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl
          </kbd>{' '}
          +{' '}
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{' '}
          to submit
          <span className="mx-2 text-border">|</span>
          <span
            className={cn(
              'font-mono',
              text.length > MAX_LENGTH * 0.9 && 'text-amber-500'
            )}
          >
            {text.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </span>
        </p>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="min-w-[150px] gap-2 shadow-md shadow-primary/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              Submit answer
              <SendHorizontal className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default AnswerComposer;
