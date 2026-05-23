/** Demo-Netzwerk: Pizza Roma mit Standorten & Gruppen */

export const SPOT_GROUP_TYPES = {
  brand: { id: "brand", label: "Hauptmarke", emoji: "🏛️", desc: "Übergeordnete Marke / Konzern" },
  location: { id: "location", label: "Standort", emoji: "📍", desc: "Einzelner Betrieb vor Ort" },
  subgroup: { id: "subgroup", label: "Untergruppe", emoji: "🗂️", desc: "Bereich, Konzept oder Team" },
  community: { id: "community", label: "Community-Gruppe", emoji: "👥", desc: "Stammgäste & treue Gäste aktivieren" },
  event: { id: "event", label: "Event-Gruppe", emoji: "🎉", desc: "Aktionen, Pop-ups, Saison-Events" },
  reward: { id: "reward", label: "Reward-Gruppe", emoji: "🎁", desc: "Gemeinsame Rewards über Standorte" },
};

const MERCHANT = "demo-merchant-pizza";

export const DEMO_SPOT_GROUPS = [
  { id: "grp-brand-roma", merchant_id: MERCHANT, parent_id: null, type: "brand", name: "Pizza Roma", slug: "pizza-roma", emoji: "🍕", description: "Steinofen-Pizza — Netzwerk Stuttgart", config: {}, is_active: true },
  { id: "grp-loc-mitte", merchant_id: MERCHANT, parent_id: "grp-brand-roma", type: "location", name: "Pizza Roma Mitte", slug: "mitte", emoji: "📍", description: "Marktplatz 8", config: {}, is_active: true },
  { id: "grp-loc-west", merchant_id: MERCHANT, parent_id: "grp-brand-roma", type: "location", name: "Pizza Roma West", slug: "west", emoji: "📍", description: "Rotebühlplatz", config: {}, is_active: true },
  { id: "grp-sub-kids", merchant_id: MERCHANT, parent_id: "grp-brand-roma", type: "subgroup", name: "Familie & Kids", slug: "kids", emoji: "👨‍👩‍👧", description: "Kindermenü & Sonntags-Pizza", config: {}, is_active: true },
  { id: "grp-comm-vip", merchant_id: MERCHANT, parent_id: "grp-brand-roma", type: "community", name: "Roma Stammgäste", slug: "stammgaeste", emoji: "👑", description: "VIP & Stempel-Champions", config: { members: 128 }, is_active: true },
  { id: "grp-event-summer", merchant_id: MERCHANT, parent_id: "grp-brand-roma", type: "event", name: "Sommer-Spezial 2026", slug: "sommer", emoji: "☀️", description: "Terrasse & 2-für-1 Di–Do", config: {}, is_active: true },
  { id: "grp-reward-snack", merchant_id: MERCHANT, parent_id: "grp-brand-roma", type: "reward", name: "Gratis Snack Club", slug: "snack-club", emoji: "🎁", description: "Stempel gilt an allen Standorten", config: { shared_reward: true }, is_active: true },
];

export const DEMO_SPOT_GROUP_MEMBERS = [
  { group_id: "grp-loc-mitte", spot_id: "spot-pizza-roma", is_primary: true },
  { group_id: "grp-comm-vip", spot_id: "spot-pizza-roma", is_primary: false },
  { group_id: "grp-event-summer", spot_id: "spot-pizza-roma", is_primary: false },
  { group_id: "grp-reward-snack", spot_id: "spot-pizza-roma", is_primary: false },
];
