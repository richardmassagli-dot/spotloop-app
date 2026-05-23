import { motion } from "framer-motion";
import { C, CARD_GRADIENT } from "../ui";

/**
 * Premium Filter-Pille — Karte, Listen, Social.
 */
export default function FilterChip({
  label,
  emoji,
  icon: Icon,
  active = false,
  onClick,
  glass = true,
  index = 0,
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 99,
        padding: "8px 14px",
        border: active ? "1px solid transparent" : `1px solid ${glass ? "rgba(255,255,255,0.65)" : C.border}`,
        background: active ? CARD_GRADIENT : glass ? "rgba(255,255,255,0.92)" : C.white,
        backdropFilter: glass ? "blur(12px)" : undefined,
        WebkitBackdropFilter: glass ? "blur(12px)" : undefined,
        color: active ? "#fff" : C.dark,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: active
          ? "0 6px 20px rgba(27, 79, 216, 0.28)"
          : "0 2px 12px rgba(10, 22, 40, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        transition: "all .2s ease",
      }}
    >
      {Icon && <Icon size={14} strokeWidth={2.25} color={active ? "#fff" : C.muted} />}
      {emoji && <span style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</span>}
      {label}
    </motion.button>
  );
}
