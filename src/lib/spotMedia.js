/** Cover- & Profilbilder für Spot-Seiten */

const COVER_BY_CATEGORY = {
  Café: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
  Restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  Bäckerei: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80",
  Bar: "https://images.unsplash.com/photo-1572116469694-4aef4460a0f8?w=1200&q=80",
  Eisdiele: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=80",
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80";

function firstUrl(...candidates) {
  for (const v of candidates) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function galleryImageUrl(gallery = []) {
  const item = gallery.find(
    (g) => g?.url || g?.image || g?.src || g?.cover_url
  );
  if (!item) return null;
  return firstUrl(item.url, item.image, item.src, item.cover_url);
}

export function getDefaultSpotCover(category) {
  return COVER_BY_CATEGORY[category] || DEFAULT_COVER;
}

/** Titelbild / Cover-Hintergrund */
export function getSpotCoverUrl(spot) {
  if (!spot) return DEFAULT_COVER;
  const cfg = spot.page_config || {};
  return (
    firstUrl(
      spot.cover_image,
      cfg.cover_image,
      spot.hero_image,
      spot.banner_image,
      spot.images?.[0],
      galleryImageUrl(spot.gallery)
    ) || getDefaultSpotCover(spot.category)
  );
}

/** Profilbild (Logo) — optional, sonst Emoji */
export function getSpotAvatarUrl(spot) {
  if (!spot) return null;
  const cfg = spot.page_config || {};
  return firstUrl(
    spot.avatar_url,
    cfg.avatar_url,
    spot.logo_url,
    cfg.logo_url,
    spot.profile_image
  );
}
