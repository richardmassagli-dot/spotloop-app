import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Gift, MapPin, Clock, Zap, Star, AlertTriangle } from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";

// Smart notification data — in production these come from Supabase realtime
const DEMO_NOTIFICATIONS = [
  {
    id: "n1",
    type: "reward_ready",
    icon: "🎁",
    color: "#F05830",
    title: "Reward einlösbar!",
    body: "Dein Kaffee-Reward bei Café Himmelblau wartet auf dich.",
    time: "Vor 2 Std.",
    spotId: "spot-cafe-himmelblau",
    unread: true,
    cta: "Jetzt einlösen",
  },
  {
    id: "n2",
    type: "birthday",
    icon: "🎂",
    color: "#D68A0C",
    title: "Happy Birthday! 🎉",
    body: "Gratis Gelato heute bei Gelato Amore — als Geburtstagsgeschenk von spotloop.",
    time: "Heute",
    spotId: "spot-gelato-amore",
    unread: true,
    cta: "Reward abholen",
  },
  {
    id: "n3",
    type: "nearby",
    icon: "📍",
    color: "#1B6CA8",
    title: "Lieblingsspot in der Nähe",
    body: "Café Himmelblau ist nur 180m entfernt. Du bist fast am Reward!",
    time: "Vor 45 Min.",
    spotId: "spot-cafe-himmelblau",
    unread: true,
    cta: null,
  },
  {
    id: "n4",
    type: "campaign",
    icon: "⚡",
    color: "#13B05C",
    title: "Happy Hour läuft",
    body: "Noch 90 Min. doppelte Punkte bei Café Himmelblau. Jetzt vorbeikommen!",
    time: "Vor 1 Std.",
    spotId: "spot-cafe-himmelblau",
    unread: false,
    cta: null,
  },
  {
    id: "n5",
    type: "close_to_reward",
    icon: "🏆",
    color: "#8B5CF6",
    title: "Noch 2 Stempel!",
    body: "Du bist nur noch 2 Punkte von deinem Brotlaib-Reward bei Bäckerei Morgenrot entfernt.",
    time: "Gestern",
    spotId: "spot-baeckerei-morgenrot",
    unread: false,
    cta: null,
  },
  {
    id: "n6",
    type: "reactivation",
    icon: "💌",
    color: "#F05830",
    title: "Wir vermissen dich",
    body: "Bistro Levin hat dich lange nicht gesehen. Komm zurück & erhalte einen Gratis-Espresso.",
    time: "Vor 2 Tagen",
    spotId: "spot-bistro-levin",
    unread: false,
    cta: "Angebot ansehen",
  },
];

const TYPE_LABEL = {
  reward_ready: "Reward",
  birthday: "Geburtstag",
  nearby: "In der Nähe",
  campaign: "Kampagne",
  close_to_reward: "Fast da!",
  reactivation: "Win-Back",
};

export default function NotificationCenter({ onClose, onSpotClick }) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");

  const unreadCount = notifications.filter(n => n.unread).length;

  const markRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, unread: false } : n));
  const dismiss  = (id) => setNotifications(ns => ns.filter(n => n.id !== id));
  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, unread: false })));

  const filtered = notifications.filter(n => {
    if (filter === "unread") return n.unread;
    if (filter === "rewards") return n.type === "reward_ready" || n.type === "close_to_reward";
    if (filter === "nearby") return n.type === "nearby" || n.type === "campaign";
    return true;
  });

  return (
    <div style={{ background: C.bg, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
              Benachrichtigungen
            </div>
            {unreadCount > 0 && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 2 }}>{unreadCount} ungelesen</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", borderRadius: 10, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                Alle gelesen
              </button>
            )}
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "10px 16px", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
        {[["all","Alle"],["unread","Ungelesen"],["rewards","Rewards"],["nearby","In der Nähe"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            style={{
              flexShrink: 0, borderRadius: 99, padding: "6px 14px",
              background: filter === id ? C.green : "transparent",
              border: `1.5px solid ${filter === id ? C.green : C.border}`,
              color: filter === id ? "#fff" : C.muted,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 32px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "52px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>Alles erledigt!</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Keine Benachrichtigungen in dieser Kategorie.</div>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 80, height: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { markRead(n.id); if (n.spotId && onSpotClick) onSpotClick(n.spotId); }}
                style={{
                  background: n.unread ? "#fff" : `${C.bg}`,
                  border: `1.5px solid ${n.unread ? `${n.color}30` : C.border}`,
                  borderRadius: 16, padding: "13px 14px", marginBottom: 10,
                  cursor: "pointer", position: "relative",
                  boxShadow: n.unread ? `0 4px 16px ${n.color}10` : `0 1px 6px rgba(6,13,8,.04)`,
                }}
              >
                {/* Unread dot */}
                {n.unread && (
                  <div style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: "50%", background: n.color }} />
                )}

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${n.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: n.unread ? 12 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{n.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: n.color, background: `${n.color}15`, borderRadius: 99, padding: "2px 7px", flexShrink: 0 }}>
                        {TYPE_LABEL[n.type]}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 6 }}>{n.body}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: C.muted }}>{n.time}</span>
                      {n.cta && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: n.color }}>{n.cta} →</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dismiss */}
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: C.muted, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0.7 }}
                >
                  <X size={10} color="#fff" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Smart notification info */}
        <div style={{ marginTop: 8, background: C.mintLight, border: `1px solid ${C.fresh}25`, borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.green, marginBottom: 4 }}>🧠 Intelligente Benachrichtigungen</div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
            spotloop sendet nur relevante Benachrichtigungen — passend zu deinen Besuchen, deiner Nähe und deinen Rewards. Nie Spam.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notification Bell Icon with badge ────────────────────────────────────────
export function NotificationBell({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ position: "relative", background: "#EFF6FF", border: `1px solid ${C.border}`, borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
    >
      <Bell size={18} color={C.blue || "#1B4FD8"} strokeWidth={2} />
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ position: "absolute", top: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "#F97316", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span style={{ fontSize: 8, fontWeight: 900, color: "#fff" }}>{count > 9 ? "9+" : count}</span>
        </motion.div>
      )}
    </button>
  );
}
