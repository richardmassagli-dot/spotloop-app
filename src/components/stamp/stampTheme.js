/** Spot-Farben & Metadaten für Stempelkarten */
export function stampThemeFromSpot(spot = {}, stamp = {}) {
  const bg = spot.bg_color || stamp.spot_bg || "#1B4FD8";
  return {
    bg,
    emoji: spot.emoji || stamp.spot_emoji || "🏪",
    name: spot.name || stamp.spot_name || "Spot",
    category: spot.category || stamp.spot_category || "",
    rewardText: stamp.reward_text || spot.reward_text || "Reward",
  };
}

export function stampProgress(pts, max) {
  const points = Math.max(0, pts ?? 0);
  const maximum = Math.max(1, max ?? 10);
  const pct = Math.min(100, Math.round((points / maximum) * 100));
  const left = Math.max(0, maximum - points);
  return { points, max: maximum, pct, left, ready: points >= maximum };
}
