import { MY_SPOTS_FEED, MY_SPOTS_DEFAULT_FOLLOWS } from "../data/mySpotsDemo.js";
import { categoryLabelOnly } from "./spotDisplay.js";
import { isCampaignCouponItem } from "./campaignCoupon.js";

const FOLLOW_KEY = "spotloop_followed";

export const UPDATE_TYPE_LABELS = {
  new_dish: "Neues Gericht",
  action: "Aktion",
  event: "Event",
  reward: "Reward",
  happy_hour: "Happy Hour",
  location: "Standort",
};

/** My Spots — drei klare Welten */
export const INBOX_FILTERS = [
  {
    id: "all",
    label: "Alle",
    hint: "Alle relevanten Updates — Rewards und deine Lieblingsspots.",
    emptyTitle: "Noch nichts Neues",
    emptyBody: "Folge Spots und sammle Besuche — hier landet alles, was für dich zählt.",
  },
  {
    id: "rewards",
    label: "Rewards",
    hint: "Stempeln, Rewards, Bonus und dein Fortschritt.",
    emptyTitle: "Deine Rewards",
    emptyBody: "Check-in bei einem Spot — jeder Besuch bringt dich deinem nächsten Reward näher.",
  },
  {
    id: "spots",
    label: "Spots",
    hint: "Kampagnen, Events, neue Gerichte und Aktionen von deinen Lieblingsspots.",
    emptyTitle: "Deine Lieblingsspots",
    emptyBody: "Folge Spots in der App — dann erscheinen hier Kampagnen und Aktionen.",
  },
  {
    id: "coupons",
    label: "Vorteile",
    hint: "Exklusive Aktionen von deinen Lieblingsspots — nach Spot filtern.",
    emptyTitle: "Noch keine Vorteile",
    emptyBody: "Folge Spots und checke ein — Aktionen von deinen Lieblingsspots landen hier.",
  },
];

/** @deprecated */
export const FILTER_CHIPS = INBOX_FILTERS;

const REWARD_ALERT_TYPES = new Set(["reward_ready", "close_to_reward", "birthday"]);
const SPOT_ALERT_TYPES = new Set(["nearby", "campaign", "reactivation"]);

export function isRewardsFeedItem(item) {
  if (item?._stampProgress) return true;
  if (item?.update_type === "reward" || item?.reward_available) return true;
  if (item?.campaign_type === "birthday") return true;
  return false;
}

export function isPostFeedItem(item) {
  const t = item?.campaign_type || "";
  return t.startsWith("post_") || item?.update_type === "post";
}

export function isSpotsFeedItem(item) {
  if (item?._stampProgress) return false;
  if (isRewardsFeedItem(item)) return false;
  if (isPostFeedItem(item)) return false;
  return true;
}

export function getLocalFollowedIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export async function getFollowedSpotIds(userId, fetchFollowsFromDb) {
  const local = getLocalFollowedIds();
  if (fetchFollowsFromDb) {
    try {
      const remote = await fetchFollowsFromDb(userId);
      const merged = [...new Set([...local, ...(remote ?? [])])];
      return merged.length ? merged : MY_SPOTS_DEFAULT_FOLLOWS;
    } catch {
      /* fall through */
    }
  }
  return local.length ? local : MY_SPOTS_DEFAULT_FOLLOWS;
}

function parseTime(iso, timeLabel) {
  if (iso) {
    const t = new Date(iso).getTime();
    if (!Number.isNaN(t)) return t;
  }
  const map = { "vor 1 stunde": 1, "vor 2 stunden": 2, "vor 3 stunden": 3, "vor 5 stunden": 5 };
  const low = (timeLabel || "").toLowerCase();
  for (const [k, h] of Object.entries(map)) {
    if (low.includes(k)) return Date.now() - h * 3600000;
  }
  if (low.includes("gestern")) return Date.now() - 86400000;
  if (low.includes("tag")) {
    const m = low.match(/(\d+)/);
    if (m) return Date.now() - parseInt(m[1], 10) * 86400000;
  }
  return Date.now() - 86400000 * 3;
}

export function isCouponsFeedItem(item) {
  return isCampaignCouponItem(item);
}

export function matchesInboxFilter(item, filter) {
  if (filter === "all") return true;
  if (filter === "rewards") return isRewardsFeedItem(item);
  if (filter === "spots") return isSpotsFeedItem(item);
  if (filter === "coupons") return isCouponsFeedItem(item);
  return true;
}

function matchesQuery(item, q) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return (
    item.title?.toLowerCase().includes(s) ||
    item.description?.toLowerCase().includes(s) ||
    item.spot_name?.toLowerCase().includes(s)
  );
}

/** Stempelkarten als Fortschritts-Karten (Rewards-Tab) */
export function buildStampProgressCards(stamps = [], spotsById = {}) {
  return (stamps ?? []).map((stamp) => {
    const spot = spotsById[stamp.spot_id] || stamp.spot || {};
    const max = stamp.max_points || 10;
    const pts = stamp.points || 0;
    const ready = !!stamp.reward_ready;
    const left = Math.max(0, max - pts);

    return {
      id: `stamp-progress-${stamp.id}`,
      _stampProgress: true,
      spot_id: stamp.spot_id,
      spot_name: spot.name || "Spot",
      spot_emoji: spot.emoji || "📍",
      spot_bg: spot.bg_color || "#1B4FD8",
      spot_category: categoryLabelOnly(spot) || spot.category,
      update_type: "reward",
      reward_available: ready,
      title: ready ? "Reward erreicht" : `${pts} von ${max} Besuchen`,
      description: ready
        ? stamp.reward_text || spot.reward_text || "Beim Personal einlösen."
        : left === 1
          ? "Nur noch 1 Besuch — du bist fast da."
          : `Noch ${left} Besuche bis zu deinem Reward.`,
      time_label: ready ? "Jetzt einlösen" : "Fortschritt",
      published_at: new Date().toISOString(),
      is_new: ready,
      is_favorite: true,
      cta: ready ? "wallet" : "spot_open",
      progress: { points: pts, max, ready, pct: Math.min(100, Math.round((pts / max) * 100)) },
    };
  });
}

export function sortMySpotsFeed(items, { stampSpotIds = [], favoriteSpotIds = [] } = {}) {
  const favSet = new Set([...favoriteSpotIds, ...stampSpotIds]);
  return [...items].sort((a, b) => {
    const score = (x) => {
      let s = 0;
      if (x._stampProgress && x.reward_available) s += 120;
      if (x._stampProgress) s += 60;
      if (favSet.has(x.spot_id) || x.is_favorite) s += 100;
      if (x.reward_available) s += 40;
      if (x.is_new) s += 25;
      s += Math.max(0, 20 - (x.distance_km ?? 5) * 4);
      s += parseTime(x.published_at, x.time_label) / 1e12;
      return s;
    };
    return score(b) - score(a);
  });
}

export function buildMySpotsFeed({
  followedIds = [],
  spotsById = {},
  stamps = [],
  filter = "all",
  query = "",
  livePosts = [],
}) {
  const stampSpotIds = stamps.map((s) => s.spot_id);
  const followedSet = new Set(followedIds);

  const liveForFollowed = livePosts.filter(
    (item) => followedSet.has(item.spot_id) && !isPostFeedItem(item),
  );
  const liveIds = new Set(liveForFollowed.map((i) => i.spot_id));
  const demoRest = MY_SPOTS_FEED.filter(
    (item) => followedSet.has(item.spot_id) && !liveIds.has(item.spot_id)
  );
  let items = [...liveForFollowed, ...demoRest];

  items = items.map((item) => {
    const spot = spotsById[item.spot_id];
    const stamp = stamps.find((s) => s.spot_id === item.spot_id);
    return {
      ...item,
      spot_verified: spot?.verified !== false,
      reward_available: item.reward_available || !!stamp?.reward_ready,
      is_favorite: item.is_favorite || stampSpotIds.includes(item.spot_id),
      distance_km:
        item.distance_km ??
        (parseFloat(String(spot?.distance || "5").replace(/[^\d.]/g, "")) || 5),
      spot_category: item.spot_category || categoryLabelOnly(spot) || spot?.category,
    };
  });

  items = items.filter((i) => matchesInboxFilter(i, filter) && matchesQuery(i, query));
  return sortMySpotsFeed(items, { stampSpotIds, favoriteSpotIds: followedIds });
}

export function buildFollowedSpotsBar(followedIds, spotsById, feedItems, { rewardsOnly = false } = {}) {
  return followedIds
    .map((id) => {
      const spot = spotsById[id];
      if (!spot) return null;
      const updates = feedItems.filter((f) => f.spot_id === id);
      const newCount = updates.filter((u) => u.is_new).length;
      const hasReward = updates.some((u) => u.reward_available) || false;
      if (rewardsOnly && !hasReward) return null;
      return {
        id,
        name: spot.name,
        emoji: spot.emoji || "📍",
        bg: spot.bg_color || "#1B4FD8",
        category: categoryLabelOnly(spot) || spot.category,
        new_updates: newCount,
        reward_available: hasReward,
      };
    })
    .filter(Boolean);
}

export function ctaForItem(item) {
  const map = {
    coupon_open: { label: "Vorteil öffnen", action: "coupon" },
    spot_open: { label: "Spot öffnen", action: "spot" },
    action_view: { label: "Vorteil öffnen", action: "coupon" },
    reward_view: { label: "Reward ansehen", action: "wallet" },
    wallet: { label: "Jetzt einlösen", action: "wallet" },
    route: { label: "Route", action: "route" },
    save: { label: "Merken", action: "save" },
  };
  if (item.cta && map[item.cta]) return map[item.cta];
  if (item._stampProgress && item.reward_available) return map.wallet;
  if (item._stampProgress) return map.spot_open;
  if (item.update_type === "reward") return map.wallet;
  if (item.update_type === "location") return map.route;
  if (item.coupon || isCampaignCouponItem(item)) return map.coupon_open;
  if (item.update_type === "action" || item.update_type === "happy_hour") return map.coupon_open;
  return map.spot_open;
}
