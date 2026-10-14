import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

const getRecognitionClass = () =>
  typeof window === 'undefined'
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition || null;

export const isSpeechRecognitionSupported = () =>
  Boolean(getRecognitionClass());

const ERROR_MESSAGES = {
  'not-allowed':
    'Microphone access is blocked. Allow it from the address bar, or type your answer.',
  'service-not-allowed':
    'Microphone access is blocked. Allow it from the address bar, or type your answer.',
  'audio-capture': 'No microphone was found. Connect one, or type your answer.',
  network:
    'Voice input needs an internet connection. Type your answer for now.',
  'language-not-supported':
    "Voice input isn't available for this language. Type your answer instead.",
};
const UNEXPECTED_STOP =
  'Voice input stopped unexpectedly. Try again, or type your answer.';

const MIN_SESSION_MS = 1000;

const subscribeNoop = () => () => {};

export const useSpeechRecognition = ({ onFinalText, lang = 'en-US' }) => {
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    isSpeechRecognitionSupported,
    () => false
  );
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const keepListeningRef = useRef(false);
  const startedAtRef = useRef(0);
  const onFinalTextRef = useRef(onFinalText);

  useEffect(() => {
    onFinalTextRef.current = onFinalText;
  }, [onFinalText]);

  const stop = useCallback(() => {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognitionClass();
    if (!Recognition || keepListeningRef.current) return;
    setError(null);

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      startedAtRef.current = Date.now();
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        if (!transcript) continue;
        if (result.isFinal) onFinalTextRef.current?.(transcript);
        else interim = interim ? `${interim} ${transcript}` : transcript;
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      const message = ERROR_MESSAGES[event.error];
      if (message) {
        keepListeningRef.current = false;
        setError(message);
      }
    };

    recognition.onend = () => {
      setInterimText('');
      if (keepListeningRef.current) {
        if (Date.now() - startedAtRef.current >= MIN_SESSION_MS) {
          try {
            recognition.start();
            return;
          } catch {}
        }
        setError(UNEXPECTED_STOP);
      }
      keepListeningRef.current = false;
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    keepListeningRef.current = true;
    try {
      recognition.start();
    } catch {
      keepListeningRef.current = false;
      recognitionRef.current = null;
      setError(UNEXPECTED_STOP);
    }
  }, [lang]);

  useEffect(
    () => () => {
      keepListeningRef.current = false;
      recognitionRef.current?.abort();
    },
    []
  );

  return { isSupported, isListening, interimText, error, start, stop };
};
