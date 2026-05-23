/** Stuttgart fallback when geolocation unavailable */
export const DEFAULT_MAP_CENTER = { lat: 48.7758, lng: 9.1829 };

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in km */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(km) {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 0.15) return "in der Nähe";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/** Sort spots by distance from origin; attaches `_distanceKm` */
export function sortSpotsByDistance(spots, origin = DEFAULT_MAP_CENTER) {
  if (!origin?.lat || !origin?.lng) return spots.map((s) => ({ ...s, _distanceKm: null }));
  return [...spots]
    .map((s) => {
      if (s.lat == null || s.lng == null) return { ...s, _distanceKm: null };
      return { ...s, _distanceKm: distanceKm(origin.lat, origin.lng, s.lat, s.lng) };
    })
    .sort((a, b) => {
      if (a._distanceKm == null && b._distanceKm == null) return 0;
      if (a._distanceKm == null) return 1;
      if (b._distanceKm == null) return -1;
      return a._distanceKm - b._distanceKm;
    });
}

/** Request user position once; falls back to Stuttgart */
export function resolveUserPosition() {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(DEFAULT_MAP_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(DEFAULT_MAP_CENTER),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
    );
  });
}
