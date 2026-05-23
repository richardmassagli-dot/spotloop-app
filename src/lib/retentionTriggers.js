import { STAMMGAST_INACTIVE_DAYS, AVG_TICKET_EUR } from "./merchantStammgaeste";
import {
  NOTIFICATION_LIMITS,
  MERCHANT_TRIGGERS,
  defaultCampaignReminderDraft,
} from "../data/spotloopRetentionTriggers";
import { formatEuro } from "./merchantOverview";

function daysSinceCampaign(campaigns = []) {
  const normal = (campaigns || []).filter((c) =>
    ["push", "segment", "notification"].includes(c.type || ""),
  );
  if (!normal.length) return 999;
  const latest = normal.reduce((max, c) => {
    const d = new Date(c.created_at || 0).getTime();
    return d > max ? d : max;
  }, 0);
  if (!latest) return 999;
  return Math.floor((Date.now() - latest) / (24 * 60 * 60 * 1000));
}

/**
 * Aktive Merchant-Trigger für Inbox (Client-Vorschau / später Push).
 */
export function buildMerchantRetentionTriggers({
  insights,
  campaigns = [],
  spotName = "dein Spot",
  followerCount = 0,
}) {
  const triggers = [];
  const dash = insights?.dash;
  const guests = dash?.guests || [];

  for (const g of guests.filter((x) => (x.daysSinceVisit ?? 0) >= STAMMGAST_INACTIVE_DAYS).slice(0, 3)) {
    const risk = Math.round((g.revenueMonthEstimate || AVG_TICKET_EUR * 2) * 0.6);
    triggers.push({
      id: `sleeper_${g.userId || g.pseudonym}`,
      type: "sleeper_alert",
      title: MERCHANT_TRIGGERS.sleeper_alert.title,
      body: MERCHANT_TRIGGERS.sleeper_alert.example(
        g.pseudonym || "Gast",
        g.daysSinceVisit ?? STAMMGAST_INACTIVE_DAYS,
        formatEuro(risk),
      ),
      action: MERCHANT_TRIGGERS.sleeper_alert.action,
      oneTap: true,
      severity: "high",
      guest: g,
    });
  }

  const quietDays = daysSinceCampaign(campaigns);
  if (quietDays >= NOTIFICATION_LIMITS.campaignQuietDays) {
    triggers.push({
      id: "campaign_reminder",
      type: "campaign_reminder",
      title: MERCHANT_TRIGGERS.campaign_reminder.title,
      body: MERCHANT_TRIGGERS.campaign_reminder.example(quietDays, followerCount),
      action: MERCHANT_TRIGGERS.campaign_reminder.action,
      oneTap: true,
      draftMessage: defaultCampaignReminderDraft(spotName),
      severity: "medium",
    });
  }

  const hub = insights?.hub ?? {};
  const isMonday = new Date().getDay() === NOTIFICATION_LIMITS.weeklySummaryWeekday;
  triggers.push({
    id: "weekly_summary",
    type: "weekly_summary",
    title: MERCHANT_TRIGGERS.weekly_summary.title,
    body: MERCHANT_TRIGGERS.weekly_summary.example(
      insights?.kpis?.checkinsToday != null
        ? Math.max(12, (insights?.detail?.chart7 || []).reduce((s, d) => s + d.count, 0))
        : 12,
      hub.sleepers ?? 0,
      quietDays >= NOTIFICATION_LIMITS.campaignQuietDays ? 1 : 0,
    ),
    action: null,
    oneTap: false,
    severity: "low",
    highlight: isMonday,
  });

  return triggers.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
  });
}

/** Format Member-Standort-Notification */
export function formatNearbyMemberNotification({ spotName, points, maxPoints, rewardText }) {
  const remaining = Math.max(0, (maxPoints || 10) - (points || 0));
  return `Du bist in der Nähe von ${spotName}. Noch ${remaining} Stempel bis zu deinem ${rewardText || "Reward"}.`;
}

export function merchantNotificationsOnboarded(userId) {
  if (!userId || typeof localStorage === "undefined") return true;
  return localStorage.getItem(`spotloop_merchant_notif_onboard_${userId}`) === "1";
}

export function markMerchantNotificationsOnboarded(userId) {
  if (!userId || typeof localStorage === "undefined") return;
  localStorage.setItem(`spotloop_merchant_notif_onboard_${userId}`, "1");
}
