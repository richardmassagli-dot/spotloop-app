import { motion } from "framer-motion";
import { C } from "../ui";

/** Hub-Kachel — Icon links, Titel + Untertitel rechts, 20px Radius. */
export default function MerchantHubTile({
  icon: Icon,
  label,
  hint,
  accent,
  badge = 0,
  onClick,
  index = 0,
  span = 1,
}) {
  const gridColumn = span === 2 ? "1 / -1" : undefined;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        gridColumn,
        minHeight: 44,
        width: "100%",
        padding: "14px 14px 14px 16px",
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        background: C.white,
        boxShadow: "0 2px 12px rgba(10, 22, 40, 0.06)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          minWidth: 44,
          borderRadius: 12,
          background: accent.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={accent.fg} strokeWidth={2.25} />
      </div>
      {badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            minWidth: 18,
            height: 18,
            borderRadius: 99,
            background: "#EF4444",
            border: "2px solid #fff",
            fontSize: 10,
            fontWeight: 900,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
          }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: C.dark,
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        {hint && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.muted,
              marginTop: 3,
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {hint}
          </div>
        )}
      </div>
    </motion.button>
  );
}
