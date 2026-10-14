import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthToken } from '@/redux/api/apiSlice';

const MUTED_KEY = 'hirentis:interviewer-muted';
const ASK_DELAY_MS = 300;

const readMuted = () => {
  try {
    return window.localStorage.getItem(MUTED_KEY) === 'true';
  } catch {
    return false;
  }
};

const speakable = (text) =>
  text.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();

const pickBrowserVoice = () => {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const english = voices.filter((voice) =>
    voice.lang?.toLowerCase().startsWith('en')
  );
  return (
    english.find((voice) =>
      /natural|neural|google|samantha/i.test(voice.name)
    ) ??
    english[0] ??
    null
  );
};

const fetchSpeechUrl = async (sessionId, questionId) => {
  const token = await getAuthToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/questions/${questionId}/speech`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  if (!response.ok)
    throw new Error(`Speech request failed (${response.status})`);
  return URL.createObjectURL(await response.blob());
};

export const useInterviewerVoice = ({ sessionId, question }) => {
  const [muted, setMuted] = useState(readMuted);
  const [status, setStatus] = useState('idle');

  const audioRef = useRef(null);
  const audioUrlsRef = useRef(new Map());
  const playIdRef = useRef(0);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const halt = useCallback(() => {
    playIdRef.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
  }, []);

  const speakWithBrowserVoice = useCallback((text, playId) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setStatus('idle');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(speakable(text));
    const voice = pickBrowserVoice();
    if (voice) utterance.voice = voice;
    const isCurrent = () => playId === playIdRef.current;
    utterance.onstart = () => isCurrent() && setStatus('speaking');
    utterance.onend = () => isCurrent() && setStatus('idle');
    utterance.onerror = (event) =>
      isCurrent() &&
      setStatus(event.error === 'not-allowed' ? 'blocked' : 'idle');
    synth.speak(utterance);
  }, []);

  const play = useCallback(
    async (questionId, text) => {
      halt();
      const playId = playIdRef.current;
      const isCurrent = () => playId === playIdRef.current;

      const urls = audioUrlsRef.current;
      if (!urls.has(questionId)) {
        urls.set(questionId, fetchSpeechUrl(sessionId, questionId));
      }
      let url;
      try {
        url = await urls.get(questionId);
      } catch {
        urls.delete(questionId);
        if (isCurrent()) speakWithBrowserVoice(text, playId);
        return;
      }
      if (!isCurrent()) return;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => isCurrent() && setStatus('idle');
      try {
        await audio.play();
        if (isCurrent()) setStatus('speaking');
      } catch (err) {
        if (isCurrent()) {
          setStatus(err?.name === 'NotAllowedError' ? 'blocked' : 'idle');
        }
      }
    },
    [sessionId, halt, speakWithBrowserVoice]
  );

  const questionId = question?.id;
  const questionText = question?.question_text;

  useEffect(() => {
    if (!questionId || mutedRef.current) return undefined;
    const timer = setTimeout(
      () => play(questionId, questionText),
      ASK_DELAY_MS
    );
    return () => {
      clearTimeout(timer);
      halt();
      setStatus('idle');
    };
  }, [questionId, questionText, play, halt]);

  useEffect(() => {
    const urls = audioUrlsRef.current;
    return () => {
      halt();
      urls.forEach((url) => url.then(URL.revokeObjectURL, () => {}));
    };
  }, [halt]);

  const stop = useCallback(() => {
    halt();
    setStatus('idle');
  }, [halt]);

  const replay = useCallback(() => {
    if (questionId) play(questionId, questionText);
  }, [questionId, questionText, play]);

  const toggleMuted = useCallback(() => {
    const next = !muted;
    setMuted(next);
    try {
      window.localStorage.setItem(MUTED_KEY, String(next));
    } catch {}
    if (next) stop();
  }, [muted, stop]);

  return { muted, status, toggleMuted, replay, stop };
};
