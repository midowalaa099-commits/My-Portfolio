import { useEffect, useState } from 'react';
// The ledger and accessible values settle immediately; this is presentation only.
export function useCount(value, from = value, duration = 420, delay = 0) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    let start;
    const finish = () => { cancelAnimationFrame(frame); setDisplay(value); };
    if (reduce.matches || value === from) { finish(); return; }
    setDisplay(from);
    function tick(now) {
      start ??= now;
      const progress = Math.min(1, Math.max(0, (now - start - delay) / duration));
      setDisplay(Math.round(from + (value - from) * (1 - (1 - progress) ** 3)));
      if (progress < 1 && !document.hidden) frame = requestAnimationFrame(tick);
      else finish();
    }
    frame = requestAnimationFrame(tick);
    const hidden = () => { if (document.hidden) finish(); };
    document.addEventListener('visibilitychange', hidden);
    reduce.addEventListener('change', finish);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', hidden); reduce.removeEventListener('change', finish); };
  }, [value, from, duration, delay]);
  return display;
}
