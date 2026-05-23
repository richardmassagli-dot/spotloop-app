import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, MessageCircle, Send } from "lucide-react";
import { C, Btn } from "../ui";
import { hydrateSocial, getFriends, shareSpotWithFriend, buildSpotShareLink } from "../../lib/social";

export default function ShareSpotSheet({ spot, open, onClose }) {
  const [message, setMessage] = useState("");
  const [friendId, setFriendId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [friends, setFriends] = useState(getFriends());

  useEffect(() => {
    if (!open) return;
    hydrateSocial().then(() => setFriends(getFriends()));
  }, [open]);

  if (!open || !spot) return null;

  const link = buildSpotShareLink(spot.id);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const sendToFriend = async () => {
    const f = friends.find((x) => x.id === friendId);
    if (!f) return;
    await shareSpotWithFriend(spot.id, spot.name, f.id, message);
    setMessage("");
    setFriendId(null);
    onClose?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(10,22,40,.45)", zIndex: 200,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 390, background: C.white,
            borderRadius: "24px 24px 0 0", padding: "12px 20px 32px",
            maxHeight: "85vh", overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.dark }}>Spot teilen</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{spot.name}</div>
            </div>
            <button type="button" onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer" }}>
              <X size={18} color={C.muted} />
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Kurze Empfehlung (optional)…"
            rows={2}
            style={{
              width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 14,
              padding: "12px 14px", fontSize: 14, resize: "none", marginBottom: 14,
            }}
          />

          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>An Freund senden</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
            {friends.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFriendId(f.id)}
                style={{
                  flexShrink: 0, borderRadius: 14, padding: "10px 12px",
                  border: `2px solid ${friendId === f.id ? C.green : C.border}`,
                  background: friendId === f.id ? "#EFF6FF" : C.white,
                  cursor: "pointer", fontSize: 11, fontWeight: 700, color: C.dark,
                }}
              >
                {f.avatar} {f.name.split(" ")[0]}
              </button>
            ))}
          </div>

          <Btn onClick={sendToFriend} disabled={!friendId} variant="dark" style={{ marginBottom: 10 }}>
            <Send size={16} /> Senden
          </Btn>

          <button
            type="button"
            onClick={copyLink}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "13px", borderRadius: 14, border: `1.5px solid ${C.border}`,
              background: C.bg, fontSize: 13, fontWeight: 700, color: C.dark, cursor: "pointer",
            }}
          >
            <Link2 size={16} />
            {copied ? "Link kopiert ✓" : "Link kopieren"}
          </button>

          <div style={{ marginTop: 12, fontSize: 11, color: C.muted, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <MessageCircle size={12} /> In-App · Link · persönliche Nachricht
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
