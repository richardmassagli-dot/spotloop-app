// Data layer — routes to Supabase when configured, localStorage otherwise.
import { supabase } from "./supabase";
import { localSpots, localStamps, localFollows, localCheckins, localCampaigns } from "./localStore";
import { IS_LOCAL_MODE } from "./config";
import { VERIFICATION_STATUS } from "./merchantVerification";

const LOCAL = IS_LOCAL_MODE;

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase ist nicht konfiguriert. Bitte .env.local prüfen.");
  }
  return supabase;
};

const isNoRowsError = (error, status) =>
  status === 406 || error?.code === "PGRST116" || /no rows/i.test(error?.message || "");

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
  return {
    ...row,
    verification_status: status,
    verified: status === VERIFICATION_STATUS.VERIFIED,
    isActive: row.is_active ?? row.isActive ?? true,
  };
}

function toSpotPayload(merchantId, data) {
  const {
    isActive,
    is_active,
    verification_status,
    verification_note,
    verified_at,
    verified,
    ...rest
  } = data;
  return {
    ...rest,
    id: merchantId,
    merchant_id: merchantId,
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

export const getSpot = async (spotId) => {
  if (LOCAL) return mapSpotRow(localSpots.get(spotId));
  const db = ensureSupabase();
  const { data } = await q(db.from("spots").select("*").eq("id", spotId).single(), { allowMissing: true });
  return mapSpotRow(data);
};

export const getAllSpots = async () => {
  if (LOCAL) {
    return localSpots.getAll()
      .map(mapSpotRow)
      .filter(s => s.verification_status === VERIFICATION_STATUS.VERIFIED);
  }
  const db = ensureSupabase();
  const { data } = await q(db.from("spots").select("*").order("created_at", { ascending: false }));
  return (data ?? []).map(mapSpotRow);
};

export const subscribeToSpot = (spotId, cb) => {
  if (LOCAL) return localSpots.subscribe(spotId, cb);
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
    db.from("spots").select("max_points, reward_text").eq("id", spotId).single(),
    { allowMissing: true }
  );
  const maxPts = spot?.max_points ?? 10;
  const { data: created } = await q(
    db.from("stamps").insert({ user_id: userId, spot_id: spotId, points: 0 }).select().single()
  );
  return { ...created, max_points: maxPts, reward_text: spot?.reward_text, reward_ready: false };
};

// Follows the spec's addStamp logic exactly
export const addStamp = async (userId, spotId) => {
  if (LOCAL) return localStamps.addPoint(userId, spotId);
  const db = ensureSupabase();

  const { data: spot } = await q(
    db.from("spots").select("max_points, reward_text").eq("id", spotId).single(),
    { allowMissing: true }
  );
  const maxPts = spot?.max_points ?? 10;

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

  await db.rpc("increment_checkins", { spot_id: spotId }).catch(() => {});
  await db.from("checkins").insert({ user_id: userId, spot_id: spotId }).catch(() => {});

  const pts   = stamp.points;
  const ready = pts >= maxPts;
  return { ...stamp, max_points: maxPts, reward_text: spot?.reward_text, reward_ready: ready };
};

export const redeemStamp = async (userId, spotId) => {
  if (LOCAL) { localStamps.redeem(userId, spotId); return; }
  const db = ensureSupabase();
  await q(
    db.from("stamps").update({ points: 0, updated_at: new Date().toISOString() })
      .eq("user_id", userId).eq("spot_id", spotId)
  );
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
export const followSpot = async (userId, spotId) => {
  if (LOCAL) { localFollows.follow(userId, spotId); return; }
  const db = ensureSupabase();
  const { data: existing } = await q(
    db.from("follows").select("id").eq("user_id", userId).eq("spot_id", spotId).maybeSingle()
  );
  if (!existing) {
    await q(db.from("follows").insert({ user_id: userId, spot_id: spotId }));
    await db.rpc("increment_followers", { spot_id: spotId }).catch(() => {});
  }
};

export const unfollowSpot = async (userId, spotId) => {
  if (LOCAL) { localFollows.unfollow(userId, spotId); return; }
  const db = ensureSupabase();
  const { data: deleted } = await q(
    db.from("follows").delete().eq("user_id", userId).eq("spot_id", spotId).select("id")
  );
  if (deleted?.length) {
    await db.rpc("decrement_followers", { spot_id: spotId }).catch(() => {});
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
export const createCampaign = async (spotId, data) => {
  if (LOCAL) { localCampaigns.create(spotId, data); return; }
  const db = ensureSupabase();
  await q(db.from("campaigns").insert({ spot_id: spotId, ...data, status: "gesendet" }));
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
