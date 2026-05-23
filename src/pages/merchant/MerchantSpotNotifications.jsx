import { useState, useEffect, useCallback, useMemo } from "react";
import { Bell, BellOff, Send, ChevronRight } from "lucide-react";
import { C, Card, Alert } from "../../components/ui";
import MerchantSubBack from "../../components/merchant/MerchantSubBack";
import {
  getMerchantMessageThreads,
  replyMerchantToGuest,
  markMerchantThreadRead,
  merchantUnreadCount,
} from "../../lib/spotMessages";
import { formatDbError } from "../../lib/firestore";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MerchantSpotNotifications({ spotId, spot }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [reply, setReply] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [sending, setSending] = useState(false);

  const unreadThreads = useMemo(() => threads.filter((t) => t.unread), [threads]);
  const unread = unreadThreads.length;

  const reload = useCallback(async () => {
    try {
      const list = await getMerchantMessageThreads(spotId);
      setThreads(list);
      setActiveThread((prev) => {
        if (!prev) return null;
        return list.find((t) => t.thread_id === prev.thread_id) || null;
      });
    } catch (e) {
      setLoadErr(formatDbError(e));
    } finally {
      setLoading(false);
    }
  }, [spotId]);

  useEffect(() => {
    reload();
    const onMsg = () => reload();
    window.addEventListener("spotloop:spot-message", onMsg);
    return () => window.removeEventListener("spotloop:spot-message", onMsg);
  }, [reload]);

  const pickThread = (thread) => {
    setActiveThread(thread);
    setOpenChat(true);
    setReply("");
    if (thread.unread) {
      markMerchantThreadRead(spotId, thread.thread_id).then(reload).catch(() => {});
    }
  };

  const openNewestUnread = () => {
    const t = unreadThreads[0];
    if (t) pickThread(t);
  };

  const sendReply = async () => {
    if (!activeThread || !reply.trim()) return;
    setSending(true);
    setLoadErr("");
    try {
      await replyMerchantToGuest(
        spotId,
        activeThread.thread_id,
        activeThread.guest_user_id,
        reply.trim()
      );
      setReply("");
      await reload();
      window.dispatchEvent(new Event("spotloop:spot-message"));
    } catch (e) {
      setLoadErr(formatDbError(e));
    } finally {
      setSending(false);
    }
  };

  const closeChat = () => {
    setOpenChat(false);
    setActiveThread(null);
    setReply("");
    reload();
  };

  if (openChat && activeThread) {
    const latestGuest = [...activeThread.messages].reverse().find((m) => m.sender === "guest");

    return (
      <div>
        <MerchantSubBack
          title="Nachricht beantworten"
          subtitle={activeThread.guest_name}
          onBack={closeChat}
        />

        {loadErr && (
          <div style={{ marginBottom: 12 }}>
            <Alert type="error">{loadErr}</Alert>
          </div>
        )}

        <Card style={{ padding: 14, marginBottom: 14, background: C.mintLight, border: `1.5px solid ${C.green}35` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 6 }}>Nachricht vom Gast</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 6 }}>{activeThread.guest_name}</div>
          <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.5 }}>
            {latestGuest?.body || activeThread.preview}
          </div>
          {latestGuest?.created_at && (
            <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>{formatTime(latestGuest.created_at)}</div>
          )}
        </Card>

        {activeThread.messages.filter((m) => m.sender === "merchant").length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Dein Verlauf</div>
            {activeThread.messages
              .filter((m) => m.sender === "merchant")
              .map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: "flex-end",
                    maxWidth: "88%",
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: "14px 14px 4px 14px",
                    padding: "10px 12px",
                    marginBottom: 8,
                    marginLeft: "auto",
                  }}
                >
                  <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.45 }}>{m.body}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{formatTime(m.created_at)}</div>
                </div>
              ))}
          </div>
        )}

        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Antworten</div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value.slice(0, 500))}
            placeholder="Deine Antwort…"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: `1.5px solid ${reply.trim() ? C.green : C.border}`,
              fontSize: 13,
              fontFamily: "inherit",
              resize: "none",
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={sendReply}
            disabled={!reply.trim() || sending}
            style={{
              width: "100%",
              background: reply.trim() ? C.green : C.border,
              color: reply.trim() ? "#fff" : C.muted,
              border: "none",
              borderRadius: 12,
              padding: "12px",
              fontSize: 14,
              fontWeight: 800,
              cursor: reply.trim() && !sending ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Send size={15} /> {sending ? "Senden…" : "Antwort senden"}
          </button>
        </Card>

        {unread > 1 && unreadThreads.some((t) => t.thread_id !== activeThread.thread_id) && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8 }}>
              Weitere neue Nachrichten
            </div>
            {unreadThreads
              .filter((t) => t.thread_id !== activeThread.thread_id)
              .map((t) => (
                <button
                  key={t.thread_id}
                  type="button"
                  onClick={() => pickThread(t)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "10px 12px",
                    marginBottom: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.dark,
                  }}
                >
                  {t.guest_name}: {t.preview.slice(0, 60)}
                </button>
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Benachrichtigungen</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.45 }}>
        Hier siehst du nur, ob eine neue Gäste-Nachricht für deinen Spot da ist.
      </div>

      {loadErr && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="error">{loadErr}</Alert>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 32, fontSize: 13, color: C.muted }}>Laden…</div>
      ) : threads.length === 0 ? (
        <Card style={{ padding: "28px 20px", textAlign: "center" }}>
          <BellOff size={32} color={C.muted} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Noch keine Nachrichten</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
            Gäste können dir über die Spot-Seite schreiben.
          </div>
        </Card>
      ) : unread > 0 ? (
        <button
          type="button"
          onClick={openNewestUnread}
          style={{
            width: "100%",
            textAlign: "left",
            background: `linear-gradient(145deg, ${C.mintLight} 0%, ${C.white} 100%)`,
            border: `2px solid ${C.green}`,
            borderRadius: 20,
            padding: "20px 18px",
            cursor: "pointer",
            boxShadow: `0 8px 24px ${C.green}20`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: C.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Bell size={26} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.dark }}>
                {unread === 1 ? "Neue Nachricht" : `${unread} neue Nachrichten`}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                Von {unreadThreads[0]?.guest_name || "einem Gast"} — tippen zum Antworten
              </div>
            </div>
            <ChevronRight size={22} color={C.green} />
          </div>
        </button>
      ) : (
        <Card style={{ padding: "24px 18px", textAlign: "center", background: C.white }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: C.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <BellOff size={28} color={C.muted} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>Keine neuen Nachrichten</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
            Alles gelesen — du wirst informiert, sobald ein Gast schreibt.
          </div>
        </Card>
      )}
    </div>
  );
}
