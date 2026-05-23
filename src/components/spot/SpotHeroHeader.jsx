import { motion } from "framer-motion";
import { ArrowLeft, Share2, Heart } from "lucide-react";
import { C } from "../ui";
import { getSpotCoverUrl, getSpotAvatarUrl } from "../../lib/spotMedia";

/**
 * Cover-Hintergrund + überlappendes Spot-Profilbild (Emoji oder Logo-URL).
 */
export default function SpotHeroHeader({
  spot,
  bg,
  following,
  onBack,
  onShare,
  onToggleFollow,
  children,
}) {
  const coverUrl = getSpotCoverUrl(spot);
  const avatarUrl = getSpotAvatarUrl(spot);

  return (
    <div style={{ flexShrink: 0, position: "relative" }}>
      {/* Cover / Hintergrundbild */}
      <div
        style={{
          position: "relative",
          height: 176,
          overflow: "hidden",
          background: `linear-gradient(145deg, ${bg} 0%, ${C.navy} 100%)`,
        }}
      >
        <img
          src={coverUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(180deg, rgba(10,22,40,.35) 0%, transparent 38%),
              linear-gradient(0deg, rgba(247,249,255,.98) 0%, rgba(247,249,255,.55) 28%, transparent 62%)
            `,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `${bg}22`,
            mixBlendMode: "multiply",
            pointerEvents: "none",
          }}
        />

        {/* Top-Aktionen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "52px 16px 0",
            zIndex: 2,
          }}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            style={iconBtnStyle}
          >
            <ArrowLeft size={18} color={C.dark} />
          </motion.button>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={onShare} style={iconBtnStyle}>
              <Share2 size={16} color={C.muted} />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFollow}
              style={{
                ...iconBtnStyle,
                background: following ? "rgba(255,255,255,.95)" : iconBtnStyle.background,
                border: `1.5px solid ${following ? bg : C.border}`,
              }}
            >
              <Heart size={16} color={following ? bg : C.muted} fill={following ? bg : "none"} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Profilbild — überlappt Cover */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: -46,
          paddingBottom: 4,
        }}
      >
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            padding: 4,
            background: C.white,
            boxShadow: `0 12px 36px ${bg}35, 0 4px 16px rgba(10,22,40,.12)`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 22,
              overflow: "hidden",
              background: avatarUrl
                ? C.white
                : `linear-gradient(145deg, ${bg}22, ${bg}08)`,
              border: `2px solid ${bg}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={spot?.name || "Spot"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 46, lineHeight: 1 }}>{spot?.emoji || "🏪"}</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Name, Stats, … */}
      <div style={{ padding: "10px 20px 0", textAlign: "center", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 38,
  height: 38,
  borderRadius: 12,
  background: "rgba(255,255,255,.92)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: `1px solid ${C.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(10,22,40,.1)",
};
