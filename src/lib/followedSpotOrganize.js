/**
 * Follower: gefolgte Spots sortieren & nach Küche/Kategorie filtern.
 */
import { categoryLabelOnly } from "./spotDisplay";

export const FOLLOWER_SORT_MODES = [
  { id: "activity", label: "Aktivität" },
  { id: "name", label: "A–Z" },
  { id: "category", label: "Kategorie" },
];

/** Gastronomie-Kategorien für Filter & Zuordnung */
export const FOLLOWER_CATEGORY_BUCKETS = [
  { id: "all", label: "Alle", emoji: "✨" },
  { id: "cafe", label: "Café", emoji: "☕", keywords: ["café", "cafe", "coffee", "kaffee", "teehaus", "tee"] },
  { id: "pizza", label: "Pizza", emoji: "🍕", keywords: ["pizza", "pizzeria"] },
  { id: "italian", label: "Italienisch", emoji: "🇮🇹", keywords: ["italien", "italian", "pasta", "trattoria", "gelato", "eisdiele", "eis"] },
  { id: "german", label: "Deutsch", emoji: "🥨", keywords: ["deutsch", "bayer", "schwäb", "brauhaus", "wirtshaus", "schnitzel"] },
  { id: "sushi", label: "Sushi", emoji: "🍣", keywords: ["sushi", "japan", "ramen", "asia", "asiat"] },
  { id: "bakery", label: "Bäcker", emoji: "🥐", keywords: ["bäck", "baeck", "bakery", "brezel", "konditor", "bäckerei"] },
  { id: "chinese", label: "Chinesisch", emoji: "🥡", keywords: ["chines", "china", "dim sum", "wok"] },
  { id: "bar", label: "Bar", emoji: "🍸", keywords: ["bar", "cocktail", "wein", "kneipe", "pub"] },
  { id: "restaurant", label: "Restaurant", emoji: "🍽️", keywords: ["restaurant", "gasthaus", "imbiss", "burger", "döner", "kebab"] },
  { id: "other", label: "Sonstiges", emoji: "📍", keywords: [] },
];

const STORAGE_PREFIX = "spotloop_followed_org_";

function storageKey(userId) {
  return `${STORAGE_PREFIX}${userId || "guest"}`;
}

export function loadFollowedOrganizePrefs(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { sort: "activity", categories: {} };
    const parsed = JSON.parse(raw);
    return {
      sort: FOLLOWER_SORT_MODES.some((m) => m.id === parsed.sort) ? parsed.sort : "activity",
      categories: parsed.categories && typeof parsed.categories === "object" ? parsed.categories : {},
    };
  } catch {
    return { sort: "activity", categories: {} };
  }
}

export function saveFollowedOrganizePrefs(userId, prefs) {
  try {
    const prev = loadFollowedOrganizePrefs(userId);
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify({ ...prev, ...prefs }),
    );
  } catch {
    /* ignore */
  }
}

export function setSpotCategoryOverride(userId, spotId, bucketId) {
  const prefs = loadFollowedOrganizePrefs(userId);
  const categories = { ...prefs.categories };
  if (!bucketId || bucketId === "all" || bucketId === "other") {
    delete categories[spotId];
  } else {
    categories[spotId] = bucketId;
  }
  saveFollowedOrganizePrefs(userId, { categories });
  return categories;
}

/** Spot → Kategorie-Bucket (manuell oder automatisch aus Spot-Daten). */
export function resolveSpotBucket(spot, userCategories = {}) {
  const spotId = spot?.id;
  if (spotId && userCategories[spotId]) {
    const manual = FOLLOWER_CATEGORY_BUCKETS.find((b) => b.id === userCategories[spotId]);
    if (manual) return manual;
  }

  const text = `${categoryLabelOnly(spot)} ${spot?.name || ""} ${spot?.description || ""}`.toLowerCase();

  for (const bucket of FOLLOWER_CATEGORY_BUCKETS) {
    if (bucket.id === "all" || bucket.id === "other") continue;
    if (bucket.keywords.some((kw) => text.includes(kw))) return bucket;
  }

  return FOLLOWER_CATEGORY_BUCKETS.find((b) => b.id === "other");
}

export function getBucketById(id) {
  return FOLLOWER_CATEGORY_BUCKETS.find((b) => b.id === id) || FOLLOWER_CATEGORY_BUCKETS[0];
}

/** Gefolgte Spots mit bucketId anreichern */
export function enrichFollowedSpots(followedBar, spotsById, userCategories = {}) {
  return (followedBar ?? []).map((row) => {
    const spot = spotsById[row.id] || row;
    const bucket = resolveSpotBucket({ ...spot, id: row.id }, userCategories);
    return {
      ...row,
      bucket_id: bucket.id,
      bucket_label: bucket.label,
      bucket_emoji: bucket.emoji,
    };
  });
}

export function filterFollowedByCategory(followedEnriched, categoryFilterId) {
  if (!categoryFilterId || categoryFilterId === "all") return followedEnriched;
  return followedEnriched.filter((s) => s.bucket_id === categoryFilterId);
}

export function sortFollowedSpots(followedEnriched, sortMode = "activity") {
  const list = [...followedEnriched];
  if (sortMode === "name") {
    return list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "de"));
  }
  if (sortMode === "category") {
    return list.sort((a, b) => {
      const cat = (a.bucket_label || "").localeCompare(b.bucket_label || "", "de");
      if (cat !== 0) return cat;
      return (a.name || "").localeCompare(b.name || "", "de");
    });
  }
  return list.sort((a, b) => {
    const nu = (b.new_updates || 0) - (a.new_updates || 0);
    if (nu !== 0) return nu;
    if (b.reward_available !== a.reward_available) return b.reward_available ? 1 : -1;
    return (a.name || "").localeCompare(b.name || "", "de");
  });
}

/** Für Kategorie-Sortierung: nach Bucket gruppieren */
export function groupFollowedByCategory(followedSorted) {
  const order = FOLLOWER_CATEGORY_BUCKETS.map((b) => b.id).filter((id) => id !== "all");
  const groups = new Map();
  followedSorted.forEach((spot) => {
    const id = spot.bucket_id || "other";
    if (!groups.has(id)) {
      const bucket = getBucketById(id);
      groups.set(id, { bucket, spots: [] });
    }
    groups.get(id).spots.push(spot);
  });
  return order
    .filter((id) => groups.has(id))
    .map((id) => groups.get(id));
}

/** Welche Kategorien haben mindestens einen gefolgten Spot? */
export function categoryCountsForFollowed(followedEnriched) {
  const counts = { all: followedEnriched.length };
  followedEnriched.forEach((s) => {
    const id = s.bucket_id || "other";
    counts[id] = (counts[id] || 0) + 1;
  });
  return counts;
}
