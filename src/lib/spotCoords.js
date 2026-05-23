const STUTTGART = { lat: 48.7758, lng: 9.1829 };

/** Ensure spot has map coordinates for Discover */
export function ensureSpotCoords(spot, index = 0) {
  if (!spot) return spot;
  if (spot.lat != null && spot.lng != null) return spot;
  const offset = index * 0.008;
  return {
    ...spot,
    lat: STUTTGART.lat + offset * 0.3,
    lng: STUTTGART.lng + offset * 0.5,
  };
}
