// Data layer — routes to Supabase when configured, localStorage otherwise.
import { supabase } from "./supabase";
import { localSpots, localStamps, localFollows, localCheckins, localCampaigns } from "./localStore";
import { IS_LOCAL_MODE } from "./config";
import { VERIFICATION_STATUS } from "./merchantVerification";
import { enrichSpot } from "./spotPage";
import { ensureSpotCoords } from "./spotCoords";
import { filterCampaignAudience, getLocalCampaignGuests } from "./campaignAudiences.js";
import { buildCouponViewModel, isCampaignCouponItem } from "./campaignCoupon.js";
import {
  campaignVisibleToGuest,
  stripStammgastMeta,
  isStammgastCampaign,
  wrapStammgastMessage,
  buildStammgastCouponMessage,
  STAMMGAST_COUPON_INTRO,
} from "./stammgaeste.js";
import { buildPrivacySafeRoster, getMemberPseudonym } from "./privacy.js";
import { applyGlobalDailyNotificationCap } from "./memberProtection.js";
import { categoryLabelOnly } from "./spotDisplay.js";
import { MY_SPOTS_DEFAULT_FOLLOWS } from "../data/mySpotsDemo.js";
import { normalizeFollowedSpotIds } from "./resolveSpot.js";
import {
  parseSpotDescription,
  serializeSpotDescription,
  feedRowToCampaignShape,
  newFeedEntry,
} from "./spotGuestFeed.js";

const LOCAL = IS_LOCAL_MODE;

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase ist nicht konfiguriert. Bitte .env.local prüfen.");
  }
  return supabase;
};

const isNoRowsError = (error, status) =>
  status === 406 || error?.code === "PGRST116" || /no rows/i.test(error?.message || "");

/** Lesbare Fehler für UI (RLS, falsches Schema, Netzwerk). */
export function formatDbError(error) {
  const msg = error?.message || String(error);
  const code = error?.code || "";
  if (code === "42501" || /row-level security/i.test(msg)) {
    if (/check-in|checkin|nicht für check-in|nicht verfügbar/i.test(msg)) {
      return msg;
    }
    if (/stamps|checkins/i.test(msg)) {
      return "Check-in blockiert: Spot ist inaktiv oder abgelehnt. Händler muss Spot freischalten lassen (Admin) oder Migration 019 in Supabase ausführen.";
    }
    return "Keine Berechtigung — Spot gehört dir? In Supabase Migration 012 ausführen oder Spot-Freischaltung prüfen.";
  }
  if (/['\"]lat['\"].*schema cache|column.*lat.*does not exist/i.test(msg)) {
    return "Datenbank fehlt Spalten lat/lng: In Supabase SQL Editor Migration 005 ausführen, dann Seite neu laden.";
  }
  if (/verification_note|verification_status/i.test(msg) && /schema cache|does not exist/i.test(msg)) {
    return "Datenbank fehlt Verifizierungs-Spalten: In Supabase SQL Editor Migration 001 ausführen (siehe Chat), dann Seite neu laden.";
  }
  if (/verification_status|merchant_id|column.*does not exist/i.test(msg)) {
    return "Datenbank-Schema passt nicht: In Supabase `supabase/schema.sql` und Migrationen 001–005 ausführen (nicht nur das alte Setup aus Desktop/spotloop).";
  }
  if (/duplicate key|unique constraint/i.test(msg)) {
    return "Dieser Spot existiert bereits. Bitte „Status aktualisieren“ oder Support kontaktieren.";
  }
  return msg;
}

function defaultCoords(area = "", address = "") {
  const text = `${area} ${address}`.toLowerCase();
  if (text.includes("stuttgart") || /\b70\d{3}\b/.test(text)) {
    return { lat: 48.7758, lng: 9.1829 };
  }
  return { lat: null, lng: null };
}

async function q(builder, { allowMissing = false } = {}) {
  const { data, error, status, count } = await builder;
  if (error) {
    if (allowMissing && isNoRowsError(error, status)) return { data: null, count };
    throw error;
  }
  return { data, count };
}

function mapSpotRow(row) {
  if (!row) return null;
  const status = row.verification_status ?? VERIFICATION_STATUS.VERIFIED;
  return enrichSpot({
    ...row,
    verification_status: status,
    verified: status === VERIFICATION_STATUS.VERIFIED,
    isActive: row.is_active ?? row.isActive ?? true,
  });
}

function toSpotPayload(merchantId, data) {
  const {
    isActive,
    is_active,
    verification_status,
    verification_note,
    verified_at,
    verified,
    lat,
    lng,
    area,
    address,
    ...rest
  } = data;
  const coords = lat != null && lng != null ? { lat, lng } : defaultCoords(area, address);
  return {
    ...rest,
    id: merchantId,
    merchant_id: merchantId,
    area: area ?? rest.area ?? "",
    address: address ?? rest.address ?? "",
    lat: coords.lat,
    lng: coords.lng,
    is_active: is_active ?? isActive ?? true,
    verification_status: LOCAL
      ? VERIFICATION_STATUS.VERIFIED
      : (verification_status ?? VERIFICATION_STATUS.PENDING),
    verification_note: verification_note ?? null,
    verified_at: LOCAL ? new Date().toISOString() : (verified_at ?? null),
    total_checkins: 0,
    followers: 0,
  };
}

// ── SPOTS ─────────────────────────────────────────────────────────
export const createSpot = async (merchantId, data) => {
  const payload = toSpotPayload(merchantId, data);
  if (LOCAL) {
    localSpots.save(merchantId, payload);
    return;
  }
  const db = ensureSupabase();
  const { error } = await db.from("spots").upsert(payload);
  if (error) throw error;
};

function sanitizeSpotPatch(patch = {}) {
  const out = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export const updateSpot = async (spotId, patch) => {
  const sanitized = sanitizeSpotPatch(patch);
  if (!spotId) throw new Error("Kein Spot ausgewählt.");

  if (LOCAL) {
    let row = localSpots.get(spotId);
    if (!row) {
      localSpots.save(spotId, {
        name: "Mein Spot",
        reward_text: sanitized.reward_text || "Gratis Kaffee",
        max_points: sanitized.max_points ?? 10,
        emoji: sanitized.emoji || "☕",
        bg_color: sanitized.bg_color || "#1B4FD8",
        ...sanitized,
      });
    } else {
      localSpots.update(spotId, sanitized);
    }
    const updated = localSpots.get(spotId);
    if (!updated) throw new Error("Spot konnte lokal nicht gespeichert werden.");
    return mapSpotRow(updated);
  }

  const db = ensureSupabase();
  const { data, error } = await db.from("spots").update(sanitized).eq("id", spotId).select("*");
  if (error) throw error;
  if (!data?.length) {
    throw new Error("Spot nicht gefunden — bitte Setup abschließen oder als Merchant neu anmelden.");
  }
  return mapSpotRow(data[0]);
};

export const getSpot = async (spotId) => {
  if (LOCAL) return mapSpotRow(localSpots.get(spotId));
  const db = ensureSupabase();
  const { data } = await q(db.from("spots").select("*").eq("id", spotId).single(), { allowMissing: true });
  return mapSpotRow(data);
};

/** Check-in: Spot auch bei Status „pending“ (RPC get_spot_checkin, sonst normales getSpot). */
export const getSpotForCheckin = async (spotId) => {
  if (LOCAL) return getSpot(spotId);
  const db = ensureSupabase();
  const { data: rpcRow, error: rpcErr } = await db.rpc("get_spot_checkin", { p_spot_id: spotId });
  if (!rpcErr && rpcRow) {
    const row = typeof rpcRow === "string" ? JSON.parse(rpcRow) : rpcRow;
    return mapSpotRow(row);
  }
  return getSpot(spotId);
};

export const getAllSpots = async () => {
  if (LOCAL) {
    return localSpots.getAll()
      .map(mapSpotRow)
      .filter(s => s.verification_status === VERIFICATION_STATUS.VERIFIED)
      .map((s, i) => ensureSpotCoords(s, i));
  }
  const db = ensureSupabase();
  const { data } = await q(db.from("spots").select("*").order("created_at", { ascending: false }));
  return (data ?? [])
    .map(mapSpotRow)
    .filter((s) => s && s.verification_status !== VERIFICATION_STATUS.REJECTED)
    .map((s, i) => ensureSpotCoords(s, i));
};

export const subscribeToSpot = (spotId, cb) => {
  if (LOCAL) return localSpots.subscribe(spotId, cb);
  if (!supabase) {
    cb(null);
    return () => {};
  }
  const db = ensureSupabase();
  // Initial fetch
  q(db.from("spots").select("*").eq("id", spotId).single(), { allowMissing: true })
    .then(({ data }) => cb(mapSpotRow(data)))
    .catch(() => cb(null));
  // Realtime
  const channel = db
    .channel(`spot-${spotId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "spots", filter: `id=eq.${spotId}` },
      ({ new: row }) => cb(mapSpotRow(row))
    )
    .subscribe();
  return () => db.removeChannel(channel);
};

// ── STAMPS (loyalty cards) ────────────────────────────────────────
// Stamp shape: { id, user_id, spot_id, points, max_points, reward_text, reward_ready }
export const getOrCreateStamp = async (userId, spotId) => {
  if (LOCAL) return localStamps.getOrCreate(userId, spotId);
  const db = ensureSupabase();

  const { data: existing } = await q(
    db.from("stamps")
      .select("*, spots(max_points, reward_text)")
      .eq("user_id", userId).eq("spot_id", spotId).single(),
    { allowMissing: true }
  );

  if (existing) {
    const maxPts = existing.spots?.max_points ?? existing.max_points ?? 10;
    return { ...existing, max_points: maxPts, reward_text: existing.spots?.reward_text ?? existing.reward_text, reward_ready: existing.points >= maxPts };
  }

  const { data: spot } = await q(
    db.from("spots").select("max_points, reward_text, verification_status, is_active").eq("id", spotId).single(),
    { allowMissing: true }
  );
  const maxPts = spot?.max_points ?? 10;
  // Kein Insert beim Laden — erst „Punkt sichern“ (guest_checkin / addStamp)
  return {
    user_id: userId,
    spot_id: spotId,
    points: 0,
    max_points: maxPts,
    reward_text: spot?.reward_text,
    reward_ready: false,
  };
};

// Follows the spec's addStamp logic exactly
export const addStamp = async (userId, spotId) => {
  if (LOCAL) return localStamps.addPoint(userId, spotId);
  const db = ensureSupabase();

  const { data: rpcData, error: rpcErr } = await db.rpc("guest_checkin", { p_spot_id: spotId });
  if (!rpcErr && rpcData) {
    const row = typeof rpcData === "string" ? JSON.parse(rpcData) : rpcData;
    if (row?.spot_id) return row;
  }
  if (
    rpcErr &&
    (rpcErr.code === "PGRST202" || /Could not find the function/i.test(rpcErr.message || ""))
  ) {
    /* Fallback unten — Migration 019 optional */
  } else if (rpcErr) {
    throw rpcErr;
  }

  // Fallback wenn Migration 019 noch nicht ausgeführt wurde
  const { data: spot } = await q(
    db.from("spots").select("max_points, reward_text").eq("id", spotId).single(),
    { allowMissing: true }
  );
  if (!spot) {
    throw new Error("Spot nicht gefunden. QR-Code vom richtigen Händler-Dashboard scannen.");
  }
  const maxPts = spot.max_points ?? 10;

  const { data: existing } = await q(
    db.from("stamps").select("*").eq("user_id", userId).eq("spot_id", spotId).single(),
    { allowMissing: true }
  );

  let stamp;
  if (!existing) {
    const { data } = await q(
      db.from("stamps").insert({ user_id: userId, spot_id: spotId, points: 1 }).select().single()
    );
    stamp = data;
  } else {
    const newPoints = Math.min(existing.points + 1, maxPts);
    const { data } = await q(
      db.from("stamps")
        .update({ points: newPoints, updated_at: new Date().toISOString() })
        .eq("id", existing.id).select().single()
    );
    stamp = data;
  }

  if (!stamp) throw new Error("Stempel konnte nicht gespeichert werden.");

  await db.rpc("increment_checkins", { spot_id: spotId }).catch(() => {});
  await db.from("checkins").insert({ user_id: userId, spot_id: spotId }).catch(() => {});

  const pts = stamp.points;
  return { ...stamp, max_points: maxPts, reward_text: spot.reward_text, reward_ready: pts >= maxPts };
};

/** Bonus-Stempel für Stammgast (+1 Punkt, ohne Check-in). */
/** Exklusiven Coupon nur an Stammgast-IDs (Top 10 %), nicht an alle Follower. */
export const sendStammgastCoupon = async (
  spotId,
  { userIds, spotName, intro, offer, validity } = {},
) => {
  if (!userIds?.length) throw new Error("Keine Stammgäste ausgewählt.");
  const publicMessage = buildStammgastCouponMessage({
    intro: intro ?? STAMMGAST_COUPON_INTRO,
    offer,
    validity,
  });
  await createCampaign(spotId, {
    type: "stammgast",
    audience: "stammgast",
    message: wrapStammgastMessage(userIds, publicMessage),
    spot_name: spotName,
    status: "gesendet",
    recipient_count: userIds.length,
  });
};

export const grantStammgastBonusStamp = async (userId, spotId) => {
  if (!userId || !spotId) throw new Error("Gast oder Spot fehlt.");
  if (LOCAL) return localStamps.addPoint(userId, spotId);

  const db = ensureSupabase();
  const { data: spot } = await q(
    db.from("spots").select("max_points, reward_text").eq("id", spotId).single(),
    { allowMissing: true },
  );
  if (!spot) throw new Error("Spot nicht gefunden.");
  const maxPts = spot.max_points ?? 10;

  const { data: existing } = await q(
    db.from("stamps").select("*").eq("user_id", userId).eq("spot_id", spotId).single(),
    { allowMissing: true },
  );

  let stamp;
  if (!existing) {
    const { data } = await q(
      db.from("stamps").insert({ user_id: userId, spot_id: spotId, points: 1 }).select().single(),
    );
    stamp = data;
  } else {
    const newPoints = Math.min((existing.points ?? 0) + 1, maxPts);
    const { data } = await q(
      db
        .from("stamps")
        .update({ points: newPoints, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single(),
    );
    stamp = data;
  }
  if (!stamp) throw new Error("Bonus-Besuch konnte nicht bestätigt werden.");
  const pts = stamp.points ?? 0;
  return {
    ...stamp,
    max_points: maxPts,
    reward_text: spot.reward_text,
    reward_ready: pts >= maxPts,
  };
};

import { incrementRedeemedCount } from "./guestStats.js";

export const redeemStamp = async (userId, spotId) => {
  if (LOCAL) { localStamps.redeem(userId, spotId); incrementRedeemedCount(userId); return; }
  const db = ensureSupabase();
  await q(
    db.from("stamps").update({ points: 0, updated_at: new Date().toISOString() })
      .eq("user_id", userId).eq("spot_id", spotId)
  );
  incrementRedeemedCount(userId);
};

export const getUserStamps = async (userId) => {
  if (LOCAL) return localStamps.forUser(userId);
  const db = ensureSupabase();
  const { data } = await q(
    db.from("stamps")
      .select("*, spot:spots(id, name, emoji, category, area, max_points, reward_text, bg_color, current_action)")
      .eq("user_id", userId)
  );
  return (data ?? []).map(s => ({
    ...s,
    max_points:  s.spot?.max_points  ?? s.max_points ?? 10,
    reward_text: s.spot?.reward_text ?? s.reward_text,
    reward_ready: s.points >= (s.spot?.max_points ?? s.max_points ?? 10),
  }));
};

// ── FOLLOWS ──────────────────────────────────────────────────────
/** Echte Anzahl aus `follows` (Quelle der Wahrheit fürs Dashboard). */
export const countSpotFollowers = async (spotId) => {
  if (LOCAL) {
    const f = JSON.parse(localStorage.getItem("local_follows") || "{}");
    return Object.keys(f).filter((k) => k.endsWith(`_${spotId}`)).length;
  }
  const db = ensureSupabase();
  const { count, error } = await db
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("spot_id", spotId);
  if (error) throw error;
  return count ?? 0;
};

const syncSpotFollowerCount = async (spotId) => {
  const db = ensureSupabase();
  const total = await countSpotFollowers(spotId);
  await db.from("spots").update({ followers: total }).eq("id", spotId).catch(() => {});
};

export const followSpot = async (userId, spotId) => {
  if (LOCAL) { localFollows.follow(userId, spotId); return; }
  const db = ensureSupabase();
  const { data: existing } = await q(
    db.from("follows").select("id").eq("user_id", userId).eq("spot_id", spotId).maybeSingle()
  );
  if (!existing) {
    await q(db.from("follows").insert({ user_id: userId, spot_id: spotId }));
    await syncSpotFollowerCount(spotId);
  }
};

export const unfollowSpot = async (userId, spotId) => {
  if (LOCAL) { localFollows.unfollow(userId, spotId); return; }
  const db = ensureSupabase();
  const { data: deleted } = await q(
    db.from("follows").delete().eq("user_id", userId).eq("spot_id", spotId).select("id")
  );
  if (deleted?.length) {
    await syncSpotFollowerCount(spotId);
  }
};

export const isFollowing = async (userId, spotId) => {
  if (LOCAL) return localFollows.isFollowing(userId, spotId);
  const db = ensureSupabase();
  const { data } = await q(
    db.from("follows").select("id").eq("user_id", userId).eq("spot_id", spotId).single(),
    { allowMissing: true }
  );
  return !!data;
};

export const getUserFollowedSpotIds = async (userId) => {
  if (LOCAL) {
    try {
      const raw = JSON.parse(localStorage.getItem("spotloop_followed") || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }
  const db = ensureSupabase();
  const { data } = await q(db.from("follows").select("spot_id").eq("user_id", userId));
  return (data ?? []).map((r) => r.spot_id);
};

// ── MERCHANT DASHBOARD ────────────────────────────────────────────
export const getMerchantStats = async (spotId) => {
  if (LOCAL) return localCheckins.stats(spotId);
  const db = ensureSupabase();
  const { data: spot } = await q(
    db.from("spots").select("total_checkins, followers").eq("id", spotId).single(),
    { allowMissing: true }
  );
  const { count: redemptions } = await q(
    db.from("stamps")
      .select("*", { count: "exact", head: true })
      .eq("spot_id", spotId)
      .eq("points", 0)
  );
  return {
    total_checkins: spot?.total_checkins ?? 0,
    followers: spot?.followers ?? 0,
    redemptions: redemptions ?? 0,
  };
};

export const subscribeMerchantCheckins = (spotId, cb) => {
  if (LOCAL) return localCheckins.subscribe(spotId, cb);
  const db = ensureSupabase();
  const load = () =>
    q(
      db.from("stamps")
        .select("*, spot:spots(name)")
        .eq("spot_id", spotId)
        .order("updated_at", { ascending: false })
        .limit(10)
    )
      .then(({ data }) => cb(data ?? []))
      .catch(() => cb([]));
  load();
  const channel = db
    .channel(`checkins-${spotId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "stamps", filter: `spot_id=eq.${spotId}` },
      () => load()
    )
    .subscribe();
  return () => db.removeChannel(channel);
};

// ── CAMPAIGNS ─────────────────────────────────────────────────────
export const getCampaignAudience = async (spotId, type, opts = {}) => {
  const { inactiveDays = 30, birthdayScope = "today" } = opts;
  if (LOCAL) {
    const guests = getLocalCampaignGuests(spotId);
    return filterCampaignAudience(guests, type, { inactiveDays, birthdayScope, spotId });
  }
  const db = ensureSupabase();
  const { data, error } = await db.rpc("merchant_campaign_audience", {
    p_spot_id: spotId,
    p_type: type,
    p_inactive_days: inactiveDays,
    p_birthday_scope: birthdayScope,
  });
  if (error) {
    const { data: stamps } = await q(
      db.from("stamps").select("user_id, updated_at").eq("spot_id", spotId)
    );
    const cutoff = Date.now() - inactiveDays * 24 * 60 * 60 * 1000;
    const stampRows = stamps ?? [];
    const inactive = stampRows.filter((s) => new Date(s.updated_at).getTime() < cutoff);
    const active = stampRows.filter((s) => new Date(s.updated_at).getTime() >= cutoff);
    const pool = type === "reactivation" ? inactive : type === "push" ? active : stampRows;
    const rawGuests = pool.slice(0, 8).map((s) => ({
      user_id: s.user_id,
      name: getMemberPseudonym(s.user_id, spotId),
      last_visit: s.updated_at,
      days_inactive: Math.floor((Date.now() - new Date(s.updated_at).getTime()) / 86400000),
    }));
    return {
      count:
        type === "reactivation" ? inactive.length : type === "push" ? active.length : stampRows.length,
      guests: buildPrivacySafeRoster(rawGuests, spotId),
      inactiveDays,
      birthdayScope,
      note: type === "birthday" ? "Migration 011 für Geburtstags-Zielgruppen ausführen." : null,
    };
  }
  return {
    count: data?.count ?? 0,
    guests: buildPrivacySafeRoster(data?.guests ?? [], spotId),
    inactiveDays: data?.inactive_days ?? inactiveDays,
    birthdayScope: data?.birthday_scope ?? birthdayScope,
  };
};

/** Gast-sichtbarer Feed in spots.description (funktioniert ohne Migration 013/014). */
async function appendGuestFeedOnSpot(spotId, data) {
  const db = ensureSupabase();
  const { data: row, error: readErr } = await q(
    db.from("spots").select("description").eq("id", spotId).single(),
    { allowMissing: true }
  );
  if (readErr) return;
  const { welcome, feed, page } = parseSpotDescription(row?.description);
  const entry = newFeedEntry(data);
  const nextFeed = [entry, ...feed.filter((f) => f.id !== entry.id)].slice(0, 60);
  const description = serializeSpotDescription({ welcome, feed: nextFeed, page });
  await db.from("spots").update({ description }).eq("id", spotId);
}

/** Händler-Kampagnen → description-Feed (einmalig nachladen). */
export async function syncCampaignsToSpotGuestFeed(spotId) {
  if (LOCAL) return;
  const db = ensureSupabase();
  const rows = await getMerchantCampaigns(spotId);
  if (!rows?.length) return;
  const { data: spotRow } = await q(
    db.from("spots").select("description").eq("id", spotId).single(),
    { allowMissing: true }
  );
  const { welcome, page } = parseSpotDescription(spotRow?.description);
  const feed = rows.map((r) =>
    newFeedEntry({
      id: r.id,
      type: r.type,
      message: r.message,
      spot_name: r.spot_name,
      status: r.status,
      created_at: r.created_at,
      image_url: r.image_url ?? null,
    })
  );
  feed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const description = serializeSpotDescription({ welcome, feed: feed.slice(0, 60), page });
  await db.from("spots").update({ description }).eq("id", spotId);
}

async function loadGuestFeedFromSpots(spotIds, spotsById = {}) {
  if (!spotIds?.length) return [];
  const db = ensureSupabase();
  const { data: rows } = await q(
    db.from("spots").select("id, name, emoji, bg_color, category, description").in("id", spotIds)
  );
  const items = [];
  for (const row of rows ?? []) {
    const spot = spotsById[row.id] || mapSpotRow(row);
    const { feed } = parseSpotDescription(row.description);
    for (const f of feed) {
      items.push(mapCampaignRowToFeedItem(feedRowToCampaignShape(f, row.id), spot));
    }
  }
  return items.sort(
    (a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)
  );
}

export const createCampaign = async (spotId, data) => {
  if (LOCAL) {
    localCampaigns.create(spotId, { ...data, status: data.status ?? "gesendet" });
    return;
  }
  const db = ensureSupabase();
  const base = {
    spot_id: spotId,
    type: data.type,
    message: data.message,
    spot_name: data.spot_name ?? null,
    status: data.status ?? "gesendet",
  };
  const extended = {
    audience: data.audience ?? null,
    inactive_days: data.inactive_days ?? null,
    recipient_count: data.recipient_count ?? 0,
    birthday_scope: data.birthday_scope ?? null,
    image_url: data.image_url ?? null,
  };
  const payload = { ...base, ...extended };
  let { error } = await db.from("campaigns").insert(payload);
  if (error && /column|schema cache/i.test(error.message || "")) {
    ({ error } = await db.from("campaigns").insert({ ...base, image_url: data.image_url ?? null }));
    if (error) ({ error } = await db.from("campaigns").insert(base));
  }
  if (error) throw error;
  try {
    await appendGuestFeedOnSpot(spotId, payload);
  } catch (e) {
    console.warn("[createCampaign] guest feed on spot", e);
  }
};

const POST_TYPE_TO_UPDATE = {
  special: "action",
  new_item: "new_dish",
  event: "event",
  reward: "reward",
  behind: "post",
  milestone: "post",
};

const CAMPAIGN_TYPE_TO_UPDATE = {
  push: "action",
  reactivation: "action",
  birthday: "reward",
  segment: "action",
  stammgast: "action",
  feed: "post",
  notification: "action",
};

const NOTIFICATION_TYPE_EMOJI = {
  info: "🔔",
  reward: "🎁",
  action: "⚡",
  event: "📅",
};

function formatRelativeTime(iso) {
  if (!iso) return "kürzlich";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return "vor wenigen Minuten";
  if (h < 24) return `vor ${h} Stunde${h === 1 ? "" : "n"}`;
  const d = Math.floor(h / 24);
  if (d === 1) return "gestern";
  return `vor ${d} Tagen`;
}

export function isPostCampaignType(type) {
  return typeof type === "string" && type.startsWith("post_");
}

/** Kampagnen → My-Spots-Feed-Eintrag (Posts ausgeschlossen) */
export function mapCampaignRowToFeedItem(row, spot = null) {
  const type = row.type || "";
  const isPost = isPostCampaignType(type);
  const rawPostType = isPost ? type.replace(/^post_/, "") : "";
  const updateType = isPost
    ? POST_TYPE_TO_UPDATE[rawPostType] || "post"
    : CAMPAIGN_TYPE_TO_UPDATE[type] || "action";

  const rawMsg = row.message || "";
  const msg = isStammgastCampaign(row) ? stripStammgastMeta(rawMsg) : rawMsg;
  const emoji = msg.match(/^[\p{Extended_Pictographic}\uFE0F]/u)?.[0] || spot?.emoji || "📍";
  const cleanText = msg.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, "").trim() || msg;
  const title = cleanText.slice(0, 120) || (isPost ? "Neuer Post" : "Neue Kampagne");

  const typeLabels = {
    push: "Kampagne",
    reactivation: "Reaktivierung",
    birthday: "Geburtstag",
    segment: "Aktion",
    feed: "Featured",
    notification: "Benachrichtigung",
  };

  const item = {
    id: `live-${row.id}`,
    spot_id: row.spot_id,
    spot_name: spot?.name || row.spot_name || "Spot",
    spot_emoji: spot?.emoji || emoji,
    spot_bg: spot?.bg_color || "#1B4FD8",
    spot_category: categoryLabelOnly(spot) || spot?.category || "",
    update_type: updateType,
    campaign_type: type,
    title,
    description: cleanText,
    time_label: formatRelativeTime(row.created_at),
    published_at: row.created_at,
    is_new: row.created_at && Date.now() - new Date(row.created_at).getTime() < 48 * 3600000,
    is_favorite: false,
    reward_available: updateType === "reward" || type === "birthday",
    distance_km: spot?.distance ? parseFloat(String(spot.distance).replace(/[^\d.]/g, "")) || null : null,
    cta: type === "birthday" || updateType === "reward" ? "wallet" : "coupon_open",
    badge_label: isPost ? null : type === "stammgast" ? "Stammgast-Aktion" : typeLabels[type] || "Vorteil",
    image_url: row.image_url ?? null,
    _live: true,
  };
  if (isCampaignCouponItem(item)) {
    item.coupon = buildCouponViewModel(item);
  }
  return item;
}

function filterCampaignsForGuest(rows, userId) {
  return (rows ?? []).filter((c) => campaignVisibleToGuest(c, userId));
}

/** Alle Kampagnen von gefolgten Spots (für Gäste; Stammgast-Coupons nur für Empfänger) */
export const getFollowerSpotUpdates = async (followedSpotIds, spotsById = {}, userId = null) => {
  if (LOCAL) {
    const ids = followedSpotIds?.length ? followedSpotIds : MY_SPOTS_DEFAULT_FOLLOWS;
    try {
      const all = JSON.parse(localStorage.getItem("local_campaigns") || "[]");
      return filterCampaignsForGuest(
        all.filter((c) => ids.includes(c.spot_id) && !isPostCampaignType(c.type)),
        userId,
      ).map((c) => mapCampaignRowToFeedItem(c, spotsById[c.spot_id]));
    } catch {
      return [];
    }
  }
  if (!followedSpotIds?.length) return [];

  const fromDescription = (await loadGuestFeedFromSpots(followedSpotIds, spotsById)).filter(
    (i) => !isPostCampaignType(i.campaign_type) && i.update_type !== "post",
  );
  if (fromDescription.length) return fromDescription;

  const db = ensureSupabase();
  const { data: rpcRows, error: rpcErr } = await db.rpc("get_guest_followed_updates");
  if (!rpcErr && rpcRows != null && rpcRows.length) {
    return filterCampaignsForGuest(rpcRows, userId)
      .filter((c) => !isPostCampaignType(c.type))
      .map((c) => mapCampaignRowToFeedItem(c, spotsById[c.spot_id]));
  }

  const { data, error } = await db
    .from("campaigns")
    .select("*")
    .in("spot_id", followedSpotIds)
    .order("created_at", { ascending: false });
  if (error) return fromDescription;
  const fromTable = filterCampaignsForGuest(data, userId)
    .filter((c) => !isPostCampaignType(c.type))
    .map((c) => mapCampaignRowToFeedItem(c, spotsById[c.spot_id]));
  return fromTable.length ? fromTable : fromDescription;
};

/** Kampagnen eines Spots (Spot-Detail; Posts ausgeschlossen; Stammgast nur für Empfänger) */
export const getSpotCampaignUpdates = async (spotId, spot = null, userId = null) => {
  if (!spotId) return [];
  if (LOCAL) {
    try {
      const all = JSON.parse(localStorage.getItem("local_campaigns") || "[]");
      return filterCampaignsForGuest(
        all.filter((c) => c.spot_id === spotId && !isPostCampaignType(c.type)),
        userId,
      ).map((c) => mapCampaignRowToFeedItem(c, spot));
    } catch {
      return [];
    }
  }

  const fromDescription = (
    await loadGuestFeedFromSpots([spotId], spot ? { [spotId]: spot } : {})
  ).filter((i) => !isPostCampaignType(i.campaign_type) && i.update_type !== "post");
  if (fromDescription.length) {
    return fromDescription.filter((i) => {
      if (!isStammgastCampaign({ type: i.campaign_type, message: i.description }))
        return true;
      return campaignVisibleToGuest(
        { type: i.campaign_type, message: i.description },
        userId,
      );
    });
  }

  const db = ensureSupabase();
  const { data: rpcRows, error: rpcErr } = await db.rpc("get_spot_campaign_updates", {
    p_spot_id: spotId,
  });
  if (!rpcErr && rpcRows != null && rpcRows.length) {
    return filterCampaignsForGuest(
      (rpcRows ?? []).filter((c) => !isPostCampaignType(c.type)),
      userId,
    ).map((c) => mapCampaignRowToFeedItem(c, spot));
  }
  const { data, error } = await db
    .from("campaigns")
    .select("*")
    .eq("spot_id", spotId)
    .order("created_at", { ascending: false });
  if (error) return fromDescription;
  const fromTable = filterCampaignsForGuest(
    (data ?? []).filter((c) => !isPostCampaignType(c.type)),
    userId,
  ).map((c) => mapCampaignRowToFeedItem(c, spot));
  return fromTable.length ? fromTable : fromDescription;
};

/** @deprecated Alias */
export const getFollowerSpotPosts = getFollowerSpotUpdates;

/** Gefolgte Spot-IDs: DB + localStorage + Stempelkarten (auf echte UUIDs normalisiert) */
export async function resolveGuestFollowedSpotIds(userId, stamps = [], spots = []) {
  const fromDb = await getUserFollowedSpotIds(userId).catch(() => []);
  let localFollows = [];
  try {
    localFollows = JSON.parse(localStorage.getItem("spotloop_followed") || "[]");
  } catch {
    localFollows = [];
  }
  const fromStamps = (stamps ?? []).map((s) => s.spot_id).filter(Boolean);
  const merged = [...new Set([...fromDb, ...localFollows, ...fromStamps])];
  const normalized = normalizeFollowedSpotIds(merged, spots);
  if (LOCAL && !normalized.length) return MY_SPOTS_DEFAULT_FOLLOWS;
  if (
    normalized.length &&
    spots.length &&
    JSON.stringify(normalized) !== JSON.stringify(localFollows)
  ) {
    try {
      localStorage.setItem("spotloop_followed", JSON.stringify(normalized));
    } catch {
      /* ignore */
    }
  }
  return normalized;
}

const NOTIF_TYPE_COLORS = {
  action: "#D68A0C",
  reward: "#F05830",
  post: "#13B05C",
  event: "#6355C7",
};

/** Kurz-Benachrichtigungen aus Kampagnen (Glocke) — Premium-Push-Copy für Coupons */
export function mapFeedItemToNotification(item) {
  const isCampaign = item.campaign_type && !item.campaign_type.startsWith("post_");
  const coupon = item.coupon || (isCampaignCouponItem(item) ? buildCouponViewModel(item) : null);

  if (coupon) {
    return {
      id: item.id,
      type: "campaign",
      icon: item.spot_emoji || "🏪",
      color: item.spot_bg || "#1B4FD8",
      title: coupon.push.merchantLine,
      body: coupon.push.headline,
      pushMerchant: coupon.push.merchantLine,
      pushHeadline: coupon.push.headline,
      pushMeta: coupon.push.meta,
      time: item.time_label,
      spotId: item.spot_id,
      unread: item.is_new,
      cta: "Jetzt öffnen",
      feedItem: item,
      coupon,
    };
  }

  return {
    id: item.id,
    type: isCampaign ? "campaign" : item.update_type === "reward" ? "reward_ready" : "campaign",
    icon: item.spot_emoji || "📢",
    color: NOTIF_TYPE_COLORS[item.update_type] || "#1B4FD8",
    title: `${item.spot_name}: ${item.title}`,
    body: item.description?.slice(0, 140) || "",
    time: item.time_label,
    spotId: item.spot_id,
    unread: item.is_new,
    cta: item.update_type === "reward" ? "Jetzt einlösen" : null,
  };
}

export async function getGuestCampaignNotifications(userId, stamps = [], spotsById = {}) {
  const spots = Object.values(spotsById ?? {});
  const followed = await resolveGuestFollowedSpotIds(userId, stamps, spots);
  const updates = await getFollowerSpotUpdates(followed, spotsById, userId).catch(() => []);
  const capped = applyGlobalDailyNotificationCap(updates, stamps);
  return capped.map(mapFeedItemToNotification);
}

/** Kurz-Benachrichtigung an Follower (My Spots / Glocke) */
export const createSpotNotification = async (spotId, { type = "info", title, message, spotName }) => {
  const emoji = NOTIFICATION_TYPE_EMOJI[type] || "🔔";
  const headline = (title || "Benachrichtigung").trim();
  const body = (message || "").trim();
  await createCampaign(spotId, {
    type: "notification",
    message: `${emoji} ${headline}: ${body}`,
    spot_name: spotName,
    status: "live",
  });
};

export const getMerchantCampaigns = async (spotId) => {
  if (LOCAL) return localCampaigns.forSpot(spotId);
  const db = ensureSupabase();
  const { data } = await q(
    db.from("campaigns").select("*").eq("spot_id", spotId).order("created_at", { ascending: false })
  );
  return data ?? [];
};

// ── ADMIN (User Metadata is_admin) ────────────────────────────────
export const getPendingSpotsForAdmin = async () => {
  if (LOCAL) return [];
  const db = ensureSupabase();
  const { data, error } = await db
    .from("spots")
    .select("*")
    .eq("verification_status", VERIFICATION_STATUS.PENDING)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSpotRow);
};

export const adminApproveSpotRpc = async (spotId) => {
  if (LOCAL) throw new Error("Admin-Freischaltung nur mit Supabase.");
  const db = ensureSupabase();
  const { error } = await db.rpc("admin_approve_spot", { target_spot_id: spotId });
  if (error) throw error;
};
