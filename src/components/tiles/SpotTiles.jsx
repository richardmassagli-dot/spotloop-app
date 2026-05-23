import { motion } from "framer-motion";
import { ChevronRight, Star, CheckCircle } from "lucide-react";
import { C } from "../ui";
import { spotAccent } from "./spotAccent";

function SpotIconBadge({ spot, size = 52 }) {
  const a = spotAccent(spot.bg_color);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size > 54 ? 17 : 16,
        background: `linear-gradient(145deg, ${a.from} 0%, ${a.to} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: size > 54 ? 30 : 26,
        boxShadow: `0 8px 20px ${a.glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
        position: "relative",
      }}
    >
      {spot.emoji || "🏪"}
      {spot.verified && (
        <div
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            background: C.fresh,
            borderRadius: 99,
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
          }}
        >
          <CheckCircle size={10} color="#fff" fill="#fff" />
        </div>
      )}
    </div>
  );
}

/** Listen-Zeile — Discover, Home „In der Nähe“ */
export function SpotListTile({ spot, stamp, onPress, index = 0, action, extraLine }) {
  const a = spotAccent(spot.bg_color);
  const rewardReady = stamp?.reward_ready;
  const pct = stamp ? Math.round((stamp.points / stamp.max_points) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      style={{
        background: "linear-gradient(165deg, #FFFFFF 0%, #F8FAFF 100%)",
        borderRadius: 22,
        border: `1px solid ${rewardReady ? `${C.orange}45` : "rgba(226, 232, 245, 0.95)"}`,
        padding: "14px 16px",
        display: "flex",
        gap: 14,
        alignItems: "center",
        boxShadow: rewardReady
          ? `0 0 0 1px ${C.orange}20, 0 12px 32px rgba(249, 115, 22, 0.12)`
          : "0 1px 0 rgba(255,255,255,1) inset, 0 8px 24px rgba(10, 22, 40, 0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: "16%",
          bottom: "16%",
          width: 3,
          borderRadius: "0 4px 4px 0",
          background: `linear-gradient(180deg, ${a.from}, ${a.to})`,
        }}
      />

      <button
        type="button"
        onClick={onPress}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          gap: 14,
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
        }}
      >
        <SpotIconBadge spot={spot} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.dark,
                letterSpacing: -0.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {spot.name}
            </div>
            {spot.rating && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  flexShrink: 0,
                  background: C.goldLight,
                  borderRadius: 99,
                  padding: "3px 8px",
                }}
              >
                <Star size={10} color={C.gold} fill={C.gold} />
                <span style={{ fontSize: 10, fontWeight: 800, color: C.gold }}>{spot.rating}</span>
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: extraLine ? 4 : 8 }}>
            {spot.category}
            {spot.area && ` · ${spot.area}`}
            {spot.distance && ` · ${spot.distance}`}
          </div>
          {extraLine && (
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
              {extraLine}
            </div>
          )}
          {stamp ? (
            <div>
              <div style={{ height: 4, background: `${a.from}18`, borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                <div
                  style={{
                    height: 4,
                    width: `${pct}%`,
                    background: rewardReady ? C.orange : a.from,
                    borderRadius: 99,
                  }}
                />
              </div>
              <div style={{ fontSize: 10, fontWeight: rewardReady ? 800 : 600, color: rewardReady ? C.orange : C.muted }}>
                {rewardReady ? "🎁 Reward bereit!" : `${stamp.points}/${stamp.max_points} · ${stamp.reward_text}`}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 11, fontWeight: 700, color: a.from }}>🎁 {spot.reward_text}</div>
          )}
          {spot.current_action && (
            <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: C.orange }}>⚡ {spot.current_action}</div>
          )}
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: `${a.glow}`,
            border: `1px solid ${a.from}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ChevronRight size={16} color={a.from} strokeWidth={2.5} />
        </div>
      </button>

      {action}
    </motion.div>
  );
}

/** Horizontale Featured-Karte */
export function SpotFeaturedTile({ spot, onPress, index = 0 }) {
  const a = spotAccent(spot.bg_color);
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onPress}
      style={{
        minWidth: 200,
        flexShrink: 0,
        borderRadius: 22,
        padding: "18px 16px",
        cursor: "pointer",
        textAlign: "left",
        border: "1px solid rgba(255,255,255,0.15)",
        background: `linear-gradient(155deg, ${a.from} 0%, ${a.to} 88%, #0A1628 100%)`,
        boxShadow: `0 16px 40px ${a.glow}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }}
      />
      <div style={{ fontSize: 34, marginBottom: 10, position: "relative" }}>{spot.emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: -0.3, marginBottom: 4 }}>
        {spot.name}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>{spot.area}</div>
      {spot.current_action && (
        <div
          style={{
            background: "rgba(255,255,255,0.14)",
            borderRadius: 10,
            padding: "6px 10px",
            fontSize: 10,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          ⚡ {spot.current_action}
        </div>
      )}
    </motion.button>
  );
}

/** Kompakte Trending-Kachel */
export function SpotTrendingTile({ spot, stamp, onPress, index = 0 }) {
  const a = spotAccent(spot.bg_color);
  const rewardReady = stamp?.reward_ready;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onPress}
      style={{
        minWidth: 148,
        flexShrink: 0,
        background: "linear-gradient(165deg, #FFFFFF 0%, #F8FAFF 100%)",
        border: `1px solid ${rewardReady ? `${C.orange}40` : C.border}`,
        borderRadius: 22,
        padding: "16px 14px",
        cursor: "pointer",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(10, 22, 40, 0.07)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <SpotIconBadge spot={spot} size={48} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 4 }}>{spot.name}</div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{spot.area}</div>
      {spot.rating && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            background: C.goldLight,
            borderRadius: 99,
            padding: "3px 8px",
          }}
        >
          <Star size={9} color={C.gold} fill={C.gold} />
          <span style={{ fontSize: 10, fontWeight: 800, color: C.gold }}>{spot.rating}</span>
        </div>
      )}
      {rewardReady && (
        <div style={{ marginTop: 8, fontSize: 10, fontWeight: 800, color: C.orange }}>🎁 Bereit!</div>
      )}
    </motion.button>
  );
}
