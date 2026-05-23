/**
 * Spotloop Preismodell — digitale Stammgast-Wallet für lokale Gastronomie.
 * Kampagne = direkte Nachricht an alle Follower, garantierte Zustellung.
 */

export const SPOTLOOP_PRODUCT_INTRO =
  "Jeder neue Spot startet mit 3 Monaten Pilot — voller Pro-Zugang, ohne Kreditkarte. Danach wählst du den Plan, der zu dir passt.";

export const SPOTLOOP_PILOT_NOTE =
  "Voller Pro-Funktionsumfang · ohne Kreditkarte · ehrliches Feedback willkommen";

export const SPOTLOOP_ANNUAL_NOTE = "Bei Jahreszahlung: 2 Monate gratis";

export const SPOTLOOP_ROI_COPY = {
  headline: "Die Rechnung ist einfach.",
  body:
    "Starter = €1,63 pro Tag. Kommen vier Stammkunden wegen einer Spotloop-Kampagne einmal mehr im Monat (Ø €15 Bon), hat sich das Abo bezahlt. Alles weitere ist reiner Gewinn.",
  dailyCost: "€1,63",
  breakEvenVisits: 4,
  avgTicket: "€15",
};

export const SPOTLOOP_PRICING_PLANS = [
  {
    id: "pilot",
    name: "Pilot",
    price: "€0",
    period: "/ 3 Monate",
    tagline: "Voller Pro-Zugang — ohne Risiko starten",
    features: "Wie Pro: alle Funktionen, 3 Monate kostenlos",
    recommended: true,
    tier: "pilot",
    campaignsPerWeek: null,
    campaignsPerMonth: "Pro (Pilot)",
    vipActionsPerMonth: "Pro (Pilot)",
    includesCampaigns: true,
    includesStammgaeste: true,
    includesOverview: true,
    includesNetwork: true,
    contactSales: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "€49",
    period: "/ Monat",
    tagline: "Kernfunktionen — QR, Besuch, Reward, Übersicht",
    features: "QR · Treue-Karte · Reward · tägliche Übersicht",
    tier: "standard",
    campaignsPerWeek: 0,
    campaignsPerMonth: 0,
    vipActionsPerMonth: 0,
    includesCampaigns: false,
    includesStammgaeste: false,
    includesOverview: true,
    includesNetwork: false,
    note: "Keine Kampagnen — für Follower-Kommunikation → Growth",
    contactSales: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "€149",
    period: "/ Monat",
    tagline: "Kampagnen an alle Follower — direkt, ohne Algorithmus",
    features: "4 Kampagnen/Woche · Stammgäste · DSGVO-Export",
    tier: "standard",
    campaignsPerWeek: 4,
    campaignsPerMonth: 16,
    vipActionsPerMonth: 0,
    includesCampaigns: true,
    includesStammgaeste: true,
    includesOverview: true,
    includesNetwork: false,
    contactSales: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "€249",
    period: "/ Monat",
    tagline: "Mehr Reichweite, VIP-Aktionen & Mehrstandort",
    features: "8 Kampagnen/Woche · VIP · Jahresauswertung · Spot-Netzwerk",
    tier: "standard",
    campaignsPerWeek: 8,
    campaignsPerMonth: 32,
    vipActionsPerMonth: "Unbegrenzt",
    includesCampaigns: true,
    includesStammgaeste: true,
    includesOverview: true,
    includesNetwork: true,
    contactSales: false,
  },
];

/** Monatspreise (netto) für Upgrade-Vergleich. */
export const PLAN_MONTHLY_EUR = {
  starter: 49,
  growth: 149,
  pro: 249,
};

/**
 * Extra Push-Credits — nachkaufbar wenn das Wochen-Kontingent aufgebraucht ist.
 * Bewusst premium: weniger Spam, bessere Kampagnen, natürlicher Upgrade-Druck.
 */
export const SPOTLOOP_EXTRA_PUSH_CREDITS = [
  {
    id: "push_2",
    count: 2,
    priceEur: 29,
    price: "€29",
    label: "2 Push",
    pricePerPushEur: 14.5,
    pricePerPushLabel: "€14,50",
  },
  {
    id: "push_5",
    count: 5,
    priceEur: 59,
    price: "€59",
    label: "5 Push",
    pricePerPushEur: 11.8,
    pricePerPushLabel: "€11,80",
  },
  {
    id: "push_10",
    count: 10,
    priceEur: 99,
    price: "€99",
    label: "10 Push",
    pricePerPushEur: 9.9,
    pricePerPushLabel: "€9,90",
    highlight: true,
  },
];

/** @deprecated — nutze SPOTLOOP_EXTRA_PUSH_CREDITS */
export const SPOTLOOP_EXTRA_CAMPAIGNS = SPOTLOOP_EXTRA_PUSH_CREDITS;
export const SPOTLOOP_EXTRA_PUSHES = SPOTLOOP_EXTRA_PUSH_CREDITS;

export const EXTRA_PUSH_CREDITS_COPY = {
  title: "Extra Push-Credits",
  subtitle: "Jederzeit nachkaufbar, wenn dein wöchentliches Kontingent aufgebraucht ist.",
  rationale:
    "Die Preise sind bewusst hoch — kein Zufall. Bei €4,50 pro Push sendet jemand gedankenlos. Bei €14,50 pro Push überlegst du zweimal, ob die Nachricht wirklich wichtig genug ist. Das erzeugt automatisch bessere Kampagnen, relevanteren Content und weniger Spam für deine Gäste.",
  roi:
    "€29 für zwei Push sind keine unüberwindbare Hürde. Ein Gastronom denkt nicht in €29 — er denkt daran, dass drei extra Gäste à €15 bereits €45 Umsatz bedeuten. Die Investition rechnet sich bei der ersten erfolgreichen Kampagne.",
  perPushHint: "Kleinstes Paket €14,50/Push · größtes Paket €9,90/Push — trotzdem bleibt jeder Push eine bewusste Entscheidung.",
};

/** Upgrade-Trigger — stärkster Moment im Produkt (Growth → Pro). */
export const EXTRA_CREDITS_UPGRADE_NUDGE = {
  /** Ab erstem Fünfer-Paket (€59) im Monat */
  growthToProAt59:
    "Du hast diesen Monat €59 für Extra-Credits ausgegeben — für nur €90 mehr hättest du den Pro-Plan mit vier Push pro Woche das ganze Jahr.",
  /** Ab zwei Fünfer-Paketen (€118) — Gesamtkosten über Pro-Monatspreis */
  growthToProAt118: (planEur, proEur, totalSpent) =>
    `Du hast diesen Monat €${totalSpent} für Extra-Credits ausgegeben — zusammen mit Growth (€${planEur}) zahlst du €${planEur + totalSpent}, mehr als der Pro-Plan (€${proEur}/Monat). Zeit für ein Upgrade.`,
};

const EXTRA_CREDITS_STORAGE_PREFIX = "spotloop_extra_credits_spent_";

/** Ausgegeben für Extra-Credits diesen Monat (lokal, bis Billing angebunden ist). */
export function getExtraCreditsSpentThisMonth(spotId) {
  if (!spotId || typeof localStorage === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`${EXTRA_CREDITS_STORAGE_PREFIX}${spotId}`);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const month = new Date().toISOString().slice(0, 7);
    if (data.month !== month) return 0;
    return Number(data.spent) || 0;
  } catch {
    return 0;
  }
}

export function recordExtraCreditsPurchase(spotId, priceEur) {
  if (!spotId || typeof localStorage === "undefined") return 0;
  const month = new Date().toISOString().slice(0, 7);
  const key = `${EXTRA_CREDITS_STORAGE_PREFIX}${spotId}`;
  let spent = 0;
  try {
    const prev = JSON.parse(localStorage.getItem(key) || "{}");
    spent = prev.month === month ? Number(prev.spent) || 0 : 0;
  } catch {
    spent = 0;
  }
  spent += Number(priceEur) || 0;
  localStorage.setItem(key, JSON.stringify({ month, spent }));
  return spent;
}

/**
 * Stärkster Upgrade-Trigger: Extra-Credits-Ausgaben vs. Plan-Upgrade.
 * @returns {{ body: string, targetPlanId: string, severity: 'strong' | 'critical' } | null}
 */
export function getExtraCreditsUpgradeNudge(planId, extraSpentEur = 0) {
  if (!extraSpentEur || extraSpentEur < 59) return null;
  if (planId === "pro" || planId === "pilot") {
    return null;
  }

  const targetPlanId = planId === "starter" ? "growth" : "pro";
  const currentEur = PLAN_MONTHLY_EUR[planId] ?? 0;
  const targetEur = PLAN_MONTHLY_EUR[targetPlanId];
  if (!targetEur || targetEur <= currentEur) return null;

  const targetPlan = SPOTLOOP_PRICING_PLANS.find((p) => p.id === targetPlanId);

  // Growth: zwei Fünfer-Pakete (€118) — effektiv mehr als Pro-Monatspreis
  if (planId === "growth" && extraSpentEur >= 118) {
    const proEur = PLAN_MONTHLY_EUR.pro;
    return {
      body: EXTRA_CREDITS_UPGRADE_NUDGE.growthToProAt118(currentEur, proEur, extraSpentEur),
      targetPlanId: "pro",
      severity: "critical",
      targetPlanName: "Pro",
    };
  }

  // Growth: erstes Fünfer-Paket (€59) — kanonische Upgrade-Zeile
  if (planId === "growth" && extraSpentEur >= 59) {
    const spentLabel = extraSpentEur === 59 ? "59" : String(extraSpentEur);
    const body =
      extraSpentEur === 59
        ? EXTRA_CREDITS_UPGRADE_NUDGE.growthToProAt59
        : `Du hast diesen Monat €${spentLabel} für Extra-Credits ausgegeben — für nur €90 mehr hättest du den Pro-Plan mit vier Push pro Woche das ganze Jahr.`;
    return {
      body,
      targetPlanId: "pro",
      severity: "strong",
      targetPlanName: "Pro",
    };
  }

  // Starter & andere: dynamischer Vergleich zum nächsten Plan
  const deltaEur = targetEur - currentEur;
  const pushes =
    typeof targetPlan?.campaignsPerWeek === "number" ? targetPlan.campaignsPerWeek : 4;
  const body = `Du hast diesen Monat €${extraSpentEur} für Extra-Credits ausgegeben — für nur €${deltaEur} mehr hättest du den ${targetPlan?.name}-Plan mit ${pushes} Push pro Woche im Monat.`;

  return {
    body,
    targetPlanId,
    severity: extraSpentEur >= 118 ? "critical" : "strong",
    targetPlanName: targetPlan?.name,
  };
}

export const STAMMGAST_RULES = {
  stammgast: "Top 10 % der Follower (automatisch)",
  privacy: "Nur Pseudonyme — keine Namen, E-Mails oder personenbezogene Daten",
  insight: "Oft 60–70 % des Monatsumsatzes aus wenigen treuen Gästen",
};

export const PLAN_FEATURE_BULLETS = {
  pilot: [
    "3 Monate kostenlos — voller Pro-Funktionsumfang",
    "Keine Kreditkarte · kein Risiko",
    "QR, Treue-Karte, Reward, Kampagnen, Stammgäste",
    "Wir freuen uns über ehrliches Feedback",
  ],
  starter: [
    "QR-Code (ausdrucken & aufstellen)",
    "Treue-Karte & Reward konfigurieren",
    "Tägliche Übersicht: Check-ins, Follower, Wiederkehr",
    "Keine Kampagnen — Upgrade auf Growth für Follower-Kommunikation",
  ],
  growth: [
    "4 Kampagnen pro Woche",
    "Direkt aufs Handy jedes Followers — kein Algorithmus",
    "Garantierte Zustellung an alle Follower",
    "Stammgäste Top 10 % (anonym, Schläfer-Risiko)",
    "DSGVO-Datenexport",
  ],
  pro: [
    "8 Kampagnen pro Woche",
    "VIP-Aktionen nur an Top-Stammgäste",
    "Jahresauswertung Wiederkehr",
    "Spot-Netzwerk für mehrere Standorte",
  ],
};

export const SPOTLOOP_PRICING_CONTACT = "hello@spotloop.app";
