import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { C } from "../ui";

/** Schlankes Glocken-Icon — z. B. Home-Header (ohne lila CTA-Kasten) */
export default function NotificationBellButton({ count = 0, onClick, minimal = false }) {
  return (
    <motion.button
      type="button"
      aria-label={count > 0 ? `My Spots, ${count} neu` : "My Spots öffnen"}
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        position: "relative",
        flexShrink: 0,
        background: minimal ? "transparent" : "linear-gradient(145deg, #6366F1 0%, #1B4FD8 100%)",
        border: minimal ? "none" : "1px solid rgba(255,255,255,0.2)",
        borderRadius: minimal ? 12 : 15,
        width: minimal ? 40 : 48,
        height: minimal ? 40 : 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        boxShadow: minimal ? "none" : "0 8px 20px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <Bell size={minimal ? 22 : 22} color={minimal ? C.dark : "#fff"} strokeWidth={minimal ? 2 : 2.25} />
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: "absolute",
            top: minimal ? 2 : -2,
            right: minimal ? 2 : -2,
            minWidth: 18,
            height: 18,
            borderRadius: 99,
            background: "linear-gradient(135deg, #F97316, #EF4444)",
            border: `2px solid ${minimal ? C.bg : "#fff"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(249, 115, 22, 0.4)",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>{count > 9 ? "9+" : count}</span>
        </motion.div>
      )}
    </motion.button>
  );
}
