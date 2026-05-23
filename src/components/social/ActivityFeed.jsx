import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { C } from "../ui";
import SocialAvatar from "./SocialAvatar";
import { activityIcon, formatActivityText } from "../../lib/social";

export default function ActivityFeed({ items, onSpotClick, compact }) {
  if (!items?.length) {
    return (
      <div style={{ textAlign: "center", padding: "28px 16px", color: C.muted, fontSize: 13 }}>
        Noch keine Aktivitäten von Freunden.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 10 }}>
      {items.map((item, i) => (
        <motion.button
          key={item.id}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => item.spotId && onSpotClick?.(item.spotId)}
          style={{
            width: "100%",
            textAlign: "left",
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: compact ? "12px 14px" : "14px 16px",
            cursor: item.spotId ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: `0 2px 10px rgba(10,22,40,.04)`,
          }}
        >
          {item.user ? (
            <SocialAvatar initials={item.avatar} color={item.color} size={compact ? 36 : 40} />
          ) : (
            <div style={{
              width: compact ? 36 : 40, height: compact ? 36 : 40, borderRadius: 12,
              background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              {activityIcon(item.type)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, lineHeight: 1.35 }}>
              {formatActivityText(item)}
            </div>
            {item.message && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontStyle: "italic" }}>
                „{item.message}"
              </div>
            )}
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontWeight: 600 }}>{item.time}</div>
          </div>
          {item.spotId && <ChevronRight size={16} color={C.muted} />}
        </motion.button>
      ))}
    </div>
  );
}
