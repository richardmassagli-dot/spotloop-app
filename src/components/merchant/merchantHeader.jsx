import { ArrowLeft, LogOut } from "lucide-react";
import { Logo, CARD_GRADIENT } from "../ui";

export const MERCHANT_HEADER_GRADIENT = CARD_GRADIENT;

/** Dekorative Hintergrund-Orbs für Premium-Header */
export function HeaderOrbs() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -100,
          right: -50,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -80,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(27,79,216,.28) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 20,
          left: "30%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,.04)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

export const MERCHANT_PAGE_BG = "#F8F9FB";

/** Weicher Übergang vom blauen Header zum Content. */
export function HeaderContentFade() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 40,
        background: `linear-gradient(180deg, transparent 0%, ${MERCHANT_PAGE_BG} 100%)`,
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}

export function HeaderShell({ children, paddingBottom = 16, fadeToContent = false, style }) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: MERCHANT_HEADER_GRADIENT,
        padding: `max(12px, env(safe-area-inset-top)) 18px ${paddingBottom}px`,
        position: "relative",
        overflow: "visible",
        ...style,
      }}
    >
      <HeaderOrbs />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      {fadeToContent && <HeaderContentFade />}
    </div>
  );
}

export function HeaderIconButton({ onClick, children, label, size = 40 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: size,
        height: size,
        borderRadius: 13,
        background: "rgba(255,255,255,.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#fff",
        flexShrink: 0,
        boxShadow: "0 4px 16px rgba(0,0,0,.12)",
      }}
    >
      {children}
    </button>
  );
}

export function HeaderBackButton({ onClick }) {
  return (
    <HeaderIconButton onClick={onClick} label="Zurück">
      <ArrowLeft size={20} strokeWidth={2.25} />
    </HeaderIconButton>
  );
}

export function HeaderLogoutButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,.1)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,.18)",
        color: "rgba(255,255,255,.92)",
        borderRadius: 99,
        padding: "8px 14px",
        fontSize: 11,
        fontWeight: 700,
        cursor: "pointer",
        letterSpacing: 0.02,
      }}
    >
      <LogOut size={14} strokeWidth={2.25} />
      Abmelden
    </button>
  );
}

export function HeaderEyebrow({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "rgba(255,255,255,.55)",
        letterSpacing: 1.4,
        fontWeight: 800,
        textTransform: "uppercase",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

export function HeaderTitle({ children, size = 22 }) {
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 900,
        color: "#fff",
        letterSpacing: -0.6,
        lineHeight: 1.15,
      }}
    >
      {children}
    </div>
  );
}

export function HeaderSubtitle({ children }) {
  return (
    <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 4, lineHeight: 1.4 }}>
      {children}
    </div>
  );
}

/** Spot-Avatar im Header */
export function HeaderSpotAvatar({ emoji = "☕", size = 52 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        background: "rgba(255,255,255,.14)",
        border: "1px solid rgba(255,255,255,.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        flexShrink: 0,
        boxShadow: "0 8px 24px rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.25)",
      }}
    >
      {emoji}
    </div>
  );
}

export function HeaderKpiGrid({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 8 }}>
      {items.map((k, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,.1)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,.16)",
            borderRadius: 14,
            padding: "10px 6px",
            textAlign: "center",
            minHeight: 56,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -0.5,
              lineHeight: 1.1,
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {k.val}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,.55)",
              fontWeight: 700,
              marginTop: 4,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              lineHeight: 1.2,
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {k.label}
          </div>
          {k.change && (
            <div
              style={{
                fontSize: 9,
                color: "#7DD3FC",
                fontWeight: 800,
                marginTop: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {k.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function HeaderSegmentPills({ options, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: 4,
        background: "rgba(0,0,0,.15)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.1)",
      }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              flex: 1,
              background: active ? "rgba(255,255,255,.18)" : "transparent",
              border: active ? "1px solid rgba(255,255,255,.25)" : "1px solid transparent",
              color: active ? "#fff" : "rgba(255,255,255,.5)",
              borderRadius: 9,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: active ? 800 : 600,
              cursor: "pointer",
              boxShadow: active ? "0 2px 8px rgba(0,0,0,.12)" : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Spotloop-Lockup für den blauen Merchant-Header */
export function HeaderBrandMark({ size = 16 }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(255,255,255,.1)",
        border: "1px solid rgba(255,255,255,.16)",
        borderRadius: 99,
        padding: size >= 20 ? "6px 10px 6px 8px" : "5px 9px 5px 7px",
      }}
    >
      <Logo size={size} light />
    </div>
  );
}

export function HeaderLogoRow({ onLogout }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <HeaderBrandMark size={22} />
      {onLogout && <HeaderLogoutButton onClick={onLogout} />}
    </div>
  );
}
