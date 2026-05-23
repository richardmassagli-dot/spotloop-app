import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { C } from "./ui";

const DEFAULT_ACCENT = { from: "#1B4FD8", to: "#0EA5E9", glow: "rgba(27, 79, 216, 0.18)" };

/**
 * Einzelne Premium-Kachel — Merchant-Nav & Gäste-Quick-Actions.
 */
export default function PremiumTile({
  accent = DEFAULT_ACCENT,
  compact = false,
  featured = false,
  isActive = false,
  iconVariant = "gradient",
  onClick,
  emoji,
  icon: Icon,
  label,
  hint,
  badge = 0,
  index = 0,
}) {
  const a = accent;
  const showBadge = badge > 0;

  return (
    <motion.button
      type="button"
      initial={compact ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: compact ? 0 : index * 0.03, duration: compact ? 0.2 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98, y: 0 }}
      onClick={onClick}
      style={{
        position: "relative",
        minHeight: compact ? 118 : featured ? 92 : 100,
        padding: compact ? "18px 14px 16px" : featured ? "18px 18px 18px 20px" : "16px 16px 16px 18px",
        borderRadius: 22,
        border: `1px solid ${isActive || featured ? `${a.from}45` : "rgba(226, 232, 245, 0.95)"}`,
        background: isActive
          ? `linear-gradient(155deg, ${a.glow} 0%, #FFFFFF 42%, #F8FAFF 100%)`
          : featured
            ? `linear-gradient(155deg, ${a.glow} 0%, #FFFFFF 38%, #F8FAFF 100%)`
            : "linear-gradient(165deg, #FFFFFF 0%, #F8FAFF 55%, #F1F5FF 100%)",
        cursor: "pointer",
        display: "flex",
        flexDirection: compact ? "column" : "row",
        alignItems: compact ? "center" : "center",
        justifyContent: compact ? "center" : "flex-start",
        gap: compact ? 10 : 14,
        textAlign: compact ? "center" : "left",
        boxShadow: isActive || featured
          ? `0 0 0 1px ${a.from}20, 0 16px 40px ${a.glow}, 0 6px 16px rgba(10, 22, 40, 0.07)`
          : "0 1px 0 rgba(255,255,255,1) inset, 0 10px 28px rgba(10, 22, 40, 0.06), 0 2px 8px rgba(10, 22, 40, 0.04)",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Ambient-Glow oben rechts */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -24,
          right: -24,
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${a.glow} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Akzent-Streifen links (nur breite Kacheln) */}
      {!compact && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: "18%",
            bottom: "18%",
            width: 3,
            borderRadius: "0 4px 4px 0",
            background: `linear-gradient(180deg, ${a.from}, ${a.to})`,
            opacity: isActive ? 1 : 0.65,
          }}
        />
      )}

      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,.98), transparent)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: compact ? 44 : 52,
          height: compact ? 44 : 52,
          borderRadius: compact ? 14 : 16,
          background:
            iconVariant === "soft"
              ? a.glow || `${a.from}14`
              : `linear-gradient(145deg, ${a.from} 0%, ${a.to} 100%)`,
          border: iconVariant === "soft" ? `1px solid ${a.from}22` : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow:
            iconVariant === "soft"
              ? "0 4px 12px rgba(10, 22, 40, 0.05)"
              : `0 8px 20px ${a.glow}, 0 0 0 3px rgba(255,255,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {Icon ? (
          <Icon
            size={compact ? 20 : 24}
            color={iconVariant === "soft" ? a.from : "#fff"}
            strokeWidth={2.25}
          />
        ) : emoji ? (
          <span style={{ fontSize: compact ? 24 : 26, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,.15))" }}>
            {emoji}
          </span>
        ) : null}
        {showBadge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              borderRadius: 99,
              background: "linear-gradient(135deg, #F97316, #EF4444)",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
              fontSize: 10,
              fontWeight: 900,
              color: "#fff",
              boxShadow: "0 4px 12px rgba(249, 115, 22, 0.45)",
            }}
          >
            {badge > 9 ? "9+" : badge}
          </motion.span>
        )}
      </div>

      <div style={{ flex: compact ? undefined : 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        {featured && showBadge && (
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: a.from,
              background: `${a.glow}`,
              border: `1px solid ${a.from}30`,
              borderRadius: 99,
              padding: "3px 8px",
            }}
          >
            Neu für dich
          </span>
        )}
        <span
          style={{
            display: "block",
            fontSize: compact ? 11 : featured ? 15 : 14,
            fontWeight: 800,
            color: isActive || featured ? a.from : C.dark,
            letterSpacing: -0.25,
            lineHeight: 1.25,
            whiteSpace: compact ? "nowrap" : undefined,
            overflow: compact ? "hidden" : undefined,
            textOverflow: compact ? "ellipsis" : undefined,
            maxWidth: "100%",
          }}
        >
          {label}
        </span>
        {hint && (
          <span
            style={{
              display: "block",
              marginTop: compact ? 3 : 4,
              fontSize: compact ? 9 : 10,
              fontWeight: 600,
              color: C.muted,
              lineHeight: 1.3,
              whiteSpace: compact ? "nowrap" : undefined,
              overflow: compact ? "hidden" : undefined,
              textOverflow: compact ? "ellipsis" : undefined,
              maxWidth: "100%",
            }}
          >
            {hint}
          </span>
        )}
      </div>

      {!compact && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: isActive ? `${a.glow}` : "rgba(241, 245, 255, 0.9)",
            border: `1px solid ${isActive ? `${a.from}25` : C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <ChevronRight
            size={16}
            color={isActive ? a.from : C.light}
            strokeWidth={2.5}
          />
        </div>
      )}
    </motion.button>
  );
}
