import { getGuestPseudonym } from "./privacy";

export const STAMMGAST_COUPON_INTRO =
  "Danke dass du so oft da bist — hier ist dein exklusiver Coupon.";
export const STAMMGAST_BONUS_REWARD_DEFAULT =
  "Heute dein Kaffee gratis — als Dankeschön.";

/** @deprecated Alias */
export const STAMMGAST_VIP_REWARD_DEFAULT = STAMMGAST_BONUS_REWARD_DEFAULT;

const STAMM_META_RE = /^<!--stammgast:([a-f0-9-,]+)-->\n?/i;

/** Relatives Datum für „Zuletzt da“. */
export function formatLastVisit(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const now = Date.now();
  const diffMs = now - d.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 7) return `Vor ${days} Tagen`;
  if (days < 30) return `Vor ${Math.floor(days / 7)} Wochen`;
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" });
}

/** Trend aus Check-in-Historie oder letztem Besuch. */
export function computeVisitTrend(userId, checkins = [], lastVisitIso = null, visitCount = 0) {
  const now = Date.now();
  const d30 = 30 * 86400000;
  const userCheckins = (checkins || []).filter((c) => c.user_id === userId);

  if (userCheckins.length >= 2) {
    const recent = userCheckins.filter((c) => {
      const t = new Date(c.updated_at || c.created_at || 0).getTime();
      return now - t < d30;
    }).length;
    const prev = userCheckins.filter((c) => {
      const t = new Date(c.updated_at || c.created_at || 0).getTime();
      return t >= now - 2 * d30 && t < now - d30;
    }).length;
    if (recent > prev) return { trend: "up", label: "Steigend", emoji: "📈", color: "#059669" };
    if (recent < prev) return { trend: "down", label: "Fallend", emoji: "📉", color: "#DC2626" };
    return { trend: "stable", label: "Stabil", emoji: "➡️", color: "#64748B" };
  }

  if (lastVisitIso) {
    const days = Math.floor((now - new Date(lastVisitIso).getTime()) / (24 * 60 * 60 * 1000));
    if (days <= 14 && visitCount >= 3) {
      return { trend: "up", label: "Steigend", emoji: "📈", color: "#059669" };
    }
    if (days > 30) {
      return { trend: "down", label: "Fallend", emoji: "📉", color: "#DC2626" };
    }
  }

  return { trend: "stable", label: "Stabil", emoji: "➡️", color: "#64748B" };
}

export function parseStammgastRecipientIds(message) {
  const m = (message || "").match(STAMM_META_RE);
  if (!m) return null;
  return m[1].split(",").map((id) => id.trim()).filter(Boolean);
}

export function stripStammgastMeta(message) {
  return (message || "").replace(STAMM_META_RE, "").trim();
}

export function wrapStammgastMessage(userIds, publicMessage) {
  const ids = Array.isArray(userIds) ? userIds.filter(Boolean) : [];
  return `<!--stammgast:${ids.join(",")}-->\n${publicMessage.trim()}`;
}

export function isStammgastCampaign(row) {
  return row?.type === "stammgast" || row?.audience === "stammgast";
}

/** Coupon nur für eingeladene Stammgast-User-IDs sichtbar. */
export function campaignVisibleToGuest(row, userId) {
  if (!isStammgastCampaign(row)) return true;
  if (!userId) return false;
  const ids = parseStammgastRecipientIds(row.message);
  return ids?.includes(userId) ?? false;
}

/**
 * Top X % loyalste Wallet-Gäste (nach Stempel-Punkten / Besuchen).
 */
export function buildTopRegularGuests(stampMembers, spotId, { percent = 10, checkins = [] } = {}) {
  const rows = (stampMembers || [])
    .filter((s) => s.user_id && (s.points ?? 0) > 0)
    .map((s) => {
      const lastVisitIso = s.last_visit || s.updated_at || s.created_at || null;
      const visitCount = s.points ?? 0;
      const trend = computeVisitTrend(s.user_id, checkins, lastVisitIso, visitCount);
      return {
        userId: s.user_id,
        visitCount,
        lastVisitIso,
        pseudonym: getGuestPseudonym(s.user_id, spotId),
        rewardReady: Boolean(s.reward_ready),
        trend,
      };
    })
    .sort((a, b) => b.visitCount - a.visitCount);

  if (rows.length === 0) {
    return { total: 0, topCount: 0, threshold: 0, percent, guests: [] };
  }

  const topCount = Math.max(1, Math.ceil(rows.length * (percent / 100)));
  const guests = rows.slice(0, topCount).map((g, i) => ({
    ...g,
    rank: i + 1,
    lastVisitLabel: formatLastVisit(g.lastVisitIso),
  }));
  const threshold = guests[guests.length - 1]?.visitCount ?? 0;

  return { total: rows.length, topCount, threshold, percent, guests };
}

/** Öffentlicher Kampagnentext für Stammgast-Coupon. */
export function buildStammgastCouponMessage({
  intro = STAMMGAST_COUPON_INTRO,
  offer = "Exklusives Angebot — nur für Stammgäste",
  validity = "Nur heute gültig",
} = {}) {
  return `${intro}\n${offer}. ${validity}`;
}
