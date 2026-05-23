import { useEffect, useState } from "react";

/** Animierte Zahl (Count-up) — ohne Framer-Motion-Abhängigkeit. */
export default function CountUp({ value, duration = 900, format = (n) => String(Math.round(n)) }) {
  const target =
    typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, "")) || 0;
  const [text, setText] = useState(() => format(0));

  useEffect(() => {
    if (!Number.isFinite(target) || target === 0) {
      setText(format(0));
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setText(format(target * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, format]);

  return <span>{text}</span>;
}
