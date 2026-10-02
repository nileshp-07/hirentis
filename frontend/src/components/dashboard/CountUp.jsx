'use client';
import { useEffect, useState } from 'react';

const ANIMATION_MS = 900;

const CountUp = ({ value, decimals = 0 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame;
    let startedAt;
    const step = (timestamp) => {
      if (!startedAt) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / ANIMATION_MS, 1);
      setCurrent(progress * value);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{current.toFixed(decimals)}</>;
};

export default CountUp;
