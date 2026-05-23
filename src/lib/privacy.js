/**
 * Spotloop Privacy & Payment — privacy-first loyalty layer.
 * Per-spot stamps only; merchants see pseudonyms + consented insights.
 */

import { supabase } from "./supabase";
import { IS_LOCAL_MODE } from "./config";

const PREFS_KEY = "spotloop_privacy_prefs";
const PSEUDO_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const DEFAULT_PRIVACY_PREFS = {
  push_rewards: true,
  push_campaigns: false,
  /** Reaktivierungs-Einladungen (max. 1×/Monat/Spot) — Member kann ausschalten */
  push_reactivation: true,
  push_nearby: true,
  push_expiry: true,
  location_nearby: false,
  location_checkin: true,
  campaigns_all: false,
  campaigns_opted: true,
  discovery_personal: true,
  personalized_offers: true,
  loyalty_active: true,
  /** Spots dürfen Ø-Besuchswert & Ausgaben-Insights sehen */
  share_spend_with_spots: false,
  /** Personalisierte Kampagnen & Empfehlungen */
  allow_personalized_campaigns: true,
  /** Smart Member Profile (Besuche, Stufe, Rewards) für Spots */
  share_loyalty_insights: true,
  /** Community-Einladungen von Spots erhalten */
  allow_community_invites: true,
  /** In Community-Listen für den Spot sichtbar (Pseudonym) */
  community_visible_to_spot: true,
};

export const LOYALTY_TIERS = [
  { id: "bronze", label: "Bronze", minVisits: 0, emoji: "🥉" },
  { id: "silver", label: "Silber", minVisits: 5, emoji: "🥈" },
  { id: "gold", label: "Gold", minVisits: 12, emoji: "🥇" },
  { id: "platinum", label: "Platin", minVisits: 25, emoji: "💎" },
];

function stableHash(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/** Deterministisches Pseudonym pro Member × Spot (z. B. Member #A72X91). */
export function getMemberPseudonym(userId, spotId = "") {
  if (!userId) return "Member #------";
  const seed = stableHash(`${userId}:${spotId || "spotloop"}`);
  let code = "";
  let n = seed;
  for (let i = 0; i < 6; i += 1) {
    code += PSEUDO_CHARS[n % PSEUDO_CHARS.length];
    n = Math.floor(n / PSEUDO_CHARS.length) + stableHash(`${seed}:${i}`);
  }
  return `Member #${code}`;
}

/** Kurz-Pseudonym für Händler-Stammgast-Liste (z. B. Gast #A72X). */
export function getGuestPseudonym(userId, spotId = "") {
  if (!userId) return "Gast #----";
  const code = getMemberPseudonym(userId, spotId).replace(/^Member #/, "").slice(0, 4);
  return `Gast #${code}`;
}

export function getLoyaltyTier(visitCount = 0) {
  const visits = Math.max(0, visitCount);
  let tier = LOYALTY_TIERS[0];
  for (const t of LOYALTY_TIERS) {
    if (visits >= t.minVisits) tier = t;
  }
  return tier;
}

export function getPrivacyPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PRIVACY_PREFS };
    return { ...DEFAULT_PRIVACY_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PRIVACY_PREFS };
  }
}

export function setPrivacyPrefs(partial) {
  const next = { ...getPrivacyPrefs(), ...partial };
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  return next;
}

function rowToPrefs(row) {
  if (!row) return null;
  const extra = row.prefs && typeof row.prefs === "object" ? row.prefs : {};
  return {
    ...DEFAULT_PRIVACY_PREFS,
    ...extra,
    share_spend_with_spots: row.share_spend_with_spots,
    allow_personalized_campaigns: row.allow_personalized_campaigns,
    share_loyalty_insights: row.share_loyalty_insights,
    loyalty_active: row.loyalty_active,
  };
}

function prefsToRow(userId, prefs) {
  const {
    share_spend_with_spots,
    allow_personalized_campaigns,
    share_loyalty_insights,
    loyalty_active,
    ...rest
  } = prefs;
  return {
    user_id: userId,
    share_spend_with_spots: !!share_spend_with_spots,
    allow_personalized_campaigns: allow_personalized_campaigns !== false,
    share_loyalty_insights: share_loyalty_insights !== false,
    loyalty_active: loyalty_active !== false,
    prefs: rest,
    updated_at: new Date().toISOString(),
  };
}

/** Lädt Privacy-Prefs aus Supabase (falls Tabelle existiert) und merged mit localStorage. */
export async function syncPrivacyPrefsFromCloud(userId) {
  if (!userId || !supabase || IS_LOCAL_MODE) return getPrivacyPrefs();
  try {
    const { data, error } = await supabase
      .from("user_privacy_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) return getPrivacyPrefs();
      return getPrivacyPrefs();
    }
    const cloud = rowToPrefs(data);
    if (!cloud) return getPrivacyPrefs();
    const merged = { ...getPrivacyPrefs(), ...cloud };
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return getPrivacyPrefs();
  }
}

/** Speichert lokal + Supabase (upsert). */
export async function savePrivacyPrefs(userId, partial) {
  const next = setPrivacyPrefs(partial);
  if (!userId || !supabase || IS_LOCAL_MODE) return next;
  try {
    await supabase.from("user_privacy_preferences").upsert(prefsToRow(userId, next), { onConflict: "user_id" });
  } catch {
    /* Tabelle fehlt oder offline — localStorage reicht */
  }
  return next;
}

export function canMerchantSeeSpend(prefs = getPrivacyPrefs()) {
  return prefs.share_spend_with_spots === true;
}

export function canMerchantPersonalize(prefs = getPrivacyPrefs()) {
  return prefs.allow_personalized_campaigns !== false && prefs.loyalty_active !== false;
}

export function canMerchantSeeInsights(prefs = getPrivacyPrefs()) {
  return prefs.share_loyalty_insights !== false && prefs.loyalty_active !== false;
}

export function canReceiveCommunityInvites(prefs = getPrivacyPrefs()) {
  return prefs.allow_community_invites !== false && prefs.loyalty_active !== false;
}

/** Engagement 0–100 — Besuche, Rewards, Community (kein Umsatz). */
export function computeEngagementScore({
  visits = 0,
  rewardsRedeemed = 0,
  communitiesActive = 0,
  daysSinceLastVisit = 999,
}) {
  let score = Math.min(visits * 6, 42);
  score += Math.min(rewardsRedeemed * 10, 24);
  score += Math.min(communitiesActive * 8, 16);
  if (daysSinceLastVisit <= 7) score += 12;
  else if (daysSinceLastVisit <= 30) score += 6;
  return Math.min(100, Math.round(score));
}

export function engagementLabel(score) {
  if (score >= 70) return { label: "Sehr aktiv", emoji: "🔥", color: "#1B4FD8" };
  if (score >= 40) return { label: "Aktiv", emoji: "✨", color: "#0EA5E9" };
  return { label: "Aufbauend", emoji: "🌱", color: "#64748B" };
}

function daysSince(iso) {
  if (!iso) return 9999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function formatMonthYear(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  } catch {
    return null;
  }
}

function estimateAvgSpend(stamp, allowSpend) {
  if (!allowSpend) return null;
  const points = stamp?.points ?? 0;
  if (points <= 0) return null;
  const est = 8 + Math.min(points * 2.2, 48);
  return `${Math.round(est)} €`;
}

function favoriteTimeLabel(lastVisit) {
  if (!lastVisit) return null;
  try {
    const h = new Date(lastVisit).getHours();
    if (h >= 7 && h < 11) return "Vormittags";
    if (h >= 11 && h < 15) return "Mittags";
    if (h >= 15 && h < 18) return "Nachmittags";
    if (h >= 18 && h < 22) return "Abends";
    return "Spät";
  } catch {
    return null;
  }
}

/**
 * Smart Member Profile — nur für Merchant-UI, privacy-scoped.
 */
export function buildSmartMemberProfile({
  userId,
  spotId,
  stamp,
  visitCount,
  rewardsRedeemed = 0,
  communitiesActive = 0,
  prefs,
}) {
  const p = prefs ?? getPrivacyPrefs();
  const insights = canMerchantSeeInsights(p);
  const spend = canMerchantSeeSpend(p);
  const visits = visitCount ?? stamp?.points ?? 0;
  const tier = getLoyaltyTier(visits);
  const pseudonym = getMemberPseudonym(userId, spotId);
  const lastIso = stamp?.last_visit || stamp?.updated_at;
  const engagement = computeEngagementScore({
    visits,
    rewardsRedeemed,
    communitiesActive,
    daysSinceLastVisit: daysSince(lastIso),
  });
  const engMeta = engagementLabel(engagement);

  if (!insights) {
    return {
      pseudonym,
      restricted: true,
      message: "Member hat Loyalty-Insights nicht freigegeben.",
      tier: null,
      metrics: [],
      engagement: null,
    };
  }

  const metrics = [
    { label: "Aktiv seit", value: formatMonthYear(stamp?.created_at) || "—" },
    { label: "Besuche", value: String(visits) },
    { label: "Engagement", value: `${engMeta.emoji} ${engMeta.label}` },
    { label: "Rewards eingelöst", value: String(rewardsRedeemed) },
    { label: "Stammgast-Level", value: `${tier.emoji} ${tier.label}` },
  ];

  if (communitiesActive > 0) {
    metrics.push({
      label: "Community",
      value: `${communitiesActive} Club${communitiesActive > 1 ? "s" : ""}`,
    });
  }

  const fav = favoriteTimeLabel(lastIso);
  if (fav) metrics.push({ label: "Lieblingszeit", value: fav });

  const avg = estimateAvgSpend(stamp, spend);
  if (avg) metrics.push({ label: "Ø Besuch (freigegeben)", value: avg });

  return {
    pseudonym,
    restricted: false,
    tier,
    metrics,
    engagement,
    engagementMeta: engMeta,
    rewardReady: !!stamp?.reward_ready,
    points: stamp?.points ?? 0,
    maxPoints: stamp?.max_points ?? 10,
  };
}

/**
 * Gast-Liste für Merchant/Kampagnen — ohne echten Namen.
 * `keepBirthday` nur für Zielgruppen-Filter (Geburtstag), nicht zur Anzeige.
 */
export function toPrivacySafeGuest(guest, spotId, { keepBirthday = true } = {}) {
  const userId = guest.user_id || guest.id;
  return {
    ...guest,
    user_id: userId,
    name: getMemberPseudonym(userId, spotId),
    display_name: undefined,
    email: undefined,
    birthday: keepBirthday ? guest.birthday ?? null : null,
    _privacy_masked: true,
  };
}

export function buildPrivacySafeRoster(guests, spotId, prefs) {
  return guests.map((g) => toPrivacySafeGuest(g, spotId, prefs));
}

/** Wallet-Prinzipien — Stempel pro Spot, keine Payment-Karte. */
export const PAYMENT_PRINCIPLES = {
  tagline: "Ein Scan. Ein Spot. Dein Besuch.",
  noUniversalPoints:
    "Stempel und Rewards gelten nur bei dem Spot, an dem du eingecheckt hast — nicht app-weit.",
  merchantVisibility:
    "Spots sehen ein anonymes Loyalty-Profil, keine Zahlungsdaten und keinen Namen aus der Wallet.",
  communityFocus:
    "Communities belohnen Loyalty und Engagement — nicht „die reichsten Gäste“.",
};
