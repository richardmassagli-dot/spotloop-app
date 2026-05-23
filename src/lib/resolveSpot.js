/** Maps demo / legacy spot ids to real spots from Supabase (by name hints). */
const SPOT_ID_HINTS = {
  "spot-cafe-himmelblau": ["himmelblau", "cafe"],
  "spot-gelato-amore": ["gelato", "amore"],
  "spot-bistro-levin": ["levin", "bistro"],
  "spot-baeckerei-morgenrot": ["morgenrot", "bäckerei", "baeckerei"],
  "spot-burger-house": ["burger"],
  "demo-brewed": ["brewed", "bliss"],
  "demo-burger": ["burger"],
  "demo-pizza": ["pizza", "roma"],
  "demo-green": ["green", "bowl"],
  "demo-mond": ["mond", "café", "cafe"],
};

/**
 * @param {string | undefined} spotId
 * @param {Array<{ id: string, name?: string }>} spots
 * @returns {string | undefined}
 */
export function resolveSpotId(spotId, spots = []) {
  if (!spotId) return spotId;
  if (spots.some((s) => s.id === spotId)) return spotId;

  const hints = SPOT_ID_HINTS[spotId];
  if (hints?.length) {
    const byHint = spots.find((s) => {
      const name = (s.name || "").toLowerCase();
      return hints.some((h) => name.includes(h.toLowerCase()));
    });
    if (byHint) return byHint.id;
  }

  const slug = spotId.replace(/^(spot-|demo-)/, "").replace(/-/g, " ");
  if (slug) {
    const bySlug = spots.find((s) => (s.name || "").toLowerCase().includes(slug));
    if (bySlug) return bySlug.id;
  }

  return spotId;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Demo-/Alias-IDs → echte Spot-UUIDs (wichtig für Follows & Kampagnen-Abfrage). */
export function normalizeFollowedSpotIds(ids, spots = []) {
  const known = new Set((spots ?? []).map((s) => s.id));
  const out = new Set();
  for (const raw of ids ?? []) {
    const id = resolveSpotId(raw, spots) || raw;
    if (known.has(id)) out.add(id);
    else if (UUID_RE.test(String(id))) out.add(id);
  }
  return [...out];
}
