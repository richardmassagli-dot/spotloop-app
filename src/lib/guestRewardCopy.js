import { spotOpenLabel } from "./spotHours";
import { formatDistanceKm } from "./nearbySpots";

/** Emotionaler Reward-Hook für Home & Wallet */
export function buildNextRewardMessage(stamp, type) {
  const spotName = stamp?.spot?.name || "deinem Lieblingsort";
  const reward = stamp?.spot?.reward_text || stamp?.reward_text || "dein Reward";

  if (type === "ready") {
    return {
      headline: "Reward freigeschaltet",
      subline: `${reward} bei ${spotName} — jetzt einlösen`,
      cta: "Reward einlösen",
    };
  }

  const left = Math.max(0, (stamp?.max_points ?? 0) - (stamp?.points ?? 0));
  const visitWord = left === 1 ? "Besuch" : "Besuche";
  return {
    headline: `Noch ${left} ${visitWord} bis ${reward}`,
    subline: `Bei ${spotName} — lohnt sich heute`,
    cta: "Spot öffnen",
  };
}

/** Meta-Zeile für Spot-Karten: Geöffnet · 150 m · Noch 1 Besuch bis Reward */
export function buildSpotRewardMeta(spot, stamp) {
  const parts = [];

  const open = spotOpenLabel(spot);
  if (open === "Geöffnet") parts.push("Heute geöffnet");
  else if (open === "Geschlossen") parts.push("Heute geschlossen");

  if (spot?._distanceKm != null) parts.push(formatDistanceKm(spot._distanceKm));

  if (stamp?.reward_ready) {
    parts.push("Reward bereit");
  } else if (stamp && stamp.max_points > stamp.points) {
    const left = stamp.max_points - stamp.points;
    const reward = stamp.reward_text || spot?.reward_text || "Reward";
    const visitWord = left === 1 ? "Besuch" : "Besuche";
    parts.push(`Noch ${left} ${visitWord} bis ${reward}`);
  } else if (spot?.reward_text) {
    parts.push(`Reward: ${spot.reward_text}`);
  }

  return parts.join(" · ");
}
