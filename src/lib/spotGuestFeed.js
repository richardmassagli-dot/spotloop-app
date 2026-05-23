/**
 * Gast-sichtbarer Feed + Seiten-Meta in spots.description (ohne page_config-Migration).
 */
export const SPOTLOOP_FEED_MARKER = "\n---SPOTLOOP_UPDATES---\n";
export const SPOTLOOP_PAGE_MARKER = "\n---SPOTLOOP_PAGE---\n";

const FEED_MARKER = "---SPOTLOOP_UPDATES---";
const PAGE_MARKER = "---SPOTLOOP_PAGE---";

/** @returns {{ welcome: string, feed: object[], page: object }} */
export function parseSpotDescription(description) {
  const raw = description || "";
  const feedIdx = raw.indexOf(FEED_MARKER);
  const pageIdx = raw.indexOf(PAGE_MARKER);
  const firstMarker = Math.min(
    feedIdx >= 0 ? feedIdx : Infinity,
    pageIdx >= 0 ? pageIdx : Infinity
  );

  let welcome = firstMarker === Infinity ? raw.trim() : raw.slice(0, firstMarker).trim();
  let feed = [];
  let page = {};

  if (feedIdx >= 0) {
    const end = pageIdx > feedIdx ? pageIdx : raw.length;
    try {
      const parsed = JSON.parse(raw.slice(feedIdx + FEED_MARKER.length, end).trim());
      feed = Array.isArray(parsed) ? parsed : [];
    } catch {
      feed = [];
    }
  }

  if (pageIdx >= 0) {
    const pageEnd = feedIdx > pageIdx ? feedIdx : raw.length;
    try {
      const parsed = JSON.parse(
        raw.slice(pageIdx + PAGE_MARKER.length, pageEnd).trim()
      );
      page = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      page = {};
    }
  }

  return { welcome, feed, page };
}

export function descriptionHasSpotloopMarkers(text) {
  return /---SPOTLOOP_(UPDATES|PAGE)---/.test(text || "");
}

/** Nur lesbarer Willkommenstext — nie JSON/Marker aus der DB. */
export function getSpotWelcomeText(spot) {
  const raw = spot?.description || "";
  const { welcome } = parseSpotDescription(raw);
  const fromField = (spot?.welcome || "").trim();

  const isEncoded = (s) =>
    !s ||
    descriptionHasSpotloopMarkers(s) ||
    (/^\s*[\[{]/.test(s) && /"type"|"spot_id"|"reservation_url"/.test(s));

  if (fromField && !isEncoded(fromField)) return fromField;
  if (welcome && !isEncoded(welcome)) return welcome;
  if (!descriptionHasSpotloopMarkers(raw) && raw.trim() && !isEncoded(raw)) return raw.trim();
  return "";
}

/** @deprecated */
export function parseSpotDescriptionFeed(description) {
  const { welcome, feed } = parseSpotDescription(description);
  return { welcome, feed };
}

export function serializeSpotDescription({ welcome = "", feed = [], page = {} } = {}) {
  let out = (welcome || "").trim();
  const pageObj = page && typeof page === "object" ? page : {};
  const hasPage = Object.values(pageObj).some((v) => v != null && String(v).trim() !== "");
  if (hasPage) {
    out += `${SPOTLOOP_PAGE_MARKER}${JSON.stringify(pageObj)}`;
  }
  const items = Array.isArray(feed) ? feed : [];
  if (items.length) {
    out += `${SPOTLOOP_FEED_MARKER}${JSON.stringify(items)}`;
  }
  return out;
}

export function serializeSpotDescriptionFeed(welcome, feed) {
  return serializeSpotDescription({ welcome, feed });
}

export function feedRowToCampaignShape(row, spotId) {
  return {
    id: row.id,
    spot_id: spotId,
    type: row.type,
    message: row.message,
    spot_name: row.spot_name ?? null,
    status: row.status ?? "gesendet",
    image_url: row.image_url ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export function newFeedEntry({ id, type, message, spot_name, status, created_at, image_url }) {
  return {
    id: id ?? crypto.randomUUID?.() ?? `feed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    message,
    spot_name: spot_name ?? null,
    status: status ?? "gesendet",
    image_url: image_url ?? null,
    created_at: created_at ?? new Date().toISOString(),
  };
}

export function pageMetaFromConfig(cfg = {}) {
  return {
    tagline: cfg.tagline?.trim() || "",
    address: cfg.address?.trim() || "",
    hours: cfg.hours?.trim() || "",
    phone: cfg.phone?.trim() || "",
    website: cfg.website?.trim() || "",
    reservation_url: cfg.reservation_url?.trim() || "",
  };
}
