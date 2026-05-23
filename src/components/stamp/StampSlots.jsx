import { motion } from "framer-motion";

const SIZES = {
  sm: { slot: 26, gap: 6, font: 10, check: 11 },
  md: { slot: 34, gap: 8, font: 11, check: 14 },
  lg: { slot: 42, gap: 10, font: 12, check: 16 },
};

/**
 * Premium-Stempelreihe in Spot-Farbe
 */
export default function StampSlots({
  points,
  pts,
  max = 10,
  color = "#1B4FD8",
  size = "md",
  animate = true,
  onDark = false,
}) {
  const s = SIZES[size] || SIZES.md;
  const filled = Math.min(max, Math.max(0, points ?? pts ?? 0));

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: s.gap,
        alignItems: "center",
      }}
    >
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < filled;
        const isLast = isFilled && i === filled - 1;
        const Wrapper = animate ? motion.div : "div";
        const animProps = animate
          ? {
              initial: { scale: 0.85, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { delay: i * 0.04, type: "spring", stiffness: 380, damping: 22 },
            }
          : {};

        return (
          <Wrapper
            key={i}
            {...animProps}
            style={{
              width: s.slot,
              height: s.slot,
              borderRadius: "50%",
              flexShrink: 0,
              position: "relative",
              background: isFilled
                ? onDark
                  ? "linear-gradient(145deg, rgba(255,255,255,.95) 0%, rgba(255,255,255,.75) 100%)"
                  : `linear-gradient(145deg, ${color} 0%, ${color}bb 100%)`
                : onDark
                  ? "rgba(255,255,255,.12)"
                  : "rgba(255,255,255,.85)",
              border: isFilled
                ? onDark
                  ? "2px solid rgba(255,255,255,.5)"
                  : `2px solid ${color}`
                : onDark
                  ? "2px solid rgba(255,255,255,.2)"
                  : `2px solid ${color}35`,
              boxShadow: isFilled
                ? onDark
                  ? "0 2px 10px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.5)"
                  : `0 4px 14px ${color}40, inset 0 1px 0 rgba(255,255,255,.35)`
                : onDark
                  ? "inset 0 0 0 1px rgba(255,255,255,.08)"
                  : `inset 0 0 0 1px rgba(255,255,255,.8)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isFilled ? (
              <span
                style={{
                  color: onDark ? color : "#fff",
                  fontSize: s.check,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {isLast ? "★" : "✓"}
              </span>
            ) : (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: onDark ? "rgba(255,255,255,.25)" : `${color}28`,
                }}
              />
            )}
          </Wrapper>
        );
      })}
    </div>
  );
}
