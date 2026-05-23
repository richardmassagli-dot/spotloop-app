import { motion } from "framer-motion";
import { C, Logo, CARD_GRADIENT } from "../ui";
import { GUEST_WALLET_TAGLINE } from "../../data/spotloopMessaging";

export function AuthShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: `linear-gradient(180deg, #DCE8FF 0%, ${C.bg} 35%, ${C.bg} 100%)`,
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}

export function AuthHero({ chips = [], variant = "guest" }) {
  const isMerchant = variant === "merchant";
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "40px 20px 28px",
        background: "linear-gradient(165deg, #0A1628 0%, #1B4FD8 50%, #0EA5E9 100%)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,.2) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -100,
          left: -80,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,.3) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg, transparent 0%, rgba(255,255,255,.08) 42%, transparent 48%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", textAlign: "center" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Logo size={34} light />
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: isMerchant ? 22 : 24,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.2,
            letterSpacing: -0.6,
            maxWidth: 300,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {isMerchant ? (
            <>
              Direkter Kanal
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #BAE6FD, #7DD3FC)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                zu deinen Stammkunden
              </span>
            </>
          ) : (
            <>
              Scannen.
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #BAE6FD, #7DD3FC)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Dein Stempel.
              </span>
            </>
          )}
        </h1>

        <p
          style={{
            margin: "8px auto 0",
            maxWidth: isMerchant ? 300 : 260,
            fontSize: isMerchant ? 13 : 12,
            fontWeight: isMerchant ? 600 : 500,
            color: "rgba(255,255,255,.78)",
            lineHeight: 1.5,
          }}
        >
          {isMerchant
            ? "QR aufstellen. Gäste zurückbringen. Einfach."
            : GUEST_WALLET_TAGLINE}
        </p>

        {chips.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              marginTop: 14,
            }}
          >
            {chips.map(({ Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 11px",
                  borderRadius: 99,
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.18)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Icon size={12} color="#BAE6FD" strokeWidth={2.2} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>
                  {text}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function AuthFormPanel({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: 1,
        marginTop: -20,
        borderRadius: "24px 24px 0 0",
        background: "linear-gradient(165deg, #FFFFFF 0%, #F8FAFF 100%)",
        border: "1px solid rgba(255,255,255,.9)",
        borderBottom: "none",
        boxShadow: "0 -8px 40px rgba(10, 22, 40, 0.08), 0 24px 48px rgba(10, 22, 40, 0.06)",
        padding: "22px 20px 32px",
        overflowY: "auto",
      }}
    >
      {children}
    </motion.div>
  );
}

export function AuthTabBar({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 22,
        padding: 5,
        borderRadius: 16,
        background: "rgba(241, 245, 255, 0.9)",
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 0 rgba(255,255,255,1) inset",
      }}
    >
      {tabs.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 12,
              padding: "10px 6px",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              transition: "all .2s ease",
              background: isActive
                ? "linear-gradient(145deg, #1B4FD8 0%, #0EA5E9 100%)"
                : "transparent",
              color: isActive ? "#fff" : C.muted,
              boxShadow: isActive ? "0 6px 16px rgba(27, 79, 216, 0.35)" : "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  max,
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 800,
            color: C.muted,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        max={max}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 16px",
          fontSize: 15,
          fontWeight: 600,
          color: C.dark,
          background: "#fff",
          border: `1.5px solid ${error ? C.red : C.border}`,
          borderRadius: 14,
          outline: "none",
          fontFamily: "inherit",
          boxShadow: error ? `0 0 0 3px ${C.red}18` : "0 2px 8px rgba(10,22,40,.04)",
          transition: "border-color .2s, box-shadow .2s",
        }}
      />
      {hint && !error && (
        <div style={{ fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 1.4 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginTop: 6 }}>{error}</div>
      )}
    </div>
  );
}

export function AuthPrimaryBtn({ children, onClick, disabled, loading, variant = "primary" }) {
  const isGradient = variant === "primary";
  return (
    <motion.button
      type="button"
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: "100%",
        padding: "15px 20px",
        borderRadius: 16,
        border: "none",
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: -0.2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        background: isGradient ? CARD_GRADIENT : C.navy,
        color: "#fff",
        boxShadow: disabled
          ? "none"
          : isGradient
            ? "0 10px 28px rgba(27, 79, 216, 0.38), inset 0 1px 0 rgba(255,255,255,.25)"
            : "0 8px 20px rgba(10, 22, 40, 0.25)",
      }}
    >
      {children}
    </motion.button>
  );
}

export function AuthSecondaryBtn({ children, onClick, flex = 0.4 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex,
        padding: "14px 16px",
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        background: "linear-gradient(165deg, #FFFFFF 0%, #F1F5FF 100%)",
        fontSize: 13,
        fontWeight: 700,
        color: C.muted,
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(10,22,40,.04)",
      }}
    >
      {children}
    </button>
  );
}

export function AuthStepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
      {steps.map((label, i) => (
        <div key={label} style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              height: 4,
              borderRadius: 99,
              background: i <= current ? "linear-gradient(90deg, #1B4FD8, #0EA5E9)" : C.border,
              marginBottom: 6,
              transition: "background .3s",
            }}
          />
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: i <= current ? C.blue : C.muted,
              letterSpacing: 0.2,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuthSectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.dark, letterSpacing: -0.4 }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>{subtitle}</div>
      )}
    </div>
  );
}

export function AuthInfoCard({ emoji, title, text, accent = C.blue }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        borderRadius: 16,
        marginBottom: 16,
        background: `linear-gradient(165deg, ${accent}08 0%, #FFFFFF 100%)`,
        border: `1px solid ${accent}25`,
        boxShadow: "0 4px 14px rgba(10,22,40,.04)",
      }}
    >
      <span style={{ fontSize: 26, lineHeight: 1 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{title}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.45 }}>{text}</div>
      </div>
    </div>
  );
}
