import { useEffect, useState, useRef } from "react";

const defaultFormat = (n) => String(Math.round(n));

/** Animierte Zahl — stabile Format-Funktion, kein Re-Trigger bei Parent-Re-Renders. */
export default function CountUp({ value, duration = 700, format, animate = true }) {
  const formatRef = useRef(format ?? defaultFormat);
  formatRef.current = format ?? formatRef.current;

  const target =
    typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, "")) || 0;

  const [text, setText] = useState(() => formatRef.current(target));

  useEffect(() => {
    const fmt = formatRef.current;
    if (!Number.isFinite(target)) {
      setText(fmt(0));
      return undefined;
    }
    if (!animate || target === 0) {
      setText(fmt(target));
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setText(fmt(target * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, animate]);

  return <span>{text}</span>;
}
