import { supabase } from "./supabase";
import { localSpotMessages } from "./localStore";
import { IS_LOCAL_MODE } from "./config";

const LOCAL = IS_LOCAL_MODE;

const ensureSupabase = () => {
  if (!supabase) throw new Error("Supabase ist nicht konfiguriert.");
  return supabase;
};

async function fetchGuestNames(userIds) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return {};
  if (LOCAL) {
    try {
      const users = JSON.parse(localStorage.getItem("local_users") || "{}");
      return Object.fromEntries(
        ids.map((id) => {
          const u = users[id];
          return [id, u?.name || u?.email?.split("@")[0] || "Gast"];
        })
      );
    } catch {
      return {};
    }
  }
  const db = ensureSupabase();
  const { data } = await db.from("social_profiles").select("user_id, display_name").in("user_id", ids);
  const map = {};
  for (const row of data ?? []) {
    map[row.user_id] = row.display_name || "Gast";
  }
  for (const id of ids) {
    if (!map[id]) map[id] = `Gast · ${String(id).slice(0, 6)}`;
  }
  return map;
}

function groupThreads(rows, spotId, names = {}) {
  const byThread = new Map();
  for (const m of rows) {
    if (m.spot_id !== spotId) continue;
    const tid = m.thread_id;
    if (!byThread.has(tid)) {
      byThread.set(tid, {
        thread_id: tid,
        spot_id: m.spot_id,
        guest_user_id: m.guest_user_id,
        guest_name: names[m.guest_user_id] || "Gast",
        messages: [],
        unread: false,
        updated_at: m.created_at,
      });
    }
    const t = byThread.get(tid);
    t.messages.push(m);
    if (m.sender === "guest" && !m.merchant_read) t.unread = true;
    if (new Date(m.created_at) > new Date(t.updated_at)) t.updated_at = m.created_at;
  }
  const threads = [...byThread.values()].map((t) => {
    t.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const last = t.messages[t.messages.length - 1];
    t.preview = last?.body?.slice(0, 120) || "";
    t.last_sender = last?.sender;
    return t;
  });
  threads.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  return threads;
}

/** Gast sendet erste Nachricht oder Antwort im Thread */
export async function sendGuestMessageToSpot(guestUserId, spotId, body, threadId = null) {
  const text = (body || "").trim();
  if (!text) throw new Error("Bitte eine Nachricht eingeben.");

  if (LOCAL) {
    if (threadId) return localSpotMessages.replyGuestInThread(spotId, guestUserId, threadId, text);
    return localSpotMessages.sendGuest(spotId, guestUserId, text);
  }

  const db = ensureSupabase();
  if (threadId) {
    const { data, error } = await db
      .from("spot_messages")
      .insert({
        spot_id: spotId,
        guest_user_id: guestUserId,
        thread_id: threadId,
        sender: "guest",
        body: text,
        merchant_read: false,
        guest_read: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const newThreadId = crypto.randomUUID?.() ?? `thread-${Date.now()}`;
  const { data, error } = await db
    .from("spot_messages")
    .insert({
      spot_id: spotId,
      guest_user_id: guestUserId,
      thread_id: newThreadId,
      sender: "guest",
      body: text,
      merchant_read: false,
      guest_read: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Merchant antwortet im Thread */
export async function replyMerchantToGuest(spotId, threadId, guestUserId, body) {
  const text = (body || "").trim();
  if (!text) throw new Error("Bitte eine Antwort eingeben.");

  if (LOCAL) {
    return localSpotMessages.replyMerchant(spotId, guestUserId, threadId, text);
  }

  const db = ensureSupabase();
  const { data, error } = await db
    .from("spot_messages")
    .insert({
      spot_id: spotId,
      guest_user_id: guestUserId,
      thread_id: threadId,
      sender: "merchant",
      body: text,
      merchant_read: true,
      guest_read: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMerchantMessageThreads(spotId) {
  if (LOCAL) {
    const rows = localSpotMessages.forSpot(spotId);
    const names = await fetchGuestNames(rows.map((r) => r.guest_user_id));
    return groupThreads(rows, spotId, names);
  }

  const db = ensureSupabase();
  const { data, error } = await db
    .from("spot_messages")
    .select("*")
    .eq("spot_id", spotId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const names = await fetchGuestNames((data ?? []).map((r) => r.guest_user_id));
  return groupThreads(data ?? [], spotId, names);
}

export async function getGuestThreadAtSpot(guestUserId, spotId) {
  if (LOCAL) {
    const rows = localSpotMessages
      .forGuest(guestUserId)
      .filter((m) => m.spot_id === spotId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (!rows.length) return { thread_id: null, messages: [] };
    const thread_id = rows[0].thread_id;
    return { thread_id, messages: rows.filter((m) => m.thread_id === thread_id) };
  }

  const db = ensureSupabase();
  const { data, error } = await db
    .from("spot_messages")
    .select("*")
    .eq("spot_id", spotId)
    .eq("guest_user_id", guestUserId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return { thread_id: null, messages: [] };
  const thread_id = rows[rows.length - 1].thread_id;
  return {
    thread_id,
    messages: rows.filter((m) => m.thread_id === thread_id),
  };
}

export async function markMerchantThreadRead(spotId, threadId) {
  if (LOCAL) {
    localSpotMessages.markMerchantRead(spotId, threadId);
    return;
  }
  const db = ensureSupabase();
  await db
    .from("spot_messages")
    .update({ merchant_read: true })
    .eq("spot_id", spotId)
    .eq("thread_id", threadId)
    .eq("sender", "guest");
}

export async function markGuestThreadRead(guestUserId, threadId) {
  if (LOCAL) {
    localSpotMessages.markGuestRead(guestUserId, threadId);
    return;
  }
  const db = ensureSupabase();
  await db
    .from("spot_messages")
    .update({ guest_read: true })
    .eq("guest_user_id", guestUserId)
    .eq("thread_id", threadId)
    .eq("sender", "merchant");
}

export function merchantUnreadCount(threads) {
  return (threads ?? []).filter((t) => t.unread).length;
}

/** Alerts für My Spots wenn Spot geantwortet hat */
export async function getGuestSpotReplyAlerts(guestUserId, spotsById = {}) {
  let rows = [];
  if (LOCAL) {
    rows = localSpotMessages.forGuest(guestUserId).filter((m) => m.sender === "merchant" && !m.guest_read);
  } else {
    const db = ensureSupabase();
    const { data, error } = await db
      .from("spot_messages")
      .select("*")
      .eq("guest_user_id", guestUserId)
      .eq("sender", "merchant")
      .eq("guest_read", false)
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[spotMessages] guest alerts", error.message);
      return [];
    }
    rows = data ?? [];
  }

  const seen = new Set();
  const alerts = [];
  for (const m of rows) {
    if (seen.has(m.thread_id)) continue;
    seen.add(m.thread_id);
    const spot = spotsById[m.spot_id] || {};
    alerts.push({
      id: `spot-reply-${m.thread_id}`,
      type: "spot_reply",
      icon: spot.emoji || "💬",
      color: spot.bg_color || "#1B4FD8",
      title: `${spot.name || "Spot"} hat geantwortet`,
      body: m.body?.slice(0, 140) || "Neue Nachricht",
      time: m.created_at
        ? new Date(m.created_at).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "Neu",
      spotId: m.spot_id,
      threadId: m.thread_id,
      unread: true,
      cta: "Antwort lesen",
    });
  }
  return alerts;
}

export function mapSpotReplyToFeedItem(alert, spot = null) {
  return {
    id: alert.id,
    spot_id: alert.spotId,
    spot_name: spot?.name || "Spot",
    spot_emoji: spot?.emoji || alert.icon,
    spot_bg: spot?.bg_color || alert.color,
    update_type: "post",
    title: alert.title,
    description: alert.body,
    time_label: alert.time,
    published_at: new Date().toISOString(),
    is_new: true,
    badge_label: "Antwort",
    cta: "spot_open",
    _spotMessage: true,
    threadId: alert.threadId,
  };
}
