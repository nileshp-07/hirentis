'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mic, SendHorizontal, Square, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
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

const appendSpeech = (text, speech) => {
  const startsSentence = !text.trim() || /[.!?]\s*$/.test(text);
  const chunk = startsSentence
    ? speech.charAt(0).toUpperCase() + speech.slice(1)
    : speech;
  if (!text) return chunk;
  return /\s$/.test(text) ? `${text}${chunk}` : `${text} ${chunk}`;
};

const statusMessage = ({ isSupported, isListening, error }) => {
  if (!isSupported) {
    return 'Voice answers need Chrome, Edge or Safari. Type your answer instead.';
  }
  if (error) return error;
  if (isListening) return 'Listening… click Stop when you finish.';
  return 'Click Speak and answer out loud, or type. Review it before submitting.';
};

const AnswerComposer = ({
  questionId,
  onSubmit,
  isSubmitting,
  onStartSpeaking,
}) => {
  const [text, setText] = useState(() => readDraft(questionId));
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef(null);
  const textareaRef = useRef(null);

  const appendFinalSpeech = useCallback((speech) => {
    setText((current) => appendSpeech(current, speech).slice(0, MAX_LENGTH));
  }, []);

  const { isSupported, isListening, interimText, error, start, stop } =
    useSpeechRecognition({ onFinalText: appendFinalSpeech });

  useEffect(() => {
    startedAtRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    writeDraft(questionId, text);
  }, [questionId, text]);

  const wasListeningRef = useRef(false);
  useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
    }
    wasListeningRef.current = isListening;
  }, [isListening]);

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && !isSubmitting && !isListening;
  const displayText = interimText ? appendSpeech(text, interimText) : text;

  const handleChange = (event) => {
    setText(event.target.value.slice(0, MAX_LENGTH));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const responseTimeSeconds = Math.round(
      (Date.now() - startedAtRef.current) / 1000
    );
    const submitted = await onSubmit({ text: trimmed, responseTimeSeconds });
    if (submitted) {
      writeDraft(questionId, '');
      // When the interviewer rewords the same question the composer stays mounted
      setText('');
      startedAtRef.current = Date.now();
      setElapsed(0);
    } else textareaRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stop();
      return;
    }
    onStartSpeaking?.();
    start();
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
        <Button
          type="button"
          onClick={toggleListening}
          disabled={!isSupported || isSubmitting}
          aria-pressed={isListening}
          variant={isListening ? 'destructive' : 'default'}
          title={
            isSupported
              ? undefined
              : 'Voice answers need Chrome, Edge or Safari'
          }
          className="h-10 shrink-0 gap-2 rounded-full px-4"
        >
          {isListening ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                <Square className="relative h-2.5 w-2.5 fill-current" />
              </span>
              Stop
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Speak
            </>
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground">Your answer</p>
          <p
            role="status"
            className={cn(
              'truncate text-[11px]',
              error ? 'text-amber-500' : 'text-muted-foreground'
            )}
          >
            {statusMessage({ isSupported, isListening, error })}
          </p>
        </div>

        <VoiceWaveform active={isListening} className="hidden sm:flex" />

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
        value={displayText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        readOnly={isListening}
        autoFocus
        rows={6}
        maxLength={MAX_LENGTH}
        aria-label="Your answer"
        placeholder={
          isListening
            ? 'Listening… start speaking.'
            : 'Click Speak, or start typing your answer… Explain your reasoning as you would out loud in a real interview.'
        }
        className={cn(
          'block max-h-[40vh] min-h-[150px] w-full resize-y bg-transparent px-4 py-4 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:cursor-not-allowed',
          isListening && 'cursor-default'
        )}
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
          title={
            isListening
              ? 'Stop speaking to review your answer first'
              : undefined
          }
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
