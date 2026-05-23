/**
 * Gastro-CRM — automatische Gäste-Segmente.
 */

export const SPOTLOOP_CRM_SEGMENTS = [
  {
    id: "stammgaeste",
    name: "Stammgäste",
    definition: "3+ Besuche/Monat",
    action: "VIP-Reward senden",
    revenueShare: "~66%",
    color: "#059669",
  },
  {
    id: "aktiv",
    name: "Aktive Gäste",
    definition: "1–2 Besuche/Monat",
    action: "Kampagne senden",
    revenueShare: "~30%",
    color: "#1B4FD8",
  },
  {
    id: "schlaefer",
    name: "Schläfer",
    definition: "21+ Tage inaktiv",
    action: "Reaktivieren",
    revenueShare: "Potenzial",
    color: "#94A3B8",
  },
  {
    id: "neu",
    name: "Neue Gäste",
    definition: "Erster Besuch",
    action: "Willkommen senden",
    revenueShare: "Potenzial",
    color: "#0EA5E9",
  },
];

export const SPOTLOOP_MARKET_TIERS = [
  {
    id: "starter",
    name: "Starter",
    priceRange: "€49/mo",
    target: "Einzelspot — Kernfunktionen",
    features: ["QR-Code", "Treue-Karte & Reward", "Tägliche Übersicht"],
  },
  {
    id: "growth",
    name: "Growth",
    priceRange: "€149/mo",
    target: "Spots mit aktiver Follower-Kommunikation",
    features: ["4 Kampagnen/Woche", "Stammgäste-Liste", "DSGVO-Export"],
  },
  {
    id: "pro",
    name: "Pro",
    priceRange: "€249/mo",
    target: "Ambitionierte Spots & kleine Ketten",
    features: ["8 Kampagnen/Woche", "VIP-Aktionen", "Jahresauswertung", "Spot-Netzwerk"],
  },
];
