// ─── spotloop Design System v2 ────────────────────────────────────
// Palette: Deep Navy · Ocean Blue · Sky Teal
// Feeling: Premium · Modern · Trustworthy · Minimal · App-Store Ready

export const C = {
  // ── Brand Primaries ──────────────────────────────────────────────
  navy:        "#0A1628",   // Deepest dark — hero backgrounds, headings
  blue:        "#1B4FD8",   // Ocean blue — primary CTA, active states
  sky:         "#0EA5E9",   // Sky blue — accents, highlights
  cyan:        "#06B6D4",   // Cyan — fresh accent
  cyanLight:   "#ECFEFF",   // Very light cyan

  // ── Backwards-compat aliases (screens use these names) ──────────
  green:       "#1B4FD8",   // → primary blue
  fresh:       "#06B6D4",   // → cyan
  teal:        "#0EA5E9",   // → sky blue
  tealMid:     "#0EA5E9",
  mint:        "#BAE6FD",   // light blue (was mint green)
  mintLight:   "#EFF6FF",   // very light blue
  tealLight:   "#E0F2FE",
  darkGreen:   "#0A1628",   // → navy

  // ── Backgrounds ──────────────────────────────────────────────────
  bg:          "#F7F9FF",   // Off-white with blue tint — main app bg
  white:       "#FFFFFF",
  card:        "#FFFFFF",

  // ── Typography ───────────────────────────────────────────────────
  dark:        "#0A1628",   // Deep navy — primary text
  mid:         "#1E2D45",
  muted:       "#64748B",   // Blue-gray muted text
  light:       "#94A3B8",

  // ── Semantic ─────────────────────────────────────────────────────
  orange:      "#F97316",   // Warm coral — rewards, CTAs
  orangeLight: "#FFF7ED",
  gold:        "#F59E0B",
  goldLight:   "#FFFBEB",
  purple:      "#6366F1",
  purpleLight: "#EEF2FF",
  red:         "#EF4444",

  // ── Chrome ───────────────────────────────────────────────────────
  border:      "#E2E8F5",   // Cool blue-tinted border
  shadow:      "rgba(10,22,40,.05)",
  shadowMd:    "rgba(10,22,40,.10)",
  shadowLg:    "rgba(10,22,40,.20)",
};

// Primary gradient — deep navy → ocean blue → sky
export const CARD_GRADIENT = "linear-gradient(145deg, #0A1628 0%, #1B4FD8 55%, #0EA5E9 100%)";

// ─── Screen ───────────────────────────────────────────────────────
export function Screen({ children, bg = C.bg, pad = true, scroll = true }) {
  return (
    <div style={{
      background: bg,
      minHeight: "100%",
      padding: pad ? "0 0 88px" : 0,
      fontFamily: "'Inter', -apple-system, 'Helvetica Neue', sans-serif",
      overflowY: scroll ? "auto" : "hidden",
    }}>
      {children}
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────
// Concept: Concentric horseshoe arcs (loop) + pin dot = location loop
export function Logo({ size = 28, light = false, hideText = false }) {
  const uid   = light ? "lt" : "dk";
  const c1    = light ? "#FFFFFF" : "#1B4FD8";
  const c2    = light ? "rgba(255,255,255,.65)" : "#0EA5E9";
  const text  = light ? "#FFFFFF" : C.navy;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(size * 0.38) }}>
      {/* Icon: double horseshoe + pin dot */}
      <svg width={Math.round(size * 0.9)} height={Math.round(size * 1.05)} viewBox="0 0 22 26" fill="none">
        <defs>
          <linearGradient id={`slg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        {/* Outer horseshoe — 300° arc, open at bottom, center (11,10) r≈9 */}
        <path
          d="M 3 14 A 9 9 0 1 1 19 14"
          stroke={`url(#slg-${uid})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Inner horseshoe — 300° arc, center (11,10) r≈5 */}
        <path
          d="M 8 14 A 5 5 0 1 1 14 14"
          stroke={`url(#slg-${uid})`}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.52"
        />
        {/* Pin dot — below the opening */}
        <circle cx="11" cy="22" r="2.1" fill={`url(#slg-${uid})`} />
      </svg>
      {!hideText && (
        <span style={{
          fontSize: Math.round(size * 0.75),
          fontWeight: 800,
          color: text,
          letterSpacing: -0.5,
          lineHeight: 1,
        }}>
          spotloop
        </span>
      )}
    </div>
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
        <Logo size={19} light />
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
    <button onClick={onClick} disabled={disabled} style={{
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

// ─── Stamp Grid ───────────────────────────────────────────────────
export function StampGrid({ pts, max, color = C.blue }) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 28, height: 28, borderRadius: 8,
          background: i < pts ? color : C.border,
          border: `1.5px solid ${i < pts ? color : C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: i < pts ? "#fff" : C.light,
          transition: "all .22s",
          boxShadow: i < pts ? `0 2px 6px ${color}35` : "none",
        }}>
          {i < pts ? "✓" : ""}
        </div>
      ))}
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
