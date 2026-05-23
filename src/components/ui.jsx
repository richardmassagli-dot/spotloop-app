// ─── spotloop Design System v2 ────────────────────────────────────
import { C, CARD_GRADIENT } from "../design/tokens.js";

export { C, CARD_GRADIENT };

// ─── Screen ───────────────────────────────────────────────────────
export function Screen({ children, bg = C.bg, pad = true, scroll = true }) {
  return (
    <div
      className={scroll ? "scroll-y" : undefined}
      style={{
        background: bg,
        height: "100%",
        padding: pad ? "0 0 88px" : 0,
        fontFamily: "'Inter', -apple-system, 'Helvetica Neue', sans-serif",
        overflowY: scroll ? undefined : "hidden",
      }}
    >
      {children}
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────
const LOGO_LOCKUP = "/brand/spotloop-mark.png";
const LOGO_MARK = "/brand/spotloop-mark.png";
/** Original-Mark 172×215 (transparentes PNG) */
const MARK_ASPECT = 172 / 215;

/** Offizielles Spotloop-Symbol (transparentes PNG, exakt wie Brand). */
export function SpotloopIcon({ size = 28, light = false }) {
  const h = Math.round(size);
  const w = Math.round(h * MARK_ASPECT);
  return (
    <img
      src={LOGO_MARK}
      alt=""
      width={w}
      height={h}
      aria-hidden
      style={{
        display: "block",
        width: w,
        height: h,
        objectFit: "contain",
        flexShrink: 0,
        filter: light ? "none" : "brightness(0)",
      }}
    />
  );
}

/** Symbol + „spotloop“ direkt nebeneinander. hideText = nur Symbol. */
export function Logo({ size = 28, light = false, hideText = false }) {
  const textColor = light ? "#FFFFFF" : C.navy;
  const fontSize = Math.round(size * 0.82);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        lineHeight: 1,
      }}
    >
      <SpotloopIcon size={fontSize} light={light} />
      {!hideText && (
        <span
          style={{
            fontSize,
            fontWeight: 600,
            color: textColor,
            letterSpacing: -0.35,
            fontFamily: "'Inter', -apple-system, 'Helvetica Neue', sans-serif",
            margin: 0,
            marginLeft: 3,
            padding: 0,
            lineHeight: 1,
          }}
        >
          spotloop
        </span>
      )}
    </div>
  );
}

/** Vertikales PNG-Lockup (Ladebildschirm, Marketing). */
export function LogoLockup({ height = 72, light = false, style = {} }) {
  return (
    <img
      src={LOGO_LOCKUP}
      alt="spotloop"
      style={{
        height,
        width: "auto",
        objectFit: "contain",
        display: "block",
        ...(light ? {} : { filter: "brightness(0)" }),
        ...style,
      }}
    />
  );
}

// ─── Premium Card ─────────────────────────────────────────────────
export function PremiumCard({ profile, totalPoints = 0, readyCount = 0, style = {} }) {
  return (
    <div style={{
      background: CARD_GRADIENT,
      borderRadius: 24,
      padding: "22px 22px 20px",
      position: "relative",
      overflow: "hidden",
      boxShadow: `0 24px 56px rgba(10,22,40,.32), inset 0 1px 0 rgba(255,255,255,.07)`,
      ...style,
    }}>
      {/* Glassmorphic orb — top right */}
      <div style={{ position: "absolute", top: -70, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(14,165,233,.18)", pointerEvents: "none" }} />
      {/* Glassmorphic orb — bottom left */}
      <div style={{ position: "absolute", bottom: -60, left: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(99,102,241,.12)", pointerEvents: "none" }} />
      {/* Subtle noise texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(255,255,255,.018) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(255,255,255,.018) 24px)", pointerEvents: "none" }} />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, position: "relative" }}>
        <Logo size={20} light />
        <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 99, padding: "3px 11px" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: 2 }}>MEMBER</span>
        </div>
      </div>

      {/* Points */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.32)", letterSpacing: 2.5, fontWeight: 700, marginBottom: 5 }}>TREUEPUNKTE</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 1 }}>
          {totalPoints.toLocaleString("de")}
        </div>
        {readyCount > 0 && (
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,.2)", border: "1px solid rgba(249,115,22,.35)", borderRadius: 99, padding: "4px 12px" }}>
            <span style={{ fontSize: 12 }}>🎁</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>
              {readyCount} Reward{readyCount > 1 ? "s" : ""} einlösbar
            </span>
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.14)", letterSpacing: 5, fontFamily: "monospace" }}>•••• •••• ••••</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.28)", letterSpacing: 1, marginBottom: 2 }}>INHABER</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.65)" }}>{profile?.name?.split(" ")[0] || "–"}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", full = true, small = false, disabled = false, style = {} }) {
  const variants = {
    primary:   { background: C.blue,      color: "#fff",   border: "none",                     boxShadow: `0 4px 18px rgba(27,79,216,.35)` },
    secondary: { background: C.mintLight, color: C.blue,   border: `1.5px solid ${C.mint}`,    boxShadow: "none" },
    ghost:     { background: "transparent",color: C.muted,  border: `1.5px solid ${C.border}`,  boxShadow: "none" },
    dark:      { background: C.navy,      color: "#fff",   border: "none",                     boxShadow: "0 4px 14px rgba(10,22,40,.28)" },
    orange:    { background: C.orange,    color: "#fff",   border: "none",                     boxShadow: `0 4px 14px rgba(249,115,22,.3)` },
    danger:    { background: C.red,       color: "#fff",   border: "none",                     boxShadow: "none" },
    fresh:     { background: CARD_GRADIENT,color:"#fff",   border: "none",                     boxShadow: `0 4px 18px rgba(10,22,40,.28)` },
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{
      ...variants[variant],
      width: full ? "100%" : "auto",
      padding: small ? "9px 16px" : "14px 20px",
      borderRadius: 14,
      fontSize: small ? 13 : 14,
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "all .15s",
      letterSpacing: -0.2,
      ...style,
    }}>
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.white,
      borderRadius: 20,
      border: `1px solid ${C.border}`,
      padding: 16,
      boxShadow: `0 2px 16px ${C.shadow}`,
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────
export function ProgressBar({ value, max, color = C.blue, height = 6, bg }) {
  return (
    <div style={{ background: bg || `${color}18`, borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{
        background: color, height, borderRadius: 99,
        width: `${Math.min((value / Math.max(max, 1)) * 100, 100)}%`,
        transition: "width .5s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

// ─── Tag ──────────────────────────────────────────────────────────
export function Tag({ children, color = C.blue, bg = C.mintLight }) {
  return (
    <span style={{
      background: bg, color, borderRadius: 8,
      padding: "3px 9px", fontSize: 11, fontWeight: 700,
      display: "inline-block", letterSpacing: -0.1,
    }}>
      {children}
    </span>
  );
}

// ─── Back Button ──────────────────────────────────────────────────
export function BackBtn({ onClick, dark = false }) {
  return (
    <button onClick={onClick} style={{
      background: dark ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid ${dark ? "rgba(255,255,255,.15)" : C.border}`,
      borderRadius: 12, width: 40, height: 40,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: dark ? "#fff" : C.dark, fontSize: 18,
      boxShadow: dark ? "none" : `0 2px 10px ${C.shadow}`,
    }}>←</button>
  );
}

// ─── Input ────────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type = "text", error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: 0.2 }}>{label}</div>
      )}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
        width: "100%", background: C.bg,
        border: `1.5px solid ${error ? C.red : C.border}`,
        borderRadius: 12, padding: "13px 14px",
        fontSize: 14, color: C.dark, outline: "none",
        fontFamily: "inherit", transition: "border-color .15s",
        boxSizing: "border-box",
      }} />
      {error && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────
export function Spinner({ size = 24, color = C.blue }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2.5px solid ${color}28`,
      borderTop: `2.5px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.65s linear infinite",
    }} />
  );
}

// ─── Alert ────────────────────────────────────────────────────────
export function Alert({ type = "info", children }) {
  const s = {
    info:    { bg: C.mintLight,   border: C.sky,    color: C.blue },
    warning: { bg: C.orangeLight, border: C.orange,  color: C.orange },
    error:   { bg: "#FEE2E2",     border: C.red,     color: C.red },
    success: { bg: C.mintLight,   border: C.cyan,    color: C.navy },
  }[type];
  return (
    <div style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: s.color, fontWeight: 600, marginBottom: 12 }}>
      {children}
    </div>
  );
}

// ─── StatChip ─────────────────────────────────────────────────────
export function StatChip({ icon, value, label, color = C.blue, bg = C.mintLight }) {
  return (
    <div style={{ flex: 1, background: bg, borderRadius: 16, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── Global CSS ───────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("spotloop-styles")) {
  const s = document.createElement("style");
  s.id = "spotloop-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
    @keyframes pulse   { 0%,100% { opacity:.55 } 50% { opacity:1 } }
    @keyframes shimmer { 0% { transform:translateX(-100%) } 100% { transform:translateX(200%) } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { display: none; }
    body { scrollbar-width: none; }
    input, textarea, button { font-family: 'Inter', -apple-system, 'Helvetica Neue', sans-serif; }
  `;
  document.head.appendChild(s);
}
