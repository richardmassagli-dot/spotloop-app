import { motion } from "framer-motion";
import { C } from "../ui";
import NotificationBellButton from "./NotificationBellButton";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * Begrüßung + optionaler Reward-Hook („Was lohnt sich heute?“).
 */
export default function HomeHero({
  greeting,
  firstName,
  dateStr,
  profileName,
  bellCount,
  onMySpots,
  rewardHeadline,
  rewardSubline,
  rewardReady = false,
  onRewardTap,
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "52px 20px 24px",
        background: `linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 72%, ${C.bg} 100%)`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(27,79,216,.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 14,
            padding: "5px 12px",
            borderRadius: 99,
            background: `${C.blue}08`,
            border: `1px solid ${C.border}`,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.2 }}>
            {dateStr}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                flexShrink: 0,
                background: `linear-gradient(145deg, ${C.blue}18 0%, ${C.blue}08 100%)`,
                border: `1.5px solid ${C.blue}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 900,
                color: C.blue,
                letterSpacing: -0.5,
                boxShadow: "0 4px 16px rgba(27, 79, 216, 0.12)",
              }}
            >
              {initials(profileName || firstName)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 2 }}>
                {greeting}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: C.dark,
                  letterSpacing: -0.6,
                  lineHeight: 1.1,
                }}
              >
                {firstName}
              </div>
            </div>
          </div>

          {onMySpots && <NotificationBellButton count={bellCount} onClick={onMySpots} minimal />}
        </div>

        {rewardHeadline && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            onClick={onRewardTap}
            style={{
              width: "100%",
              marginTop: 18,
              padding: "16px 18px",
              borderRadius: 18,
              border: `1.5px solid ${rewardReady ? `${C.orange}45` : `${C.blue}35`}`,
              background: rewardReady
                ? `linear-gradient(135deg, ${C.orange}18 0%, #FFF7ED 100%)`
                : `linear-gradient(135deg, ${C.blue}12 0%, #FFFFFF 100%)`,
              cursor: onRewardTap ? "pointer" : "default",
              textAlign: "left",
              fontFamily: "inherit",
              boxShadow: rewardReady
                ? `0 8px 24px ${C.orange}18`
                : "0 8px 24px rgba(27, 79, 216, 0.08)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: rewardReady ? C.orange : C.blue,
                letterSpacing: 1.2,
                marginBottom: 6,
              }}
            >
              {rewardReady ? "DEIN NÄCHSTER SCHRITT" : "WAS SICH HEUTE LOHNT"}
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: C.dark,
                lineHeight: 1.3,
                letterSpacing: -0.3,
              }}
            >
              {rewardHeadline}
            </div>
            {rewardSubline && (
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.45 }}>
                {rewardSubline}
              </div>
            )}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
