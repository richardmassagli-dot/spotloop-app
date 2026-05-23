import { SHOW_DEMO_DATA } from "./config";
import { demoPayments } from "./demoData";
import { PAYMENT_PRINCIPLES } from "./privacy";

export const APP_TAGLINE = PAYMENT_PRINCIPLES.tagline;

function nextRewardLine(stamp) {
  if (!stamp) return null;
  const reward = stamp.reward_text || stamp.spot?.reward_text || "dein Reward";
  if (stamp.reward_ready) return `Reward bereit — ${reward}`;
  const left = Math.max(0, (stamp.max_points || 10) - (stamp.points || 0));
  return `Noch ${left} bis ${reward}`;
}

function formatAmount(amount) {
  if (amount == null || Number.isNaN(amount)) return null;
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}

function formatPaymentDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days <= 0) return `Heute, ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
    if (days === 1) return `Gestern, ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

/** Zahlungshistorie mit Loyalty-Zuordnung pro Spot */
export function getPaymentHistory(stamps = []) {
  const stampBySpot = Object.fromEntries(stamps.map((s) => [s.spot_id, s]));
  const stampByName = Object.fromEntries(
    stamps.filter((s) => s.spot?.name).map((s) => [s.spot.name.toLowerCase(), s]),
  );

  const resolveStamp = (p) =>
    stampBySpot[p.spot_id] ||
    stampByName[(p.spot_name || "").toLowerCase()] ||
    stamps.find((s) => s.spot?.name === p.spot_name);

  let rows = [];

  if (SHOW_DEMO_DATA && demoPayments.length) {
    rows = demoPayments.map((p) => {
      const stamp = resolveStamp(p);
      return {
        ...p,
        amountLabel: formatAmount(p.amount),
        dateLabel: formatPaymentDate(p.date),
        nextReward: nextRewardLine(stamp),
        stamp,
      };
    });
  }

  // Produktion / fehlende Demo: letzte Besuche als Zahlungen mit Auto-Stempel
  const seen = new Set(rows.map((r) => r.spot_id));
  stamps
    .filter((s) => s.last_visit && !seen.has(s.spot_id))
    .forEach((s) => {
      rows.push({
        id: `syn-${s.spot_id}`,
        spot_id: s.spot_id,
        spot_name: s.spot?.name || "Spot",
        emoji: s.spot?.emoji || "🏪",
        amount: null,
        date: s.last_visit,
        stamps_earned: 1,
        automatic: true,
        description: "Kartenzahlung verbunden",
        amountLabel: null,
        dateLabel: formatPaymentDate(s.last_visit),
        nextReward: nextRewardLine(s),
        stamp: s,
      });
    });

  return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
}
