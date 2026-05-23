import { getCampaignAudience } from "./firestore";
import { CAMP_TYPE_META } from "./campaignAudiences";

export const MESSAGE_TEMPLATES = {
  reactivation: [
    "Wir vermissen dich! 🎁 Komm vorbei — diese Woche gibt es einen Bonus-Besuch.",
    "Lange nicht gesehen! ☕ Dein Lieblingsplatz wartet — heute mit Extra-Reward.",
    "Hey! 👋 Zeit für einen Besuch — wir haben etwas für dich vorbereitet.",
  ],
  birthday: [
    "Happy Birthday! 🎂 Heute gibt es dein Lieblings-Reward gratis — wir freuen uns auf dich!",
    "Alles Gute zum Geburtstag! 🎉 Komm vorbei und feiere mit uns.",
    "🎂 Geburtstags-Special nur für dich — heute bei uns einlösbar!",
  ],
  push: [
    "2 für 1 Pizza — heute, 17–21 Uhr. Gültig bis 21:00 Uhr",
    "Happy Hour: Gratis Upgrade — heute, 14–17 Uhr. Gültig bis 17:00 Uhr",
    "Exklusiv für Follower: Special des Tages — nur heute gültig",
  ],
  segment: [
    "Danke, dass du Stammgast bist! 👑 Exklusiver Reward nur für treue Gäste.",
    "Du gehörst zu unseren Top-Gästen — 🎁 hol dir deinen Bonus ab.",
  ],
  feed: [
    "⭐ Wir sind diese Woche im Featured — entdecke uns in der App!",
    "📍 Findet uns jetzt prominent in Spotloop — folgt uns für Updates.",
  ],
};

export function personalizeMessage(template, spotName) {
  const name = spotName?.trim() || "uns";
  return template.replace(/\{spot\}/g, name);
}

/** Live-Zielgruppen für Kampagne erstellen (Composer) */
export async function loadCampaignInsights(spotId, { followerCount = 0, spotName = "" } = {}) {
  const [react30, react60, bdayToday, bdayWeek] = await Promise.all([
    getCampaignAudience(spotId, "reactivation", { inactiveDays: 30 }).catch(() => ({ count: 0, guests: [] })),
    getCampaignAudience(spotId, "reactivation", { inactiveDays: 60 }).catch(() => ({ count: 0, guests: [] })),
    getCampaignAudience(spotId, "birthday", { birthdayScope: "today" }).catch(() => ({ count: 0, guests: [] })),
    getCampaignAudience(spotId, "birthday", { birthdayScope: "week" }).catch(() => ({ count: 0, guests: [] })),
  ]);

  const recommendations = [];
  if (bdayToday.count > 0) {
    recommendations.push({
      type: "birthday",
      priority: 1,
      config: { birthdayScope: "today" },
      icon: CAMP_TYPE_META.birthday.icon,
    });
  }
  if (react30.count > 0) {
    recommendations.push({
      type: "reactivation",
      priority: 2,
      config: { inactiveDays: 30 },
      icon: CAMP_TYPE_META.reactivation.icon,
    });
  }
  if (followerCount > 0) {
    recommendations.push({
      type: "push",
      priority: 3,
      config: {},
      icon: CAMP_TYPE_META.push.icon,
    });
  }

  const topPick = recommendations[0] || null;
  return { react30, react60, bdayToday, bdayWeek, followerCount, recommendations, topPick, spotName };
}

export function campaignTypesWithCounts(insights) {
  if (!insights) return [];
  const { react30, bdayToday, bdayWeek, followerCount } = insights;
  return [
    {
      id: "reactivation",
      badge: react30.count > 0 ? `${react30.count}` : null,
      recommended: insights.topPick?.type === "reactivation",
    },
    {
      id: "birthday",
      badge: bdayToday.count > 0 ? `${bdayToday.count} heute` : bdayWeek.count > 0 ? `${bdayWeek.count} Woche` : null,
      recommended: insights.topPick?.type === "birthday",
    },
    {
      id: "push",
      badge: followerCount > 0 ? `${followerCount}` : null,
      recommended: insights.topPick?.type === "push",
    },
    { id: "segment", badge: null, recommended: false },
    { id: "feed", badge: null, recommended: false },
  ];
}

export function filterCampaignHistory(rows) {
  return (rows ?? []).filter(
    (c) => c.type && !c.type.startsWith("post_") && c.type !== "notification"
  );
}

export function campaignStats(history) {
  const sent = history.length;
  const totalRecipients = history.reduce((s, c) => s + (c.recipient_count ?? 0), 0);
  const last = history[0];
  const lastLabel = last?.created_at
    ? new Date(last.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })
    : "—";
  const withImage = history.filter((c) => c.image_url).length;
  const avgRecipients = sent > 0 ? Math.round(totalRecipients / sent) : 0;
  return { sent, totalRecipients, lastLabel, withImage, avgRecipients };
}

function campaignExtraLabel(c) {
  if (c.type === "reactivation" && c.inactive_days) return `Inaktiv ≥ ${c.inactive_days} Tage`;
  if (c.type === "birthday" && c.birthday_scope) {
    return c.birthday_scope === "week" ? "Geburtstag diese Woche" : "Geburtstag heute";
  }
  if (c.audience) return CAMP_TYPE_META[c.audience]?.label || c.audience;
  return null;
}

/** Auswertung nur aus gesendeten Kampagnen (keine Live-Zielgruppen-Empfehlungen). */
export function buildCampaignReport(campaigns) {
  const history = filterCampaignHistory(campaigns).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );
  const stats = campaignStats(history);

  const byType = {};
  for (const c of history) {
    const t = c.type || "other";
    if (!byType[t]) {
      byType[t] = {
        type: t,
        icon: CAMP_TYPE_META[t]?.icon || "📢",
        label: CAMP_TYPE_META[t]?.label || t,
        count: 0,
        recipients: 0,
      };
    }
    byType[t].count += 1;
    byType[t].recipients += c.recipient_count ?? 0;
  }

  const typeBreakdown = Object.values(byType).sort((a, b) => b.count - a.count);

  const topType = typeBreakdown[0];
  let insightText = "Noch keine Kampagnen gesendet.";
  if (stats.sent > 0) {
    const parts = [
      `${stats.sent} Kampagne${stats.sent === 1 ? "" : "n"} gesendet`,
      `${stats.totalRecipients} Empfänger insgesamt`,
    ];
    if (topType) parts.push(`häufigster Typ: ${topType.label} (${topType.count}×)`);
    if (stats.withImage > 0) parts.push(`${stats.withImage} mit Bild`);
    insightText = parts.join(" · ");
  }

  const enriched = history.map((c) => ({
    ...c,
    meta: CAMP_TYPE_META[c.type] || { icon: "📢", label: c.type },
    extra: campaignExtraLabel(c),
    dateLabel: c.created_at
      ? new Date(c.created_at).toLocaleString("de-DE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
  }));

  return {
    history: enriched,
    stats,
    typeBreakdown,
    insightText,
  };
}

export function previewGuestMessage(type, message, spotName, imageUrl = null) {
  const meta = CAMP_TYPE_META[type];
  return {
    spot_name: spotName || "Dein Spot",
    badge: meta?.label || "Kampagne",
    title: message.slice(0, 80) || meta?.defaultMessage?.slice(0, 80) || "Neue Aktion",
    body: message || meta?.defaultMessage || "",
    image_url: imageUrl,
  };
}
