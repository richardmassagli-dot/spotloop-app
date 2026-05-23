import { motion } from "framer-motion";
import { C, CARD_GRADIENT } from "./ui";

/**
 * Premium floating bottom tab bar — glass surface, elevated scan CTA.
 */
export default function BottomNav({ nav, activeTab, onTab }) {
  return (
    <div
      style={{
        flexShrink: 0,
        zIndex: 100,
        padding: "0 14px 0",
        paddingBottom: "max(10px, env(safe-area-inset-bottom, 0px))",
        pointerEvents: "none",
      }}
    >
      <nav
        aria-label="Hauptnavigation"
        style={{
          pointerEvents: "auto",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          padding: "8px 10px",
          borderRadius: 26,
          background: "rgba(255,255,255,.94)",
          backdropFilter: "blur(28px) saturate(1.2)",
          WebkitBackdropFilter: "blur(28px) saturate(1.2)",
          border: `1px solid rgba(255,255,255,.9)`,
          boxShadow: `
            0 -2px 0 rgba(226,232,245,.6),
            0 8px 32px ${C.shadowMd},
            0 20px 48px rgba(10,22,40,.06)
          `,
        }}
      >
        {nav.map(({ id, Icon, label, center }) => {
          if (center) {
            return (
              <motion.button
                key={id}
                type="button"
                aria-label={label}
                whileTap={{ scale: 0.94 }}
                onClick={() => onTab(id)}
                style={{
                  flexShrink: 0,
                  alignSelf: "flex-end",
                  width: 56,
                  height: 56,
                  marginTop: -14,
                  marginLeft: 2,
                  marginRight: 2,
                  borderRadius: 18,
                  background: CARD_GRADIENT,
                  border: "2.5px solid #fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `
                    0 12px 28px rgba(27,79,216,.42),
                    0 0 0 1px rgba(27,79,216,.12)
                  `,
                }}
              >
                <Icon size={24} color="#fff" strokeWidth={2.25} />
              </motion.button>
            );
          }

          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTab(id)}
              style={{
                flex: 1,
                minWidth: 0,
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 4px 4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 14,
                    background: `linear-gradient(180deg, ${C.mintLight} 0%, rgba(255,255,255,.95) 100%)`,
                    border: `1px solid ${C.mint}`,
                    boxShadow: `0 2px 10px ${C.blue}14`,
                    pointerEvents: "none",
                  }}
                />
              )}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 24,
                }}
              >
                <Icon
                  size={21}
                  color={isActive ? C.navy : C.light}
                  strokeWidth={isActive ? 2.35 : 1.85}
                />
              </span>
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 10,
                  fontWeight: isActive ? 800 : 600,
                  letterSpacing: isActive ? 0.15 : 0,
                  color: isActive ? C.navy : C.muted,
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
