/**
 * Stammgäste — Copy & Plan-Gates (anonym, DSGVO-konform).
 */

import { normalizeMerchantPlanId } from "./spotloopProductRules";

export const STAMMGAST_PRIVACY_INTRO =
  "Top-Stammgäste — anonym und DSGVO-konform. Keine Namen, keine E-Mail, keine persönlichen Daten. Nur Pseudonyme wie Gast #A72X mit Besuchen, letztem Besuch und geschätztem Umsatz.";

export const STAMMGAST_TOP_PERCENT_NOTE =
  "Automatisch die Top 10 % deiner Follower — bei 200 Followern etwa 20 Menschen, die oft 60–70 % des monatlichen Umsatzes ausmachen.";

export const STAMMGAST_PHILOSOPHY =
  "Du kennst deine Stammgäste nicht beim Namen — aber du kennst ihr Verhalten. Und Verhalten ist mächtiger als ein Name.";

export const STAMMGAST_PLAN_GROWTH = "Stammgäste-Ansicht ab Growth (€149/Monat) — inkl. DSGVO-Export.";

export const STAMMGAST_PLAN_VIP = "VIP-Aktionen nur an Top-Stammgäste — ab Pro (€249/Monat).";

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
  const id = normalizeMerchantPlanId(planId);
  return ["pilot", "growth", "pro"].includes(id);
}

export function canAccessVipStammgastActions(planId = "pilot") {
  const id = normalizeMerchantPlanId(planId);
  return ["pilot", "pro"].includes(id);
}
