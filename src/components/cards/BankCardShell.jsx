import { motion } from "framer-motion";

/** Kontaktlos-Symbol */
export function BankCardContactless({ color = "rgba(255,255,255,.85)" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 12a8 8 0 0112.3 6.7M7 8.5a12 12 0 0117.1 10.1M7 5a16 16 0 0121.5 13.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Premium Bankkarten-Hülle — Kreditkarten-Proportionen, Chip, Glanz, Tiefe.
 */
export default function BankCardShell({
  gradient,
  children,
  footer,
  aspectRatio = 1.586,
  glow,
  style,
  onClick,
  whileTap,
}) {
  const Wrapper = onClick ? motion.button : motion.div;
  const tapProps = onClick ? { whileTap: whileTap ?? { scale: 0.985 } } : {};

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      {...tapProps}
      style={{
        width: "100%",
        aspectRatio: String(aspectRatio),
        borderRadius: 18,
        background: gradient,
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.18)",
        boxShadow: glow
          ? `${glow}, 0 22px 48px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.28), inset 0 -2px 0 rgba(0,0,0,.15)`
          : "0 22px 48px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.28), inset 0 -2px 0 rgba(0,0,0,.15)",
        cursor: onClick ? "pointer" : undefined,
        padding: 0,
        textAlign: "left",
        display: "block",
        ...style,
      }}
    >
      {/* Holografischer Schimmer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg, transparent 0%, rgba(255,255,255,.14) 42%, transparent 48%, rgba(255,255,255,.06) 55%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(0,0,0,.12)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "18px 20px 16px",
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        {children}
      </div>
      {footer}
    </Wrapper>
  );
}

/** Monospace Kartennummer-Stil */
export function BankCardNumber({ children, size = 15 }) {
  return (
    <div
      style={{
        fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.22em",
        color: "rgba(255,255,255,.92)",
        textShadow: "0 1px 2px rgba(0,0,0,.2)",
      }}
    >
      {children}
    </div>
  );
}
