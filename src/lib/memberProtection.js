import {
  ACTIVE_MEMBER_DAYS,
  GLOBAL_DAILY_NOTIFICATION_MAX,
  REACTIVATION_COOLDOWN_DAYS,
  REACTIVATION_CAMPAIGN_MESSAGE,
  WEEKLY_CAMPAIGN_LIMIT_BY_PLAN,
  normalizeMerchantPlanId,
} from "../data/spotloopProductRules.js";
import { daysSince } from "./campaignAudiences.js";
import { getPrivacyPrefs } from "./privacy.js";

export {
  ACTIVE_MEMBER_DAYS,
  GLOBAL_DAILY_NOTIFICATION_MAX,
  REACTIVATION_COOLDOWN_DAYS,
  REACTIVATION_CAMPAIGN_MESSAGE,
};

export function getWeeklyCampaignLimit(planId = "growth") {
  const id = normalizeMerchantPlanId(planId);
  return WEEKLY_CAMPAIGN_LIMIT_BY_PLAN[id] ?? WEEKLY_CAMPAIGN_LIMIT_BY_PLAN.growth;
}

function isNormalCampaignType(type) {
  const t = type || "";
  return t === "push" || t === "segment" || t === "birthday" || t === "notification";
}

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function countNormalCampaignsThisWeek(campaigns = [], now = new Date()) {
  const weekStart = startOfWeek(now).getTime();
  return (campaigns || []).filter((c) => {
    if (!isNormalCampaignType(c.type)) return false;
    const t = new Date(c.created_at || 0).getTime();
    return !Number.isNaN(t) && t >= weekStart;
  }).length;
}

export function countReactivationsThisMonth(campaigns = [], now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return (campaigns || []).filter((c) => {
    if (c.type !== "reactivation") return false;
    const t = new Date(c.created_at || 0).getTime();
    return !Number.isNaN(t) && t >= monthStart;
  }).length;
}

/** Gäste mit Stempelkarte, aktiv in den letzten N Tagen. */
export function filterActiveStampMembers(stamps = [], activeDays = ACTIVE_MEMBER_DAYS) {
  return (stamps || []).filter((s) => {
    if (!s.user_id) return false;
    const d = daysSince(s.last_visit || s.updated_at || s.created_at);
    return d < activeDays;
  });
}

/** Inaktiv ≥ activeDays — Zielgruppe Reaktivierung. */
export function filterInactiveStampMembers(stamps = [], inactiveDays = ACTIVE_MEMBER_DAYS) {
  return (stamps || []).filter((s) => {
    if (!s.user_id) return false;
    const d = daysSince(s.last_visit || s.updated_at || s.created_at);
    return d >= inactiveDays;
  });
}

export function buildNormalCampaignAudience(stamps = [], activeDays = ACTIVE_MEMBER_DAYS) {
  const active = filterActiveStampMembers(stamps, activeDays);
  return { count: active.length, userIds: active.map((s) => s.user_id) };
}

export function buildReactivationAudience(stamps = [], inactiveDays = ACTIVE_MEMBER_DAYS) {
  const inactive = filterInactiveStampMembers(stamps, inactiveDays);
  return { count: inactive.length, userIds: inactive.map((s) => s.user_id) };
}

export function canSendNormalCampaign({ campaigns = [], planId = "growth" } = {}) {
  const limit = getWeeklyCampaignLimit(planId);
  if (limit <= 0) {
    return {
      ok: false,
      reason: "Kampagnen sind in deinem Plan nicht enthalten — Upgrade auf Growth.",
    };
  }
  const used = countNormalCampaignsThisWeek(campaigns);
  if (used >= limit) {
    return {
      ok: false,
      reason: `Wochen-Limit erreicht (${used}/${limit}). Nächste Kampagne nächste Woche — oder Extra Push-Credits nachkaufen (ab €29).`,
      used,
      limit,
    };
  }
  return { ok: true, used, limit, remaining: limit - used };
}

export function canSendReactivation({ campaigns = [] } = {}) {
  const used = countReactivationsThisMonth(campaigns);
  if (used >= 1) {
    return {
      ok: false,
      reason: "Reaktivierung wurde diesen Monat bereits gesendet (max. 1× pro Monat).",
      used,
    };
  }
  return { ok: true, used: 0, limit: 1 };
}

export function memberAllowsReactivation(userId) {
  const prefs = getPrivacyPrefs();
  if (prefs.push_reactivation === false) return false;
  if (prefs.allow_personalized_campaigns === false) return false;
  return true;
}

/** Priorität: fast volle Karte > Reward bereit > Reaktivierung > sonstige Kampagnen. */
function notificationPriority(item, stamps = []) {
  const stamp = stamps.find((s) => s.spot_id === item.spot_id);
  if (stamp?.reward_ready) return 100;
  if (stamp && stamp.max_points > 0) {
    const remaining = stamp.max_points - (stamp.points ?? 0);
    if (remaining === 1) return 90;
    if (remaining <= 2) return 80;
  }
  const t = item.campaign_type || item.type || "";
  if (t === "reactivation") return 30;
  if (t === "push" || t === "segment") return 50;
  return 40;
}

/** Max. 2 Notifications pro Kalendertag (global). */
export function applyGlobalDailyNotificationCap(items = [], stamps = [], maxPerDay = GLOBAL_DAILY_NOTIFICATION_MAX) {
  const today = new Date().toDateString();
  const sorted = [...items].sort((a, b) => notificationPriority(b, stamps) - notificationPriority(a, stamps));
  let todayCount = 0;
  return sorted.filter((item) => {
    const published = item.published_at || item.created_at;
    const isToday = published && new Date(published).toDateString() === today;
    if (!isToday) return true;
    if (todayCount >= maxPerDay) return false;
    todayCount += 1;
    return true;
  });
}
