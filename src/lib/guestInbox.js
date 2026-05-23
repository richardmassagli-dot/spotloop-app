import { SHOW_DEMO_DATA } from "./config";
import { resolveSpotId } from "./resolveSpot";

const READ_KEY = "spotloop_inbox_read";
const DISMISS_KEY = "spotloop_inbox_dismissed";

export const ALERT_TYPE_LABEL = {
  reward_ready: "Reward",
  birthday: "Geburtstag",
  nearby: "In der Nähe",
  campaign: "Exklusiver Coupon",
  close_to_reward: "Fast da!",
  reactivation: "Win-Back",
  spot_reply: "Antwort",
};

const DEMO_ALERTS = [
  {
    id: "n1",
    type: "reward_ready",
    icon: "🎁",
    color: "#F05830",
    title: "Reward einlösbar!",
    body: "Dein Kaffee-Reward bei Café Himmelblau wartet auf dich.",
    time: "Vor 2 Std.",
    spotId: "spot-cafe-himmelblau",
    unread: true,
    cta: "Jetzt einlösen",
  },
  {
    id: "n2",
    type: "birthday",
    icon: "🎂",
    color: "#D68A0C",
    title: "Happy Birthday! 🎉",
    body: "Gratis Gelato heute bei Gelato Amore.",
    time: "Heute",
    spotId: "spot-gelato-amore",
    unread: true,
    cta: "Reward abholen",
  },
  {
    id: "n3",
    type: "nearby",
    icon: "📍",
    color: "#1B6CA8",
    title: "Lieblingsspot in der Nähe",
    body: "Café Himmelblau ist nur 180m entfernt.",
    time: "Vor 45 Min.",
    spotId: "spot-cafe-himmelblau",
    unread: true,
    cta: null,
  },
];

function getDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function getRead() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function applyInboxState(alerts) {
  const dismissed = getDismissed();
  const read = getRead();
  return (alerts ?? [])
    .filter((a) => !dismissed.has(a.id))
    .map((a) => ({ ...a, unread: a.unread !== false && !read.has(a.id) }));
}

export function markInboxRead(id) {
  const read = getRead();
  read.add(id);
  localStorage.setItem(READ_KEY, JSON.stringify([...read]));
}

export function markAllInboxRead(ids) {
  const read = getRead();
  ids.forEach((id) => read.add(id));
  localStorage.setItem(READ_KEY, JSON.stringify([...read]));
}

export function dismissInboxAlert(id) {
  const dismissed = getDismissed();
  dismissed.add(id);
  localStorage.setItem(DISMISS_KEY, JSON.stringify([...dismissed]));
}

/** Kurz-Hinweise aus Stempelkarten (Rewards, fast fertig). */
export function buildStampAlerts(stamps = [], spotsById = {}) {
  const out = [];
  for (const stamp of stamps ?? []) {
    const spot = spotsById[stamp.spot_id] || stamp.spot || {};
    const name = spot.name || "Spot";
    const emoji = spot.emoji || "📍";
    if (stamp.reward_ready) {
      out.push({
        id: `alert-stamp-reward-${stamp.id}`,
        type: "reward_ready",
        icon: emoji,
        color: "#F05830",
        title: `Reward bei ${name}`,
        body: `Dein ${stamp.reward_text || spot.reward_text || "Reward"} wartet auf dich.`,
        time: "Jetzt",
        spotId: stamp.spot_id,
        unread: true,
        cta: "Jetzt einlösen",
      });
      continue;
    }
    const max = stamp.max_points || 10;
    const left = Math.max(0, max - (stamp.points || 0));
    if (left > 0 && left <= 2) {
      out.push({
        id: `alert-stamp-close-${stamp.id}`,
        type: "close_to_reward",
        icon: emoji,
        color: "#8B5CF6",
        title: `Noch ${left} Punkt${left === 1 ? "" : "e"}!`,
        body: `Fast geschafft bei ${name} — nur noch ${left} bis zum Reward.`,
        time: "Aktuell",
        spotId: stamp.spot_id,
        unread: true,
        cta: null,
      });
    }
  }
  return out;
}

export function mergeGuestAlerts({ stampAlerts = [], campaignAlerts = [], messageAlerts = [], demo = SHOW_DEMO_DATA }) {
  const seen = new Set();
  const merged = [];
  for (const list of [messageAlerts, stampAlerts, campaignAlerts, demo ? DEMO_ALERTS : []]) {
    for (const a of list) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      merged.push(a);
    }
  }
  return applyInboxState(merged);
}

export function resolveAlertSpotIds(alerts, spots = []) {
  const map = {};
  for (const a of alerts) {
    map[a.id] = resolveSpotId(a.spotId, spots) || a.spotId;
  }
  return map;
}

const REWARD_ALERT_TYPES = new Set(["reward_ready", "close_to_reward", "birthday"]);
const SPOT_ALERT_TYPES = new Set(["nearby", "campaign", "reactivation", "spot_reply"]);

export function filterAlerts(alerts, filter) {
  if (filter === "rewards") {
    return alerts.filter((a) => REWARD_ALERT_TYPES.has(a.type));
  }
  if (filter === "spots") {
    return alerts.filter((a) => SPOT_ALERT_TYPES.has(a.type));
  }
  if (filter === "coupons") {
    return alerts.filter((a) => a.type === "campaign");
  }
  return alerts;
}

export function inboxBadgeCount(alerts, feed = []) {
  const alertUnread = alerts.filter((a) => a.unread).length;
  const feedNew = feed.filter((f) => f.is_new).length;
  return alertUnread + feedNew;
}
