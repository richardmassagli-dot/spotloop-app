/**
 * Spotloop UI-Wording — Member (Gast) vs. Gastronom.
 * Alt → Neu siehe Kommentare in GUEST / MERCHANT.
 */

/** Member / Gast-App */
export const GUEST = {
  loyaltyCard: "Treue-Karte",
  loyaltyCards: "Treue-Karten",
  activeLoyaltyCards: "Aktive Treue-Karten",
  collectVisits: "Besuche sammeln",
  cardFull: "Reward erreicht",
  visit: "Besuch",
  visits: "Besuche",
  visitCollected: "Besuch gezählt!",
  visitSaving: "Besuch wird gespeichert…",
  visitsUntilReward: (n, reward) => `Noch ${n} Besuche bis: ${reward}`,
  visitsLeft: (n) => `Noch ${n} Besuche`,
  noLoyaltyCards: "Noch keine Treue-Karten",
  myLoyaltyCard: "Meine Treue-Karte",
  yourLoyaltyCard: "Deine Treue-Karte",
  scanForCard: "Scan für deine Treue-Karte",
  addLoyaltyCard: "Treue-Karte hinzufügen",
  walletTagline: "Ein Scan. Ein Spot. Dein Besuch.",
};

/** Gastronom / Merchant-App */
export const MERCHANT = {
  setupLoyaltyCard: "Treue-Karte einrichten",
  setupReward: "Reward einrichten",
  howManyVisits: "Wie viele Besuche?",
  visitsUntilReward: "Besuche bis zum Reward",
  confirmVisit: "Besuch bestätigen",
  bonusVisit: "Bonus-Besuch bestätigen",
  designLoyaltyCard: "Treue-Karte designen",
  saveLoyaltyCard: "Treue-Karte speichern",
  loyaltyCardSaved: "Treue-Karte gespeichert ✓",
  loyaltyCardHint: "Treue-Karte",
  activeLoyaltyCards: "aktive Treue-Karten",
  campaignToCards: "Kampagne an aktive Treue-Karten gesendet",
  campaignPlaceholder: "Deine Nachricht an Gäste mit aktiver Treue-Karte…",
  noActiveCards:
    "Noch keine aktiven Treue-Karten — Gäste müssen scannen und in den letzten 30 Tagen wieder kommen.",
  onboardingCore: "QR aufstellen. Besuche sammeln. Reward einlösen — so einfach.",
  campaignGuarantee:
    "Nur Gäste mit aktiver Treue-Karte (Besuch in den letzten 30 Tagen) — keine Follower ohne Scan.",
};
