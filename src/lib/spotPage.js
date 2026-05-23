/**
 * Spot page customization + VIP community (localStorage + Supabase page_config).
 */
import { supabase } from "./supabase";
import { IS_LOCAL_MODE } from "./config";
import { localSpots } from "./localStore";
import {
  parseSpotDescription,
  serializeSpotDescription,
  pageMetaFromConfig,
  getSpotWelcomeText,
} from "./spotGuestFeed.js";
import { getSpotCoverUrl, getSpotAvatarUrl } from "./spotMedia.js";
import { applyStampDesignToSpot } from "./stampDesign.js";

const pageKey = (spotId) => `spotloop_page_${spotId}`;
const vipKey = (spotId) => `spotloop_vip_${spotId}`;

export const DEFAULT_PAGE_CONFIG = {
  tagline: "",
  welcome: "",
  address: "",
  hours: "",
  phone: "",
  website: "",
  reservation_url: "",
  community_message: "Willkommen in unserer Stammgast-Community — exklusive Rewards für treue Gäste.",
  menu: [],
  gallery: [],
  events: [],
  posts: [],
  vip_guests: [],
};

const readObject = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...fallback };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? { ...fallback, ...parsed }
      : { ...fallback };
  } catch {
    return { ...fallback };
  }
};

/** Arrays must not be spread into objects (was breaking VIP list). */
const readArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeObject = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const writeArray = (key, data) => localStorage.setItem(key, JSON.stringify(Array.isArray(data) ? data : []));

export function getStoredPageConfig(spotId) {
  return readObject(pageKey(spotId), DEFAULT_PAGE_CONFIG);
}

export function getStoredVipGuests(spotId) {
  return readArray(vipKey(spotId));
}

function vipFromSpotRow(spot) {
  const cfg = spot?.page_config;
  if (cfg && Array.isArray(cfg.vip_guests)) return cfg.vip_guests;
  if (Array.isArray(spot?.vip_guests)) return spot.vip_guests;
  return [];
}

/** Merge DB spot row with merchant page config. */
export function enrichSpot(spot) {
  if (!spot?.id) return spot;
  const { welcome, feed, page: pageFromDesc } = parseSpotDescription(spot.description);
  const page = getStoredPageConfig(spot.id);
  const fromDb = spot.page_config && typeof spot.page_config === "object" ? spot.page_config : {};
  const mergedPage = { ...DEFAULT_PAGE_CONFIG, ...pageFromDesc, ...fromDb, ...page };
  const localVip = getStoredVipGuests(spot.id);
  const dbVip = vipFromSpotRow(spot);
  const vipGuests = localVip.length > 0 ? localVip : dbVip.length > 0 ? dbVip : mergedPage.vip_guests || [];

  const displayWelcome = getSpotWelcomeText({
    ...spot,
    welcome: mergedPage.welcome || welcome,
    description: spot.description,
  });

  const enriched = {
    ...spot,
    description: displayWelcome,
    guest_feed: feed,
    page_config: { ...mergedPage, vip_guests: vipGuests },
    cover_image: getSpotCoverUrl({ ...spot, page_config: mergedPage }),
    avatar_url: getSpotAvatarUrl({ ...spot, page_config: mergedPage }),
    tagline: mergedPage.tagline || spot.tagline,
    welcome: displayWelcome,
    address: mergedPage.address || spot.address || "",
    hours: mergedPage.hours || spot.hours || spot.opening_hours || "",
    opening_hours: mergedPage.hours || spot.opening_hours || spot.hours || "",
    phone: mergedPage.phone || spot.phone,
    website: mergedPage.website || spot.website,
    reservation_url: mergedPage.reservation_url || spot.reservation_url || "",
    community_message: mergedPage.community_message,
    menu: mergedPage.menu?.length ? mergedPage.menu : spot.menu,
    gallery: mergedPage.gallery?.length ? mergedPage.gallery : spot.gallery,
    events: mergedPage.events?.length ? mergedPage.events : spot.events,
    posts: mergedPage.posts?.length ? mergedPage.posts : spot.posts,
    vip_guests: vipGuests,
    vip_count: vipGuests.length,
  };
  return applyStampDesignToSpot(enriched);
}

/** Load VIP list (Supabase page_config in production). */
export async function loadVipGuests(spotId) {
  if (!spotId) return [];

  if (!IS_LOCAL_MODE && supabase) {
    try {
      const { data, error } = await supabase
        .from("spots")
        .select("page_config")
        .eq("id", spotId)
        .maybeSingle();
      if (!error && data?.page_config?.vip_guests) {
        const list = Array.isArray(data.page_config.vip_guests) ? data.page_config.vip_guests : [];
        writeArray(vipKey(spotId), list);
        return list;
      }
    } catch (e) {
      console.warn("[spotPage] loadVip", e);
    }
  }

  return getStoredVipGuests(spotId);
}

export async function saveSpotPageConfig(spotId, patch) {
  const current = getStoredPageConfig(spotId);
  const next = { ...current, ...patch };
  writeObject(pageKey(spotId), next);

  if (IS_LOCAL_MODE) {
    localSpots.update(spotId, {
      description: patch.welcome ?? undefined,
      page_config: next,
      menu: next.menu,
      gallery: next.gallery,
      events: next.events,
      posts: next.posts,
      vip_guests: next.vip_guests,
    });
    return next;
  }

  if (supabase) {
    const { data: row } = await supabase
      .from("spots")
      .select("description")
      .eq("id", spotId)
      .maybeSingle();
    const { welcome: prevWelcome, feed } = parseSpotDescription(row?.description);
    const description = serializeSpotDescription({
      welcome: next.welcome ?? prevWelcome,
      feed,
      page: pageMetaFromConfig(next),
    });
    const { error } = await supabase
      .from("spots")
      .update({ description })
      .eq("id", spotId);
    if (error && !/page_config|schema cache/i.test(error.message)) {
      console.warn("[spotPage] save page", error.message);
    }
  }
  return next;
}

async function persistVipToCloud(spotId, guests) {
  const list = Array.isArray(guests) ? guests : [];
  const page = { ...getStoredPageConfig(spotId), vip_guests: list };
  writeObject(pageKey(spotId), page);

  if (IS_LOCAL_MODE) {
    localSpots.update(spotId, { vip_guests: list, page_config: page });
    return list;
  }

  if (supabase) {
    const { error } = await supabase
      .from("spots")
      .update({ page_config: page })
      .eq("id", spotId);
    if (error) {
      if (/page_config|schema cache/i.test(error.message)) {
        console.warn("[spotPage] page_config column missing — run migration 009");
      } else {
        throw new Error(error.message);
      }
    }
  }
  return list;
}

export async function saveVipGuests(spotId, guests) {
  const list = Array.isArray(guests) ? guests : [];
  writeArray(vipKey(spotId), list);
  return persistVipToCloud(spotId, list);
}

export async function addVipGuest(spotId, guest) {
  const list = getStoredVipGuests(spotId);
  const entry = {
    id: `vip-${Date.now()}`,
    user_id: guest.user_id || null,
    name: guest.name?.trim() || "Gast",
    email: guest.email?.trim() || "",
    tier: guest.tier || "stammgast",
    visits: guest.visits ?? 0,
    vip_reward: guest.vip_reward || "Stammgast-Bonus",
    bonus_points: guest.bonus_points ?? 2,
    note: guest.note || "",
    added_at: new Date().toISOString(),
  };
  list.unshift(entry);
  return saveVipGuests(spotId, list);
}

export async function removeVipGuest(spotId, guestId) {
  const list = getStoredVipGuests(spotId).filter((g) => g.id !== guestId);
  return saveVipGuests(spotId, list);
}

export async function updateVipGuest(spotId, guestId, patch) {
  const list = getStoredVipGuests(spotId).map((g) =>
    g.id === guestId ? { ...g, ...patch } : g
  );
  return saveVipGuests(spotId, list);
}
