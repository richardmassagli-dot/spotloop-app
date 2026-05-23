/**
 * Spot-Communities — Clubs für loyale Members (Einladung + Zustimmung).
 */
import { supabase } from "./supabase";
import { IS_LOCAL_MODE } from "./config";
import { getMemberPseudonym } from "./privacy";

const LOCAL_COMMUNITIES = "spotloop_communities";
const LOCAL_MEMBERS = "spotloop_community_members";

export const COMMUNITY_TEMPLATES = [
  { name: "Stammgast Club", emoji: "⭐", description: "Für treue Regulars", perks: ["Exklusive Rewards", "Early Access"], min_visits: 8 },
  { name: "Coffee Lovers", emoji: "☕", description: "Für Espresso-Fans", perks: ["Gratis Upgrade", "Member Events"], min_visits: 5 },
  { name: "Brunch Club", emoji: "🥐", description: "Wochenend-Stammgäste", perks: ["Brunch-Aktionen", "Reservierungs-Prio"], min_visits: 6 },
  { name: "VIP Tasting", emoji: "🍷", description: "Degustationen & Specials", perks: ["Tasting Nights", "Secret Menu"], min_visits: 12 },
];

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function writeLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function isMissingTable(error) {
  const code = error?.code;
  const msg = error?.message || "";
  return code === "PGRST205" || msg.includes("spot_communities") || msg.includes("does not exist");
}

/** true wenn Clubs nur lokal (Migration 018 fehlt) */
export function isCommunityLocalFallback() {
  try {
    return localStorage.getItem("spotloop_communities_fallback") === "1";
  } catch {
    return false;
  }
}

function markCommunityFallback() {
  try {
    localStorage.setItem("spotloop_communities_fallback", "1");
  } catch {
    /* ignore */
  }
}

function localCommunities(spotId) {
  const all = readLocal(LOCAL_COMMUNITIES);
  return (all[spotId] || []).filter((c) => c.is_active !== false);
}

function localMembersForSpot(spotId) {
  const all = readLocal(LOCAL_MEMBERS);
  return Object.values(all).filter((m) => m.spot_id === spotId);
}

function localMembersForUser(userId) {
  const all = readLocal(LOCAL_MEMBERS);
  return Object.values(all).filter((m) => m.user_id === userId);
}

/** Communities eines Spots (Merchant + Gast-Liste aktiver Clubs). */
export async function loadSpotCommunities(spotId) {
  if (!spotId) return [];
  if (IS_LOCAL_MODE || !supabase) return localCommunities(spotId);

  const { data, error } = await supabase
    .from("spot_communities")
    .select("*")
    .eq("spot_id", spotId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (isMissingTable(error)) {
    markCommunityFallback();
    return localCommunities(spotId);
  }
  if (error) return localCommunities(spotId);
  try {
    localStorage.removeItem("spotloop_communities_fallback");
  } catch {
    /* ignore */
  }
  return data ?? [];
}

export async function createSpotCommunity(spotId, payload) {
  const row = {
    id: `comm-${Date.now()}`,
    spot_id: spotId,
    name: payload.name?.trim(),
    emoji: payload.emoji || "👥",
    description: payload.description?.trim() || "",
    perks: payload.perks || [],
    min_visits: payload.min_visits ?? 5,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  if (!row.name) throw new Error("Name fehlt");

  if (IS_LOCAL_MODE || !supabase) {
    const all = readLocal(LOCAL_COMMUNITIES);
    all[spotId] = [...(all[spotId] || []), row];
    writeLocal(LOCAL_COMMUNITIES, all);
    return row;
  }

  const { data, error } = await supabase
    .from("spot_communities")
    .insert({
      spot_id: spotId,
      name: row.name,
      emoji: row.emoji,
      description: row.description,
      perks: row.perks,
      min_visits: row.min_visits,
    })
    .select()
    .single();

  if (isMissingTable(error)) {
    markCommunityFallback();
    const all = readLocal(LOCAL_COMMUNITIES);
    all[spotId] = [...(all[spotId] || []), row];
    writeLocal(LOCAL_COMMUNITIES, all);
    return row;
  }
  if (error) {
    const msg = error.message || "Club konnte nicht gespeichert werden";
    if (error.code === "42501" || msg.includes("policy")) {
      throw new Error("Keine Berechtigung — bist du als Händler dieses Spots eingeloggt?");
    }
    throw new Error(msg);
  }
  return data;
}

export async function loadCommunityMembers(communityId, spotId) {
  if (IS_LOCAL_MODE || !supabase) {
    const all = readLocal(LOCAL_MEMBERS);
    return Object.values(all).filter((m) => m.community_id === communityId);
  }

  const { data, error } = await supabase
    .from("spot_community_members")
    .select("*")
    .eq("community_id", communityId);

  if (isMissingTable(error)) {
    return Object.values(readLocal(LOCAL_MEMBERS)).filter((m) => m.community_id === communityId);
  }
  if (error) return [];
  return (data ?? []).map((m) => ({ ...m, spot_id: spotId }));
}

/** Merchant lädt Wallet-Member ein (status: invited). */
export async function inviteToCommunity({ communityId, spotId, userId }) {
  if (!communityId || !userId) throw new Error("Community oder Member fehlt");

  const row = {
    id: `mem-${Date.now()}`,
    community_id: communityId,
    spot_id: spotId,
    user_id: userId,
    status: "invited",
    visible_to_spot: true,
    invited_at: new Date().toISOString(),
    joined_at: null,
  };

  if (IS_LOCAL_MODE || !supabase) {
    const all = readLocal(LOCAL_MEMBERS);
    const key = `${communityId}:${userId}`;
    if (all[key]) return all[key];
    all[key] = row;
    writeLocal(LOCAL_MEMBERS, all);
    return row;
  }

  const { data, error } = await supabase
    .from("spot_community_members")
    .upsert(
      {
        community_id: communityId,
        user_id: userId,
        status: "invited",
        visible_to_spot: true,
      },
      { onConflict: "community_id,user_id" },
    )
    .select()
    .single();

  if (isMissingTable(error)) {
    markCommunityFallback();
    const all = readLocal(LOCAL_MEMBERS);
    const key = `${communityId}:${userId}`;
    if (all[key]) return all[key];
    all[key] = row;
    writeLocal(LOCAL_MEMBERS, all);
    return row;
  }
  if (error) throw new Error(error.message || "Einladung fehlgeschlagen");
  return { ...data, spot_id: spotId };
}

/** Gast nimmt Einladung an oder lehnt ab. */
export async function respondCommunityInvite({ memberId, communityId, userId, accept, visibleToSpot = true }) {
  const status = accept ? "active" : "declined";
  const joined_at = accept ? new Date().toISOString() : null;

  if (IS_LOCAL_MODE || !supabase) {
    const all = readLocal(LOCAL_MEMBERS);
    const entry = Object.values(all).find(
      (m) => m.id === memberId || (m.community_id === communityId && m.user_id === userId),
    );
    if (!entry) throw new Error("Einladung nicht gefunden");
    const key = `${entry.community_id}:${entry.user_id}`;
    all[key] = { ...entry, status, visible_to_spot: visibleToSpot, joined_at };
    writeLocal(LOCAL_MEMBERS, all);
    return all[key];
  }

  const { data, error } = await supabase
    .from("spot_community_members")
    .update({ status, visible_to_spot: visibleToSpot, joined_at })
    .eq("user_id", userId)
    .eq("community_id", communityId)
    .select()
    .single();

  if (isMissingTable(error)) {
    const all = readLocal(LOCAL_MEMBERS);
    const entry = Object.values(all).find(
      (m) => m.community_id === communityId && m.user_id === userId,
    );
    if (!entry) throw new Error("Einladung nicht gefunden");
    const key = `${entry.community_id}:${entry.user_id}`;
    all[key] = { ...entry, status, visible_to_spot: visibleToSpot, joined_at };
    writeLocal(LOCAL_MEMBERS, all);
    return all[key];
  }
  if (error) throw new Error(error.message || "Antwort konnte nicht gespeichert werden");
  return data;
}

/** Einladungen & Mitgliedschaften für einen Gast. */
export async function loadGuestCommunityMemberships(userId) {
  if (!userId) return { invites: [], active: [] };

  if (IS_LOCAL_MODE || !supabase) {
    const rows = localMembersForUser(userId);
    return {
      invites: rows.filter((m) => m.status === "invited"),
      active: rows.filter((m) => m.status === "active"),
    };
  }

  const { data, error } = await supabase
    .from("spot_community_members")
    .select("*, community:spot_communities(*, spot:spots(id, name, emoji, bg_color))")
    .eq("user_id", userId)
    .in("status", ["invited", "active"]);

  if (isMissingTable(error)) {
    const rows = localMembersForUser(userId);
    return {
      invites: rows.filter((m) => m.status === "invited"),
      active: rows.filter((m) => m.status === "active"),
    };
  }
  if (error) return { invites: [], active: [] };

  const rows = data ?? [];
  return {
    invites: rows.filter((m) => m.status === "invited"),
    active: rows.filter((m) => m.status === "active"),
  };
}

/** Mitglieder mit Pseudonym für Merchant-UI. */
export function membersWithPseudonyms(members, spotId, stampsByUser = {}) {
  return members.map((m) => {
    const stamp = stampsByUser[m.user_id];
    const visits = stamp?.points ?? 0;
    return {
      ...m,
      pseudonym: getMemberPseudonym(m.user_id, spotId),
      visits,
      eligible: visits >= 0,
    };
  });
}

export async function loadSpotStampMembers(spotId) {
  if (!spotId) return [];
  if (IS_LOCAL_MODE) {
    try {
      const stamps = JSON.parse(localStorage.getItem("local_stamps") || "{}");
      return Object.values(stamps).filter((s) => s.spot_id === spotId);
    } catch {
      return [];
    }
  }
  if (!supabase) return [];
  const { data } = await supabase
    .from("stamps")
    .select("user_id, points, max_points, reward_ready, created_at, updated_at, last_visit")
    .eq("spot_id", spotId)
    .order("points", { ascending: false });
  return data ?? [];
}
