/** Premium UI demo data — sofort lauffähig ohne Backend */

export const PREMIUM_USER = {
  name: "Lisa",
  fullName: "Lisa Müller",
  greeting: "Guten Tag",
  totalPoints: 847,
  balanceLabel: "Gesamtpunkte",
};

export const HERO_IMAGES = {
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  bar: "https://images.unsplash.com/photo-1572116469694-4aef4460a0f8?w=800&q=80",
  brunch: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80",
};

export const PREMIUM_SPOTS = [
  {
    id: "spot-cafe-himmelblau",
    name: "Café Himmelblau",
    category: "Café",
    area: "Mitte",
    rating: 4.9,
    distance: "0.3 km",
    open: true,
    openLabel: "Geöffnet",
    lat: 48.7758,
    lng: 9.1829,
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #7C5CFF 100%)",
    heroImage: HERO_IMAGES.cafe,
    description: "Specialty Coffee im Herzen der Stadt. Handverlesene Bohnen, täglich frisch geröstet — ein Ort zum Verweilen.",
    maxPoints: 8,
    rewardText: "1 Kaffee gratis",
    trending: true,
  },
  {
    id: "spot-trattoria-sole",
    name: "Trattoria Sole",
    category: "Restaurant",
    area: "West",
    rating: 4.7,
    distance: "1.1 km",
    open: true,
    openLabel: "Geöffnet",
    lat: 48.778,
    lng: 9.165,
    color: "#FF6B5A",
    gradient: "linear-gradient(135deg, #FF6B5A 0%, #7C5CFF 100%)",
    heroImage: HERO_IMAGES.restaurant,
    description: "Italienische Küche mit saisonalen Zutaten aus der Region. Warm, modern, familiär.",
    maxPoints: 10,
    rewardText: "Dessert aufs Haus",
    trending: false,
  },
  {
    id: "spot-baeckerei-gold",
    name: "Bäckerei Goldkruste",
    category: "Bäckerei",
    area: "Süd",
    rating: 4.8,
    distance: "0.8 km",
    open: false,
    openLabel: "Schließt 18:00",
    lat: 48.768,
    lng: 9.19,
    color: "#42B8A6",
    gradient: "linear-gradient(135deg, #42B8A6 0%, #3B82F6 100%)",
    heroImage: HERO_IMAGES.bakery,
    description: "Handwerkliche Backwaren seit 1924. Sauerteig, Croissants und saisonale Tartes.",
    maxPoints: 6,
    rewardText: "Croissant gratis",
    trending: true,
  },
  {
    id: "spot-bar-nebula",
    name: "Bar Nebula",
    category: "Bar",
    area: "Nord",
    rating: 4.6,
    distance: "1.4 km",
    open: true,
    openLabel: "Geöffnet",
    lat: 48.79,
    lng: 9.2,
    color: "#7C5CFF",
    gradient: "linear-gradient(135deg, #7C5CFF 0%, #0B1F3A 100%)",
    heroImage: HERO_IMAGES.bar,
    description: "Cocktails, Wein und kleine Gerichte in entspannter Atmosphäre.",
    maxPoints: 8,
    rewardText: "Aperitif gratis",
    trending: false,
  },
];

export const INITIAL_WALLET = [
  { spotId: "spot-cafe-himmelblau", points: 6, maxPoints: 8 },
  { spotId: "spot-trattoria-sole", points: 3, maxPoints: 10 },
  { spotId: "spot-baeckerei-gold", points: 2, maxPoints: 6 },
];

export const PREMIUM_BENEFITS = [
  { id: "b1", title: "Doppelte Punkte", subtitle: "Café Himmelblau · bis 16 Uhr", icon: "zap", color: "#7C5CFF" },
  { id: "b2", title: "Gratis Dessert", subtitle: "Trattoria Sole · ab 8 Stempeln", icon: "gift", color: "#FF6B5A" },
  { id: "b3", title: "Neuer Spot", subtitle: "Bar Nebula · +1 Willkommenspunkt", icon: "sparkles", color: "#42B8A6" },
];

export const PREMIUM_REWARD_HISTORY = [
  { id: "r1", spotId: "spot-cafe-himmelblau", title: "Kaffee gratis", date: "12. Mai 2026", pointsUsed: 8 },
  { id: "r2", spotId: "spot-baeckerei-gold", title: "Croissant gratis", date: "28. Apr. 2026", pointsUsed: 6 },
  { id: "r3", spotId: "spot-trattoria-sole", title: "Dessert aufs Haus", date: "3. Apr. 2026", pointsUsed: 10 },
];

export const PREMIUM_FEED = [
  { id: "f1", spotId: "spot-cafe-himmelblau", type: "action", text: "Happy Hour: Doppelte Punkte bis 16 Uhr", time: "Heute" },
  { id: "f2", spotId: "spot-bar-nebula", type: "new", text: "Neuer Spot in deiner Nähe — Willkommenspunkt warten", time: "Gestern" },
  { id: "f3", spotId: "spot-trattoria-sole", type: "reward", text: "Noch 2 Stempel bis zu deinem Dessert-Reward", time: "Mo" },
];

export function spotById(id) {
  return PREMIUM_SPOTS.find((s) => s.id === id);
}

export function walletCardView(card) {
  const spot = spotById(card.spotId);
  if (!spot) return null;
  return {
    ...card,
    spot,
    nextReward: spot.rewardText,
    progress: card.points / card.maxPoints,
    rewardReady: card.points >= card.maxPoints,
  };
}
