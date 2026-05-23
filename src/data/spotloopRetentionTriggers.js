/**
 * Spotloop Retention — das Produkt öffnet sich im richtigen Moment.
 * Member: 5 Trigger · Gastronom: 4 Trigger · gemeinsam max. 2–3/Woche.
 */

export const RETENTION_PHILOSOPHY = {
  headline: "Das Produkt muss sich selbst öffnen.",
  body:
    "Spotloop funktioniert langfristig nicht nur weil es ein gutes Produkt ist — sondern weil es im richtigen Moment erscheint. Für den Member 150 Meter vom Café. Für den Gastronomen wenn ein Stammgast wegzubrechen droht.",
};

export const NOTIFICATION_LIMITS = {
  maxPerWeek: 3,
  maxPerDay: 2,
  /** Kein Push wenn Member weiter als X Meter vom Spot */
  memberLocationRadiusM: 200,
  sleeperDays: 21,
  campaignQuietDays: 10,
  rewardExpiryReminderDays: 14,
  socialRelevanceMaxPerMonth: 1,
  weeklySummaryWeekday: 1,
  weeklySummaryHour: 8,
};

/** Member — fünf Trigger */
export const MEMBER_TRIGGERS = {
  location_nearby: {
    id: "location_nearby",
    title: "Standort-Trigger",
    when: `Nur innerhalb ${NOTIFICATION_LIMITS.memberLocationRadiusM} m — nie wenn der Member weit weg ist`,
    example: (spot, remaining, reward) =>
      `Du bist in der Nähe von ${spot}. Noch ${remaining} Besuche bis zu deinem ${reward}.`,
    priority: 100,
  },
  stamp_almost_full: {
    id: "stamp_almost_full",
    title: "Fast-voll",
    when: "9 von 10 Besuchen (1 Besuch vor Reward)",
    example: (spot, reward) =>
      `Nur noch 1 Besuch bei ${spot} — dann gehört der ${reward} dir.`,
    priority: 95,
  },
  positive_streak: {
    id: "positive_streak",
    title: "Stammgast-Streak",
    when: "Positive Verstärkung — kein „Streak bricht ab“",
    example: (spot, count) =>
      `Du warst diese Woche ${count}× bei ${spot}. Dein Stammgast-Status wächst.`,
    priority: 70,
  },
  social_soft: {
    id: "social_soft",
    title: "Soziale Relevanz",
    when: "Max. 1× pro Monat — sanfte Erinnerung",
    example: (name, spot, weeks) =>
      `${name} war gestern bei ${spot}. Du warst seit ${weeks} Wochen nicht mehr dort.`,
    priority: 40,
  },
  reward_expiry: {
    id: "reward_expiry",
    title: "Reward läuft ab",
    when: `${NOTIFICATION_LIMITS.rewardExpiryReminderDays} Tage ungenutzt — echte Verknappung`,
    example: (reward) =>
      `Dein ${reward} wartet noch auf dich. Gültig bis Ende des Monats.`,
    priority: 85,
  },
};

/** Gastronom — vier automatische Trigger */
export const MERCHANT_TRIGGERS = {
  sleeper_alert: {
    id: "sleeper_alert",
    title: "Schläfer-Alert",
    when: `Stammgast ${NOTIFICATION_LIMITS.sleeperDays}+ Tage nicht da`,
    example: (pseudo, days, riskEur) =>
      `${pseudo} war ${days} Tage weg — ${riskEur} Risiko. Reaktivierung senden?`,
    action: "Reaktivierung senden",
    oneTap: true,
  },
  campaign_reminder: {
    id: "campaign_reminder",
    title: "Kampagnen-Erinnerung",
    when: `Letzte Kampagne vor ${NOTIFICATION_LIMITS.campaignQuietDays}+ Tagen`,
    example: (days, followers) =>
      `${days} Tage keine Kampagne. Deine ${followers} Follower hören nichts von dir.`,
    action: "Vorformulierten Text senden",
    oneTap: true,
  },
  weekly_summary: {
    id: "weekly_summary",
    title: "Wochen-Zusammenfassung",
    when: "Montag 08:00 — 3 Sekunden lesen",
    example: (checkins, sleepers, campaigns) =>
      `Deine Woche: ${checkins} Check-ins, ${sleepers} Schläfer, ${campaigns} Kampagne empfohlen.`,
    action: null,
    oneTap: false,
  },
  reactivation_success: {
    id: "reactivation_success",
    title: "Reaktivierung hat funktioniert",
    when: "Stammgast nach Kampagne wieder da",
    example: (pseudo) => `${pseudo} ist zurück — deine Kampagne hat funktioniert.`,
    action: null,
    oneTap: false,
  },
};

export const NOTIFICATION_RULES_COPY = {
  title: "Gemeinsame Regel",
  rules: [
    "Maximal 2–3 Notifications pro Woche — Member und Gastronom.",
    "Jede Notification braucht einen konkreten Grund — keine generische Werbung.",
    "Keine Fake-Dringlichkeit. Keine Wiederholungen.",
  ],
  wrong: "Montag 09:00 — generische Erinnerung",
  right: "Genau wenn es relevant ist: 150 m vom Café · Stammgast droht wegzubrechen · Reward läuft ab",
};

export const MERCHANT_NOTIF_ONBOARDING = {
  headline: "Spotloop erinnert dich — nur wenn es zählt.",
  body: "Schläfer-Alerts, Kampagnen-Tipps und deine Montags-Zusammenfassung. Ein Tap, kein Dashboard-Öffnen nötig.",
  cta: "Benachrichtigungen aktivieren",
  pwaHint: "Zum Homescreen — dann verpasst du nichts.",
};

export const MEMBER_LOCATION_ONBOARDING = {
  headline: "In der Nähe erinnert werden?",
  body: "Damit wir dich erinnern, wenn du bei einem deiner Lieblingsspots bist — nicht als Pflicht, sondern als Vorteil.",
  benefit: `Nur innerhalb von ${NOTIFICATION_LIMITS.memberLocationRadiusM} Metern. Kein Spam von weit weg.`,
  allow: "Standort erlauben",
  skip: "Später entscheiden",
};

/** Vorformulierter Kampagnen-Text (Kampagnen-Erinnerung). */
export function defaultCampaignReminderDraft(spotName = "deinem Spot") {
  return `Hey! Bei ${spotName} gibt's diese Woche etwas Neues — komm vorbei und zähl deinen Besuch. Wir freuen uns auf dich!`;
}
