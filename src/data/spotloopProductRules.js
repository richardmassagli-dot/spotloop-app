/**
 * Spotloop Produktregeln — Folgen vs. Sammeln, Spam-Schutz, Reaktivierung, QR.
 */

export const ACTIVE_MEMBER_DAYS = 30;
export const GLOBAL_DAILY_NOTIFICATION_MAX = 2;
/** Member & Gastronom — max. Notifications pro Kalenderwoche */
export const GLOBAL_WEEKLY_NOTIFICATION_MAX = 3;
export const REACTIVATION_COOLDOWN_DAYS = 30;
export const STAMMGAST_INACTIVE_DAYS = 21;

export const REACTIVATION_CAMPAIGN_MESSAGE =
  "Wir vermissen dich — komm vorbei und hol dir einen Bonus-Stempel.";

export const WEEKLY_CAMPAIGN_LIMIT_BY_PLAN = {
  pilot: 99,
  starter: 0,
  growth: 2,
  pro: 8,
  prestige: 99,
  enterprise: 99,
};

export const FOLLOW_VS_COLLECT = {
  title: "Folgen vs. Sammeln",
  follow: {
    headline: "Folgen = Interesse",
    body:
      "Du entdeckst einen Spot oder möchtest ihn später besuchen. Keine Stempelkarte, kein Lärm — der Spot bleibt ruhig im Hintergrund.",
  },
  collect: {
    headline: "Sammeln = echte Beziehung",
    body:
      "Erst wenn du wirklich hingehest und scannst, entsteht deine Stempelkarte — und erst dann bekommst du Kampagnen dieses Spots.",
  },
};

export const MEMBER_SPAM_PROTECTION = {
  title: "Member-Schutz vor Spam",
  rules: [
    "Jeder Spot hat ein wöchentliches Kampagnen-Limit (Growth: max. 2× pro Woche).",
    "Kampagnen gehen nur an Gäste mit aktiver Stempelkarte — Besuch in den letzten 30 Tagen.",
    "Max. 2 Notifications pro Tag, max. 3 pro Woche — egal wie viele Spots du folgst.",
    "Standort nur in der Nähe (200 m) · Fast-volle Karte hat Vorrang · kein Spam von weit weg.",
  ],
};

export const REACTIVATION_RULES = {
  title: "Reaktivierung — der Ausnahmefall",
  body:
    "Inaktive Gäste höchstens 1× pro Monat pro Spot — persönliche Einladung, keine Werbe-Kampagne. Nie parallel zur wöchentlichen Kampagne.",
  message: REACTIVATION_CAMPAIGN_MESSAGE,
  memberOptOut:
    "Du kannst Reaktivierungs-Nachrichten jederzeit in den Einstellungen ausschalten.",
};

export const OFFLINE_QR_RULES = {
  title: "Offline QR",
  body:
    "Scan am Tisch → Spot-Landingpage → App & erster Stempel. Kein Push vorher — der Gast entscheidet selbst.",
};

export const BALANCE_SUMMARY = [
  { role: "Aktiver Member", rule: "Normale Kampagnen (max. 2×/Woche bei Growth)" },
  { role: "Inaktiver Member", rule: "Nur Reaktivierung (max. 1×/Monat)" },
  { role: "Neuer Gast", rule: "Offline QR → eigene Entscheidung" },
  { role: "Viele Spots", rule: "Max. 2 Notifications pro Tag" },
];
