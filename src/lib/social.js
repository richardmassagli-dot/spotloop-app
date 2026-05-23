/**
 * Spotloop Social — Supabase when logged in, localStorage demo fallback.
 */
import { IS_LOCAL_MODE } from "./config";
import { supabase } from "./supabase";
import {
  DEMO_FRIENDS,
  DEMO_FRIEND_REQUESTS,
  DEMO_ACTIVITIES,
  DEMO_COLLECTIONS,
  DEMO_POLLS,
  DEMO_MOMENTS,
  DEMO_SOCIAL_MAP_HINTS,
  DEFAULT_SOCIAL_PREFS,
} from "../data/socialDemo";

const KEYS = {
  friends: "spotloop_social_friends",
  requests: "spotloop_social_requests",
  collections: "spotloop_social_collections",
  polls: "spotloop_social_polls",
  moments: "spotloop_social_moments",
  prefs: "spotloop_social_prefs",
};

const AVATAR_COLORS = ["#1B4FD8", "#0EA5E9", "#6366F1", "#14B8A6", "#F59E0B", "#EC4899"];

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const seedIfEmpty = () => {
  if (!read(KEYS.friends, null)) write(KEYS.friends, DEMO_FRIENDS);
  if (!read(KEYS.requests, null)) write(KEYS.requests, DEMO_FRIEND_REQUESTS);
  if (!read(KEYS.collections, null)) write(KEYS.collections, DEMO_COLLECTIONS);
  if (!read(KEYS.polls, null)) write(KEYS.polls, DEMO_POLLS);
  if (!read(KEYS.moments, null)) write(KEYS.moments, DEMO_MOMENTS);
  if (!read(KEYS.prefs, null)) write(KEYS.prefs, DEFAULT_SOCIAL_PREFS);
};

seedIfEmpty();

const cache = {
  remote: false,
  friends: null,
  requests: null,
  collections: null,
  polls: null,
  moments: null,
  activities: null,
  mapHints: null,
  prefs: null,
};

const isMissingTable = (err) =>
  err?.code === "PGRST205"
  || err?.code === "42P01"
  || /does not exist|relation/i.test(err?.message ?? "");

async function getSessionUser() {
  if (IS_LOCAL_MODE || !supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function isSocialRemote() {
  const user = await getSessionUser();
  return Boolean(user && !IS_LOCAL_MODE && supabase);
}

function colorForId(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function initialsFromName(name = "?") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function profileRowToFriend(row, mutualSpots = 0) {
  return {
    id: row.user_id,
    name: row.display_name,
    avatar: row.avatar_initials || initialsFromName(row.display_name),
    color: row.color || colorForId(row.user_id),
    mutualSpots,
  };
}

function orderedPair(a, b) {
  return a < b ? [a, b] : [b, a];
}

async function upsertMySocialProfile(user) {
  if (!user) return;
  const name = user.user_metadata?.name || user.email?.split("@")[0] || "Nutzer";
  const row = {
    user_id: user.id,
    display_name: name,
    avatar_initials: initialsFromName(name),
    color: colorForId(user.id),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("social_profiles").upsert(row);
  if (error && !isMissingTable(error)) console.warn("[social] profile upsert", error.message);
}

async function fetchProfiles(userIds) {
  if (!userIds.length) return {};
  const { data, error } = await supabase
    .from("social_profiles")
    .select("user_id, display_name, avatar_initials, color")
    .in("user_id", userIds);
  if (error) {
    if (!isMissingTable(error)) console.warn("[social] profiles", error.message);
    return {};
  }
  return Object.fromEntries((data ?? []).map((r) => [r.user_id, r]));
}

// ─── Hydrate (call on SocialHub mount / after auth) ─────────────────
export async function hydrateSocial() {
  const user = await getSessionUser();
  cache.remote = Boolean(user && !IS_LOCAL_MODE);

  if (!cache.remote) {
    cache.friends = read(KEYS.friends, DEMO_FRIENDS);
    cache.requests = read(KEYS.requests, DEMO_FRIEND_REQUESTS);
    cache.collections = read(KEYS.collections, DEMO_COLLECTIONS);
    cache.polls = read(KEYS.polls, DEMO_POLLS);
    cache.moments = read(KEYS.moments, DEMO_MOMENTS);
    cache.prefs = read(KEYS.prefs, DEFAULT_SOCIAL_PREFS);
    cache.activities = null;
    cache.mapHints = null;
    return { remote: false };
  }

  await upsertMySocialProfile(user);
  const uid = user.id;

  try {
    const [friends, requests, collections, polls, moments, prefs] = await Promise.all([
      loadFriendsRemote(uid),
      loadRequestsRemote(uid),
      loadCollectionsRemote(uid),
      loadPollsRemote(uid),
      loadMomentsRemote(uid),
      loadPrefsRemote(uid),
    ]);
    cache.friends = friends;
    cache.requests = requests;
    cache.collections = collections;
    cache.polls = polls;
    cache.moments = moments;
    cache.prefs = prefs;
    cache.activities = await buildActivityFeedRemote(uid, friends);
    cache.mapHints = await buildMapHintsRemote(uid, friends);
    return { remote: true };
  } catch (e) {
    console.warn("[social] hydrate fallback", e);
    cache.remote = false;
    cache.friends = read(KEYS.friends, DEMO_FRIENDS);
    cache.requests = read(KEYS.requests, DEMO_FRIEND_REQUESTS);
    cache.collections = read(KEYS.collections, DEMO_COLLECTIONS);
    cache.polls = read(KEYS.polls, DEMO_POLLS);
    cache.moments = read(KEYS.moments, DEMO_MOMENTS);
    cache.prefs = read(KEYS.prefs, DEFAULT_SOCIAL_PREFS);
    return { remote: false };
  }
}

// ─── Preferences ───────────────────────────────────────────────────
export const getSocialPrefs = () =>
  cache.prefs ?? read(KEYS.prefs, DEFAULT_SOCIAL_PREFS);

export const setSocialPrefs = async (patch) => {
  const next = { ...getSocialPrefs(), ...patch };
  cache.prefs = next;
  write(KEYS.prefs, next);

  if (cache.remote) {
    const user = await getSessionUser();
    if (!user) return next;
    const row = {
      user_id: user.id,
      show_activity: next.show_activity ?? true,
      show_visited_spots: next.show_visited_spots ?? true,
      show_on_social_map: next.show_on_social_map ?? true,
      moments_visibility: next.moments_visibility ?? "friends",
      collections_default: next.collections_default ?? "private",
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("social_preferences").upsert(row);
    if (error && !isMissingTable(error)) console.warn("[social] prefs", error.message);
  }
  return next;
};

// ─── Friends ─────────────────────────────────────────────────────────
export const getFriends = () => cache.friends ?? read(KEYS.friends, DEMO_FRIENDS);
export const getFriendRequests = () => cache.requests ?? read(KEYS.requests, DEMO_FRIEND_REQUESTS);

async function loadFriendsRemote(uid) {
  const { data, error } = await supabase.from("friendships").select("user_a, user_b");
  if (error) throw error;
  const friendIds = (data ?? []).map((r) => (r.user_a === uid ? r.user_b : r.user_a));
  const profiles = await fetchProfiles(friendIds);
  return friendIds.map((id) => {
    const p = profiles[id];
    return p
      ? profileRowToFriend(p, 0)
      : { id, name: "Freund", avatar: "FR", color: colorForId(id), mutualSpots: 0 };
  });
}

async function loadRequestsRemote(uid) {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, from_user, status")
    .eq("to_user", uid)
    .eq("status", "pending");
  if (error) throw error;
  const fromIds = (data ?? []).map((r) => r.from_user);
  const profiles = await fetchProfiles(fromIds);
  return (data ?? []).map((r) => {
    const p = profiles[r.from_user];
    return {
      id: r.id,
      fromUserId: r.from_user,
      name: p?.display_name ?? "Anfrage",
      avatar: p?.avatar_initials ?? "??",
      color: p?.color ?? colorForId(r.from_user),
      mutualSpots: 0,
    };
  });
}

export const acceptFriendRequest = async (requestId) => {
  if (!cache.remote) {
    const requests = getFriendRequests().filter((r) => r.id !== requestId);
    const req = getFriendRequests().find((r) => r.id === requestId);
    write(KEYS.requests, requests);
    if (req) {
      const friends = getFriends();
      friends.push({
        id: `f-${Date.now()}`,
        name: req.name,
        avatar: req.avatar,
        color: req.color,
        mutualSpots: req.mutualSpots ?? 0,
      });
      write(KEYS.friends, friends);
      cache.friends = friends;
      cache.requests = requests;
    }
    return;
  }

  const user = await getSessionUser();
  if (!user) return;
  const { data: req } = await supabase
    .from("friend_requests")
    .select("from_user")
    .eq("id", requestId)
    .eq("to_user", user.id)
    .single();
  if (!req) return;

  const [user_a, user_b] = orderedPair(user.id, req.from_user);
  await supabase.from("friend_requests").update({ status: "accepted" }).eq("id", requestId);
  await supabase.from("friendships").insert({ user_a, user_b });
  await hydrateSocial();
};

export const removeFriend = async (friendId) => {
  if (!cache.remote) {
    const friends = getFriends().filter((f) => f.id !== friendId);
    write(KEYS.friends, friends);
    cache.friends = friends;
    return;
  }
  const user = await getSessionUser();
  if (!user) return;
  const [user_a, user_b] = orderedPair(user.id, friendId);
  await supabase.from("friendships").delete().eq("user_a", user_a).eq("user_b", user_b);
  await hydrateSocial();
};

/** Add friend by display name (demo) or email (Supabase). */
export const addFriendByCode = async (input) => {
  const trimmed = String(input || "").trim();
  if (!trimmed) return;

  if (!cache.remote) {
    const friends = getFriends();
    friends.push({
      id: `f-${Date.now()}`,
      name: trimmed,
      avatar: initialsFromName(trimmed),
      color: "#1B4FD8",
      mutualSpots: 0,
    });
    write(KEYS.friends, friends);
    cache.friends = friends;
    return;
  }

  const user = await getSessionUser();
  if (!user) return;

  let toUserId = null;
  if (trimmed.includes("@")) {
    const { data, error } = await supabase.rpc("find_user_id_by_email", { p_email: trimmed });
    if (error) {
      console.warn("[social] find email", error.message);
      return;
    }
    toUserId = data;
  }
  if (!toUserId) return;

  await supabase.from("friend_requests").upsert(
    { from_user: user.id, to_user: toUserId, status: "pending" },
    { onConflict: "from_user,to_user" }
  );
  await hydrateSocial();
};

// ─── Activity ────────────────────────────────────────────────────────
async function buildActivityFeedRemote(uid, friends, limit = 8) {
  if (!getSocialPrefs().show_activity) return [];
  const friendIds = friends.map((f) => f.id);
  const ids = [uid, ...friendIds];
  const items = [];

  const { data: moments } = await supabase
    .from("food_moments")
    .select("id, user_id, spot_id, caption, dish, created_at, spots(name)")
    .in("user_id", friendIds)
    .order("created_at", { ascending: false })
    .limit(5);
  if (moments?.length) {
    const profiles = await fetchProfiles([...new Set(moments.map((m) => m.user_id))]);
    moments.forEach((m) => {
      const p = profiles[m.user_id];
      items.push({
        id: m.id,
        type: "visit",
        user: p?.display_name ?? "Freund",
        avatar: p?.avatar_initials ?? "??",
        color: p?.color ?? colorForId(m.user_id),
        spot: m.spots?.name ?? "Spot",
        spotId: m.spot_id,
        time: "kürzlich",
      });
    });
  }

  const { data: shares } = await supabase
    .from("spot_shares")
    .select("id, from_user, spot_id, message, created_at, spots(name)")
    .in("from_user", friendIds)
    .order("created_at", { ascending: false })
    .limit(4);
  if (shares?.length) {
    const profiles = await fetchProfiles([...new Set(shares.map((s) => s.from_user))]);
    shares.forEach((s) => {
      const p = profiles[s.from_user];
      items.push({
        id: s.id,
        type: "share",
        user: p?.display_name ?? "Freund",
        avatar: p?.avatar_initials ?? "??",
        color: p?.color ?? colorForId(s.from_user),
        spot: s.spots?.name ?? "Spot",
        spotId: s.spot_id,
        message: s.message,
        time: "kürzlich",
      });
    });
  }

  if (friendIds.length) {
    const { data: follows } = await supabase
      .from("follows")
      .select("spot_id, user_id, spots(name)")
      .in("user_id", friendIds)
      .limit(20);
    const bySpot = {};
    (follows ?? []).forEach((f) => {
      if (!bySpot[f.spot_id]) bySpot[f.spot_id] = { spot: f.spots?.name, count: 0 };
      bySpot[f.spot_id].count += 1;
    });
    Object.entries(bySpot).forEach(([spotId, v]) => {
      if (v.count >= 2) {
        items.push({
          id: `like-${spotId}`,
          type: "friends_like",
          count: v.count,
          spot: v.spot,
          spotId,
          time: "heute",
        });
      }
    });
  }

  if (!items.length) return DEMO_ACTIVITIES.slice(0, limit);
  return items.slice(0, limit);
}

export const getFriendActivityFeed = (limit = 8) => {
  if (!getSocialPrefs().show_activity) return [];
  if (cache.activities) return cache.activities.slice(0, limit);
  return DEMO_ACTIVITIES.slice(0, limit);
};

// ─── Collections ───────────────────────────────────────────────────
async function loadCollectionsRemote(uid) {
  const { data, error } = await supabase
    .from("collections")
    .select("id, title, emoji, visibility, collection_spots(spot_id)")
    .eq("owner_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((c) => {
    const spotIds = (c.collection_spots ?? []).map((s) => s.spot_id);
    return {
      id: c.id,
      title: c.title,
      emoji: c.emoji || "✨",
      visibility: c.visibility,
      spotIds,
      count: spotIds.length,
    };
  });
}

export const getCollections = () => cache.collections ?? read(KEYS.collections, DEMO_COLLECTIONS);

export const createCollection = async ({ title, emoji = "✨", visibility = "private" }) => {
  if (!cache.remote) {
    const list = getCollections();
    list.unshift({ id: `c-${Date.now()}`, title, emoji, visibility, spotIds: [], count: 0 });
    write(KEYS.collections, list);
    cache.collections = list;
    return list;
  }
  const user = await getSessionUser();
  if (!user) return getCollections();
  const { data, error } = await supabase
    .from("collections")
    .insert({ owner_id: user.id, title, emoji, visibility })
    .select("id, title, emoji, visibility")
    .single();
  if (error) {
    console.warn("[social] collection", error.message);
    return getCollections();
  }
  const list = [{ id: data.id, title: data.title, emoji: data.emoji, visibility: data.visibility, spotIds: [], count: 0 }, ...getCollections()];
  cache.collections = list;
  return list;
};

export const addSpotToCollection = async (collectionId, spotId) => {
  if (!cache.remote) {
    const list = getCollections().map((c) => {
      if (c.id !== collectionId) return c;
      const spotIds = [...new Set([...(c.spotIds || []), spotId])];
      return { ...c, spotIds, count: spotIds.length };
    });
    write(KEYS.collections, list);
    cache.collections = list;
    return;
  }
  await supabase.from("collection_spots").upsert({ collection_id: collectionId, spot_id: spotId });
  await hydrateSocial();
};

// ─── Polls ───────────────────────────────────────────────────────────
async function loadPollsRemote(uid) {
  const { data: polls, error } = await supabase
    .from("group_polls")
    .select("id, title, status, created_at, closes_at, creator_id")
    .or(`creator_id.eq.${uid},id.in.(select poll_id from poll_invites where user_id.eq.${uid})`)
    .order("created_at", { ascending: false });
  if (error) {
    const { data: mine, error: e2 } = await supabase
      .from("group_polls")
      .select("id, title, status, created_at, closes_at, creator_id")
      .eq("creator_id", uid)
      .order("created_at", { ascending: false });
    if (e2) throw e2;
    return mapPollRows(mine ?? [], uid);
  }
  return mapPollRows(polls ?? [], uid);
}

async function mapPollRows(rows, uid) {
  const result = [];
  for (const p of rows) {
    const { data: options } = await supabase
      .from("group_poll_options")
      .select("id, spot_id, sort_order, spots(name, emoji)")
      .eq("poll_id", p.id)
      .order("sort_order");
    const { data: votes } = await supabase
      .from("group_poll_votes")
      .select("option_id")
      .eq("poll_id", p.id);
    const voteCounts = {};
    (votes ?? []).forEach((v) => { voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1; });
    const { count: invited } = await supabase
      .from("poll_invites")
      .select("user_id", { count: "exact", head: true })
      .eq("poll_id", p.id);

    result.push({
      id: p.id,
      title: p.title,
      creator: p.creator_id === uid ? "Du" : "Freund",
      status: p.status,
      options: (options ?? []).map((o) => ({
        id: o.id,
        spotId: o.spot_id,
        name: o.spots?.name ?? "Spot",
        emoji: o.spots?.emoji ?? "🏪",
        votes: voteCounts[o.id] || 0,
      })),
      invited: invited ?? getFriends().length,
      voted: (votes ?? []).length,
      closesAt: p.closes_at ? new Date(p.closes_at).toLocaleDateString("de-DE") : "offen",
    });
  }
  return result;
}

export const getPolls = () => cache.polls ?? read(KEYS.polls, DEMO_POLLS);

export const createPoll = async ({ title, optionSpots }) => {
  if (!cache.remote) {
    const polls = getPolls();
    polls.unshift({
      id: `p-${Date.now()}`,
      title,
      creator: "Du",
      status: "open",
      options: optionSpots.map((s, i) => ({
        id: `o-${Date.now()}-${i}`,
        spotId: s.id,
        name: s.name,
        emoji: s.emoji || "🏪",
        votes: 0,
      })),
      invited: getFriends().length,
      voted: 0,
      closesAt: "in 24 Std.",
    });
    write(KEYS.polls, polls);
    cache.polls = polls;
    return;
  }

  const user = await getSessionUser();
  if (!user) return;
  const closes = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const { data: poll, error } = await supabase
    .from("group_polls")
    .insert({ creator_id: user.id, title, closes_at: closes })
    .select("id")
    .single();
  if (error || !poll) return;

  const opts = optionSpots.map((s, i) => ({
    poll_id: poll.id,
    spot_id: s.id,
    sort_order: i,
  }));
  await supabase.from("group_poll_options").insert(opts);

  const friends = getFriends();
  if (friends.length) {
    await supabase.from("poll_invites").insert(
      friends.map((f) => ({ poll_id: poll.id, user_id: f.id }))
    );
  }
  await hydrateSocial();
};

export const votePoll = async (pollId, optionId) => {
  if (!cache.remote) {
    const polls = getPolls().map((p) => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        voted: (p.voted || 0) + 1,
        options: p.options.map((o) =>
          o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o
        ),
      };
    });
    write(KEYS.polls, polls);
    cache.polls = polls;
    return polls.find((p) => p.id === pollId);
  }

  const user = await getSessionUser();
  if (!user) return null;
  await supabase.from("group_poll_votes").upsert(
    { poll_id: pollId, user_id: user.id, option_id: optionId },
    { onConflict: "poll_id,user_id" }
  );
  await hydrateSocial();
  return getPolls().find((p) => p.id === pollId);
};

export const getPollWinner = (poll) => {
  if (!poll?.options?.length) return null;
  return [...poll.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
};

// ─── Food moments ────────────────────────────────────────────────────
async function loadMomentsRemote(uid) {
  const friendIds = getFriends().map((f) => f.id);
  const ids = [uid, ...friendIds];
  const { data, error } = await supabase
    .from("food_moments")
    .select("id, user_id, spot_id, caption, dish, rating, spots(name)")
    .in("user_id", ids)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  const profiles = await fetchProfiles([...new Set((data ?? []).map((m) => m.user_id))]);
  return (data ?? []).map((m) => {
    const p = profiles[m.user_id];
    const isMe = m.user_id === uid;
    return {
      id: m.id,
      user: isMe ? "Du" : (p?.display_name ?? "Freund"),
      avatar: isMe ? "DU" : (p?.avatar_initials ?? "??"),
      color: p?.color ?? colorForId(m.user_id),
      spot: m.spots?.name ?? "Spot",
      spotId: m.spot_id,
      dish: m.dish,
      caption: m.caption,
      rating: m.rating,
      emoji: "🍽️",
    };
  });
}

export const getFoodMoments = (spotId = null) => {
  const all = cache.moments ?? read(KEYS.moments, DEMO_MOMENTS);
  return spotId ? all.filter((m) => m.spotId === spotId || m.spot === spotId) : all;
};

export const postFoodMoment = async ({ spot, spotId, dish, caption, rating, emoji }) => {
  if (!cache.remote) {
    const moments = read(KEYS.moments, DEMO_MOMENTS);
    moments.unshift({
      id: `m-${Date.now()}`,
      user: "Du",
      avatar: "DU",
      color: "#1B4FD8",
      spot,
      dish,
      caption,
      rating,
      emoji: emoji || "🍽️",
    });
    write(KEYS.moments, moments);
    cache.moments = moments;
    return;
  }

  const user = await getSessionUser();
  if (!user || !spotId) return;
  const vis = getSocialPrefs().moments_visibility === "private" ? "private" : "friends";
  await supabase.from("food_moments").insert({
    user_id: user.id,
    spot_id: spotId,
    dish,
    caption,
    rating: rating || null,
    visibility: vis,
  });
  await hydrateSocial();
};

// ─── Share ─────────────────────────────────────────────────────────
export const shareSpotWithFriend = async (spotId, spotName, friendIdOrName, message) => {
  const friend = getFriends().find((f) => f.id === friendIdOrName || f.name === friendIdOrName);
  const friendId = friend?.id;
  const friendName = friend?.name ?? friendIdOrName;

  if (!cache.remote) {
    return;
  }

  const user = await getSessionUser();
  if (!user || !friendId) return;
  await supabase.from("spot_shares").insert({
    from_user: user.id,
    to_user: friendId,
    spot_id: spotId,
    message: message || null,
  });
  await hydrateSocial();
};

export const buildSpotShareLink = (spotId) => {
  const base = typeof window !== "undefined" ? window.location.origin : "https://spotloop-app-wheat.vercel.app";
  return `${base}/?checkin=${spotId}`;
};

// ─── Social map ────────────────────────────────────────────────────
async function buildMapHintsRemote(uid, friends) {
  if (!getSocialPrefs().show_on_social_map) return [];
  const friendIds = friends.map((f) => f.id);
  if (!friendIds.length) return DEMO_SOCIAL_MAP_HINTS;

  const { data: follows } = await supabase
    .from("follows")
    .select("spot_id, user_id")
    .in("user_id", friendIds);
  const bySpot = {};
  (follows ?? []).forEach((f) => {
    bySpot[f.spot_id] = (bySpot[f.spot_id] || 0) + 1;
  });

  const profiles = await fetchProfiles(friendIds);
  const hints = Object.entries(bySpot).map(([spotId, count]) => ({
    spotId,
    label: count >= 3 ? `${count} Freunde folgen` : `${Object.values(profiles)[0]?.display_name?.split(" ")[0] ?? "Freund"} folgt`,
    friends: count,
  }));
  return hints.length ? hints : DEMO_SOCIAL_MAP_HINTS;
}

export const getSocialMapHints = () => {
  if (!getSocialPrefs().show_on_social_map) return [];
  return cache.mapHints ?? DEMO_SOCIAL_MAP_HINTS;
};

export const getMutualFavoriteSpots = async (friendId) => {
  const friend = getFriends().find((f) => f.id === friendId);
  if (!friend) return [];

  if (!cache.remote) {
    return DEMO_COLLECTIONS[0].spotIds.map((id) => ({ id, name: id.replace("demo-", "") }));
  }

  const user = await getSessionUser();
  if (!user) return [];
  const { data: mine } = await supabase
    .from("collection_spots")
    .select("spot_id, collections!inner(owner_id)")
    .eq("collections.owner_id", user.id);
  const { data: theirs } = await supabase
    .from("collection_spots")
    .select("spot_id, collections!inner(owner_id)")
    .eq("collections.owner_id", friendId);
  const mySet = new Set((mine ?? []).map((r) => r.spot_id));
  const mutual = (theirs ?? []).filter((r) => mySet.has(r.spot_id)).map((r) => r.spot_id);
  if (!mutual.length) return [];
  const { data: spots } = await supabase.from("spots").select("id, name").in("id", mutual);
  return (spots ?? []).map((s) => ({ id: s.id, name: s.name }));
};

async function loadPrefsRemote(uid) {
  const { data, error } = await supabase
    .from("social_preferences")
    .select("*")
    .eq("user_id", uid)
    .maybeSingle();
  if (error && !isMissingTable(error)) console.warn("[social] prefs load", error.message);
  if (!data) return { ...DEFAULT_SOCIAL_PREFS };
  return {
    show_activity: data.show_activity,
    show_visited_spots: data.show_visited_spots,
    show_on_social_map: data.show_on_social_map,
    moments_visibility: data.moments_visibility,
    collections_default: data.collections_default,
    group_rewards: true,
  };
}

// ─── Realtime polls ──────────────────────────────────────────────────
export const subscribePoll = (pollId, cb) => {
  if (IS_LOCAL_MODE || !supabase || !cache.remote) return () => {};
  const channel = supabase
    .channel(`poll-${pollId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "group_poll_votes", filter: `poll_id=eq.${pollId}` },
      () => {
        hydrateSocial().then(() => cb?.());
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const activityIcon = (type) => {
  switch (type) {
    case "visit": return "📍";
    case "follow": return "❤️";
    case "reward": return "🎁";
    case "share": return "↗️";
    case "friends_like": return "👥";
    default: return "✨";
  }
};

export const formatActivityText = (item) => {
  switch (item.type) {
    case "visit":
      return `${item.user} war bei ${item.spot}`;
    case "follow":
      return `${item.user} folgt ${item.spot}`;
    case "reward":
      return `${item.user} hat ein Reward bei ${item.spot} eingelöst`;
    case "share":
      return `${item.user} empfiehlt ${item.spot}`;
    case "friends_like":
      return `${item.count} Freunde mögen ${item.spot}`;
    default:
      return item.spot || "Aktivität";
  }
};
