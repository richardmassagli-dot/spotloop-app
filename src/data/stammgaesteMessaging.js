/**
 * Stammgäste — Copy & Plan-Gates (anonym, DSGVO-konform).
 */

export const STAMMGAST_PRIVACY_INTRO =
  "Top-Stammgäste — anonym und DSGVO-konform. Keine Namen, keine E-Mail, keine persönlichen Daten. Nur Pseudonyme wie Gast #A72X mit Besuchen, letztem Besuch und geschätztem Umsatz.";

export const STAMMGAST_TOP_PERCENT_NOTE =
  "Automatisch die Top 10 % deiner Follower — bei 200 Followern etwa 20 Menschen, die oft 60–70 % des monatlichen Umsatzes ausmachen.";

export const STAMMGAST_PHILOSOPHY =
  "Du kennst deine Stammgäste nicht beim Namen — aber du kennst ihr Verhalten. Und Verhalten ist mächtiger als ein Name.";

export const STAMMGAST_PLAN_GROWTH = "Stammgäste-Ansicht ab Growth (€149/Monat) — inkl. DSGVO-Export.";

export const STAMMGAST_PLAN_VIP = "VIP-Aktionen nur an Top-Stammgäste — ab Pro (€249/Monat).";

export const STAMMGAST_PLAN_PRESTIGE =
  "Detaillierte Profile (Tischpräferenzen, Besuchsmuster, Lieblingsgerichte) — ab Prestige, immer anonym.";

export const SLEEP_RISK_LABELS = {
  at_risk: "Schläfer-Risiko",
  critical: "Wegbruch-Risiko",
};

export const SLEEP_RISK_SUGGESTIONS = {
  at_risk: "Reaktivierungs-Kampagne vorschlagen",
  critical: "Persönliche Einladung — bevor er für immer wegbleibt",
};

/** @param {string} [planId] */
export function canAccessStammgaeste(planId = "pilot") {
  return ["pilot", "growth", "pro", "prestige", "enterprise"].includes(planId);
}

export function canAccessVipStammgastActions(planId = "pilot") {
  return ["pilot", "pro", "prestige", "enterprise"].includes(planId);
}

export function hasPrestigeStammgastDetail(planId = "pilot") {
  return ["pilot", "prestige", "enterprise"].includes(planId);
}
