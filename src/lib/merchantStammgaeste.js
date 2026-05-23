import { buildTopRegularGuests, formatLastVisit } from "./stammgaeste";

export const AVG_TICKET_EUR = 15;
export const TOP_STAMMGAST_PERCENT = 10;
export const SLEEP_AT_RISK_DAYS = 18;
export const SLEEP_CRITICAL_DAYS = 24;
/** Bulk-Reaktivierung (21+ Tage inaktiv). */
export const STAMMGAST_INACTIVE_DAYS = 21;

const WEEKDAY_DE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function daysSince(iso) {
  if (!iso) return 9999;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 9999;
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
}

function isSameMonth(iso, ref = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function visitsThisMonth(checkins, userId) {
  return (checkins || []).filter(
    (c) => c.user_id === userId && isSameMonth(c.updated_at || c.created_at),
  ).length;
}

function preferredWeekdays(checkins, userId, max = 2) {
  const counts = new Array(7).fill(0);
  const cutoff = Date.now() - 90 * 86400000;
  for (const c of checkins || []) {
    if (c.user_id !== userId) continue;
    const t = new Date(c.updated_at || c.created_at || 0).getTime();
    if (Number.isNaN(t) || t < cutoff) continue;
    counts[new Date(t).getDay()] += 1;
  }
  return counts
    .map((n, i) => ({ day: WEEKDAY_DE[i], count: n }))
    .filter((x) => x.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, max)
    .map((x) => x.day);
}

function guestRespondedToCampaign(checkins, campaigns, userId) {
  const userCheckins = (checkins || [])
    .filter((c) => c.user_id === userId)
    .map((c) => new Date(c.updated_at || c.created_at || 0).getTime())
    .filter((t) => !Number.isNaN(t));

  if (!userCheckins.length) return false;

  for (const camp of campaigns || []) {
    const sent = new Date(camp.created_at || camp.sent_at || 0).getTime();
    if (Number.isNaN(sent)) continue;
    const windowEnd = sent + 7 * 86400000;
    if (userCheckins.some((t) => t >= sent && t <= windowEnd)) return true;
  }
  return false;
}

function getSleepRisk(daysSinceVisit) {
  if (daysSinceVisit >= SLEEP_CRITICAL_DAYS) {
    return {
      level: "critical",
      label: "Wegbruch-Risiko",
      suggestion: "Persönliche Einladung — bevor er für immer wegbleibt",
      action: "invite",
    };
  }
  if (daysSinceVisit >= SLEEP_AT_RISK_DAYS) {
    return {
      level: "at_risk",
      label: "Schläfer-Risiko",
      suggestion: "Reaktivierungs-Kampagne vorschlagen",
      action: "reactivation",
    };
  }
  return null;
}

function buildPatternHint(weekdays, respondsToCampaigns) {
  const parts = [];
  if (weekdays.length >= 2) {
    parts.push(`Kommt oft ${weekdays.slice(0, 2).join(" und ")}`);
  } else if (weekdays.length === 1) {
    parts.push(`Kommt oft ${weekdays[0].toLowerCase()}s`);
  }
  if (respondsToCampaigns) {
    parts.push("reagiert auf Kampagnen");
  }
  if (!parts.length) return null;
  return parts.join(" · ");
}

function prestigeHints(userId, spotId) {
  const seed = `${userId}:${spotId}`.length % 3;
  const table = ["Fensterplatz", "Theke", "ruhiger Bereich"][seed];
  const dish = ["Lieblingsgericht notiert", "Stammgericht erkannt", "Präferenz im Profil"][seed];
  return { tablePreference: table, dishNote: dish };
}

/**
 * Stammgäste-Dashboard: Top 10 %, anonyme Profile, Schläfer-Risiko, Muster.
 */
export function buildStammgaesteDashboard(
  stampMembers = [],
  spotId,
  { checkins = [], campaigns = [], followerCount = 0, prestigeDetail = false } = {},
) {
  const top = buildTopRegularGuests(stampMembers, spotId, {
    percent: TOP_STAMMGAST_PERCENT,
    checkins,
  });

  const guests = top.guests.map((g) => {
    const daysSinceVisit = daysSince(g.lastVisitIso);
    const visitsMonth = visitsThisMonth(checkins, g.userId);
    const revenueMonthEstimate = visitsMonth * AVG_TICKET_EUR;
    const weekdays = preferredWeekdays(checkins, g.userId);
    const respondsToCampaigns = guestRespondedToCampaign(checkins, campaigns, g.userId);
    const sleepRisk = getSleepRisk(daysSinceVisit);
    const patternHint = buildPatternHint(weekdays, respondsToCampaigns);

    return {
      ...g,
      daysSinceVisit,
      visitsThisMonth: visitsMonth,
      revenueMonthEstimate,
      revenueMonthLabel: `EUR ${revenueMonthEstimate}`,
      sleepRisk,
      preferredWeekdays: weekdays,
      respondsToCampaigns,
      patternHint,
      inactive: daysSinceVisit >= STAMMGAST_INACTIVE_DAYS,
      regular: !sleepRisk && visitsMonth >= 2,
      prestigeDetail: prestigeDetail ? prestigeHints(g.userId, spotId) : null,
    };
  });

  const allWithStamps = (stampMembers || []).filter((s) => s.user_id && (s.points ?? 0) > 0);
  const totalRevenueEstimate = allWithStamps.reduce((sum, s) => {
    const v = visitsThisMonth(checkins, s.user_id);
    return sum + v * AVG_TICKET_EUR;
  }, 0);
  const topRevenueEstimate = guests.reduce((sum, g) => sum + g.revenueMonthEstimate, 0);
  const revenueSharePct =
    totalRevenueEstimate > 0 ? Math.round((topRevenueEstimate / totalRevenueEstimate) * 100) : 0;

  const atRisk = guests.filter((g) => g.sleepRisk?.level === "at_risk");
  const critical = guests.filter((g) => g.sleepRisk?.level === "critical");
  const regular = guests.filter((g) => g.regular && !g.sleepRisk);

  return {
    topPercent: TOP_STAMMGAST_PERCENT,
    topCount: top.topCount,
    totalWithStamps: top.total,
    followerCount,
    guests,
    regular,
    inactive: guests.filter((g) => g.inactive),
    atRisk,
    critical,
    totalRevenueEstimate,
    topRevenueEstimate,
    revenueSharePct,
  };
}

/** @deprecated — nutze buildStammgaesteDashboard */
export function buildStammgaesteLists(stampMembers, spotId, checkins = [], options = {}) {
  const dash = buildStammgaesteDashboard(stampMembers, spotId, {
    checkins,
    campaigns: options.campaigns,
    followerCount: options.followerCount,
  });
  return {
    regular: dash.regular,
    inactive: dash.inactive,
    totalRevenueEstimate: dash.topRevenueEstimate,
    all: dash.guests,
    ...dash,
  };
}

export { formatLastVisit };
