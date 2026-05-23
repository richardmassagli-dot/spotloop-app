import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { C, Btn } from "../ui";
import {
  getGuestThreadAtSpot,
  sendGuestMessageToSpot,
  markGuestThreadRead,
} from "../../lib/spotMessages";
import { formatDbError } from "../../lib/firestore";

export default function SpotMessageSheet({ open, onClose, spot, guestUserId }) {
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const spotId = spot?.id;

  const reload = async () => {
    if (!spotId || !guestUserId) return;
    setLoading(true);
    try {
      const { thread_id, messages: rows } = await getGuestThreadAtSpot(guestUserId, spotId);
      setThreadId(thread_id);
      setMessages(rows);
      if (thread_id) await markGuestThreadRead(guestUserId, thread_id);
    } catch (e) {
      setError(formatDbError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && spotId) reload();
  }, [open, spotId, guestUserId]);

  const send = async () => {
    if (!text.trim() || !spotId) return;
    setSending(true);
    setError("");
    try {
      await sendGuestMessageToSpot(guestUserId, spotId, text, threadId);
      setText("");
      await reload();
      window.dispatchEvent(new Event("spotloop:spot-message"));
    } catch (e) {
      setError(formatDbError(e));
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(6,13,8,.45)",
          zIndex: 400,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 480,
            maxHeight: "78vh",
            background: C.white,
            borderRadius: "20px 20px 0 0",
            display: "flex",
            flexDirection: "column",
            boxShadow: `0 -8px 40px ${C.shadowLg}`,
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${spot?.bg_color || C.green}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {spot?.emoji || "💬"}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Nachricht an {spot?.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Der Spot kann dir antworten</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: C.bg,
                border: "none",
                borderRadius: 10,
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color={C.muted} />
            </button>
          </div>

          <div className="scroll-y" style={{ flex: 1, padding: "14px 16px", minHeight: 120 }}>
            {loading ? (
              <div style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: 24 }}>Laden…</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 8px" }}>
                <MessageCircle size={32} color={C.muted} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>Noch kein Gespräch</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.45 }}>
                  Frage zu Öffnungszeiten, Reservierung oder deiner Stempelkarte — der Spot antwortet dir hier.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m) => {
                  const isGuest = m.sender === "guest";
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isGuest ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        background: isGuest ? C.mintLight : C.bg,
                        border: `1px solid ${isGuest ? C.green + "35" : C.border}`,
                        borderRadius: isGuest ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 4 }}>
                        {isGuest ? "Du" : spot?.name || "Spot"}
                      </div>
                      <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.45 }}>{m.body}</div>
                    </div>
                  );
                })}
              </div>
            )}
            {error && (
              <div style={{ fontSize: 12, color: C.orange, marginTop: 10, fontWeight: 600 }}>{error}</div>
            )}
          </div>

          <div style={{ padding: "12px 16px 20px", borderTop: `1px solid ${C.border}`, background: C.white }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="Deine Nachricht…"
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1.5px solid ${text.trim() ? C.green : C.border}`,
                fontSize: 14,
                fontFamily: "inherit",
                resize: "none",
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />
            <Btn onClick={send} disabled={!text.trim() || sending} variant="dark" style={{ width: "100%" }}>
              <Send size={16} /> {sending ? "Senden…" : threadId ? "Antworten" : "Nachricht senden"}
            </Btn>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
