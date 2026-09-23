export const QUESTION_TYPE_LABELS = {
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
  SYSTEM_DESIGN: 'System Design',
  FOLLOWUP: 'Follow-up',
};

export const DIFFICULTY_STYLES = {
  EASY: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
  MEDIUM: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
  HARD: 'border-rose-500/20 bg-rose-500/10 text-rose-500',
};

export const toTitleCase = (value = '') =>
  value.charAt(0) + value.slice(1).toLowerCase();

export const formatDuration = (totalSeconds = 0) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};
