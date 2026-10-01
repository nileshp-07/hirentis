export const SCORE_DOMAIN = [0, 10];

export const AXIS_TICK = { fill: 'var(--muted-foreground)', fontSize: 11 };
export const GRID_STROKE = 'var(--border)';
export const SERIES_COLOR = 'var(--primary)';

export const TOOLTIP_PROPS = {
  cursor: { fill: 'color-mix(in srgb, var(--primary) 8%, transparent)' },
  contentStyle: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    color: 'var(--foreground)',
    fontSize: 12,
    boxShadow: '0 8px 24px -12px rgb(0 0 0 / 0.45)',
  },
  labelStyle: { color: 'var(--muted-foreground)', marginBottom: 2 },
  itemStyle: { color: 'var(--foreground)' },
  formatter: (value) => [`${value} / 10`, 'Score'],
};

export const scoreTextClass = (score) =>
  score >= 8
    ? 'text-emerald-500'
    : score >= 6
      ? 'text-amber-500'
      : 'text-rose-500';

export const scoreBadgeClass = (score) =>
  score >= 8
    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500'
    : score >= 6
      ? 'border-amber-500/25 bg-amber-500/10 text-amber-500'
      : 'border-rose-500/25 bg-rose-500/10 text-rose-500';

export const formatDuration = (totalSeconds = 0) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
};
