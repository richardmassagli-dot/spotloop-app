import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Gift, ChevronRight, X, Check, Clock, Zap, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUserStamps, redeemStamp } from "../../lib/firestore";
import { C, CARD_GRADIENT, Spinner, ProgressBar } from "../../components/ui";
import StampGrid from "../../components/stamp/StampSlots";
import { demoStamps, demoTransactions } from "../../lib/demoData";

const FOLLOW_KEY = "spotloop_followed";
const getLocalFollowed = () => { try { return JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]"); } catch { return []; } };

const FILTERS = ["Alle", "Einlösbar", "In Arbeit", "Läuft ab", "Neu"];

function daysUntilExpiry(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function expiryLabel(days) {
  if (days === null) return null;
  if (days <= 0) return "Abgelaufen";
  if (days <= 3) return `${days}T. verbleibend`;
  if (days <= 7) return `${days} Tage`;
  if (days <= 30) return `${days} Tage`;
  return null;
}

function expiryColor(days) {
  if (days === null || days > 30) return null;
  if (days <= 0) return "#9CA3AF";
  if (days <= 3) return C.orange;
  if (days <= 7) return "#D68A0C";
  return C.muted;
}

export default function WalletScreen({ onSpotClick }) {
  const { user, profile } = useAuth();
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Alle");
  const [selected, setSelected] = useState(null);
  const [redeeming, setRedeeming] = useState(null);
  const [redeemed, setRedeemed] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [followedIds, setFollowedIds] = useState(getLocalFollowed);

  useEffect(() => {
    const handler = () => setFollowedIds(getLocalFollowed());
    window.addEventListener("spotloop:follow", handler);
    return () => window.removeEventListener("spotloop:follow", handler);
  }, []);

  const load = async () => {
    try {
      const data = await getUserStamps(user.uid);
      setStamps(data.length ? data : demoStamps);
    } catch {
      setStamps(demoStamps);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user.uid]);

  const handleRedeem = async (stamp) => {
    setRedeeming(stamp.spot_id);
    try {
      await redeemStamp(user.uid, stamp.spot_id);
      setRedeemed(stamp.spot_id);
      setTimeout(() => { setRedeemed(null); setSelected(null); load(); }, 2400);
    } catch {
      setRedeeming(null);
    }
  };

  const totalStamps = stamps.reduce((a, s) => a + (s.points || 0), 0);
  const readyCount = stamps.filter(s => s.reward_ready).length;
  const expiringCount = stamps.filter(s => {
    const d = daysUntilExpiry(s.expires_at);
    return d !== null && d > 0 && d <= 30;
  }).length;

  const filtered = stamps.filter(s => {
    const matchQ = !query || s.spot?.name?.toLowerCase().includes(query.toLowerCase());
    const days = daysUntilExpiry(s.expires_at);
    const matchF =
      filter === "Alle" ? true :
      filter === "Einlösbar" ? s.reward_ready :
      filter === "In Arbeit" ? !s.reward_ready :
      filter === "Läuft ab" ? (days !== null && days <= 30) :
      filter === "Neu" ? s.points <= 1 : true;
    return matchQ && matchF;
  });

  return (
    <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* ── Hero Card ── */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 20px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <Blob top="-80px" right="-40px" size={240} opacity={0.03} />
        <Blob bottom="-60px" left="-20px" size={180} opacity={0.07} color="#13B05C" />

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, position: "relative" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: 2, fontWeight: 700, marginBottom: 3 }}>WALLET</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.8 }}>{profile?.name || "Meine Karten"}</div>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", borderRadius: 10, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
          >
            <Clock size={12} /> Verlauf
          </button>
        </div>

        {/* Premium card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.1)",
            backdropFilter: "blur(16px)",
            borderRadius: 22,
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: 2, fontWeight: 700, marginBottom: 3 }}>WALLET</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.8 }}>Stempel & Rewards</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 6 }}>Pro Spot — keine allgemeinen Punkte</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, paddingTop: 4 }}>
            {[
              { val: stamps.length, label: "Spots", icon: "📍" },
              { val: totalStamps, label: "Stempel", icon: "⭐" },
              { val: readyCount, label: "Rewards", icon: "🎁", highlight: readyCount > 0 },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.highlight ? "#7BDFAA" : "#fff", letterSpacing: -0.5 }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>{s.icon} {s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ready banner */}
        {readyCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 12, background: `${C.orange}22`, border: `1px solid ${C.orange}44`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}
          >
            <span style={{ fontSize: 20 }}>🎁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {readyCount} Reward{readyCount > 1 ? "s" : ""} einlösbar!
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>Zeig die Karte beim nächsten Besuch.</div>
            </div>
            <ChevronRight size={16} color="rgba(255,255,255,.4)" />
          </motion.div>
        )}

        {/* Expiry warning banner */}
        {expiringCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginTop: 8, background: "rgba(214,138,12,.18)", border: "1px solid rgba(214,138,12,.4)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}
          >
            <AlertTriangle size={18} color="#D68A0C" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {expiringCount} Karte{expiringCount > 1 ? "n laufen" : " läuft"} bald ab
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>Einlösen, bevor sie verfallen.</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Search & Filter ── */}
      <div style={{ padding: "14px 16px 0", flexShrink: 0, background: C.bg }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={15} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Karte suchen…"
            style={{
              width: "100%", background: C.white, border: `1.5px solid ${C.border}`,
              borderRadius: 12, padding: "10px 12px 10px 36px",
              fontSize: 14, color: C.dark, outline: "none", fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {FILTERS.map(f => {
            const badge =
              f === "Einlösbar" && readyCount > 0 ? readyCount :
              f === "Läuft ab" && expiringCount > 0 ? expiringCount : null;
            const isWarn = f === "Läuft ab";
            const activeColor = isWarn ? "#D68A0C" : C.green;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flexShrink: 0, borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${filter === f ? activeColor : C.border}`,
                  background: filter === f ? activeColor : C.white,
                  color: filter === f ? "#fff" : C.muted,
                  cursor: "pointer", transition: "all .15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                {f}
                {badge !== null && (
                  <span style={{
                    background: filter === f ? "rgba(255,255,255,.25)" : (isWarn ? "#D68A0C" : C.orange),
                    color: "#fff",
                    borderRadius: 99, fontSize: 10, fontWeight: 800,
                    padding: "1px 6px", lineHeight: "16px",
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cards ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 92px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Spinner size={36} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState query={query} filter={filter} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((stamp, i) => (
              <motion.div
                key={stamp.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelected(stamp)}
              >
                <WalletCard stamp={stamp} onRedeem={(e) => { e.stopPropagation(); setSelected(stamp); }} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Card Detail Sheet ── */}
      <AnimatePresence>
        {selected && (
          <CardDetailSheet
            stamp={selected}
            redeeming={redeeming === selected.spot_id}
            redeemed={redeemed === selected.spot_id}
            onClose={() => { setSelected(null); setRedeeming(null); }}
            onRedeem={() => handleRedeem(selected)}
            onSpotClick={() => { setSelected(null); onSpotClick?.(selected.spot_id); }}
          />
        )}
      </AnimatePresence>

      {/* ── Transaction History Sheet ── */}
      <AnimatePresence>
        {showHistory && (
          <HistorySheet onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Wallet Card ───────────────────────────────────────────────────────────────
function WalletCard({ stamp }) {
  const spot    = stamp.spot;
  const bg      = spot?.bg_color || C.green;
  const days    = daysUntilExpiry(stamp.expires_at);
  const expLbl  = expiryLabel(days);
  const expClr  = expiryColor(days);
  const urgentExpiry = days !== null && days <= 7 && days > 0;
  const expired = days !== null && days <= 0;

  return (
    <div style={{
      background: expired ? "#F9F9F9" : C.white,
      borderRadius: 20,
      border: `1.5px solid ${
        expired ? "#E5E7EB" :
        urgentExpiry ? `${C.orange}60` :
        stamp.reward_ready ? `${C.orange}60` : C.border
      }`,
      boxShadow: expired ? "none" :
        stamp.reward_ready || urgentExpiry
          ? `0 8px 28px ${C.orange}18`
          : `0 3px 14px rgba(6,13,8,.07)`,
      overflow: "hidden", cursor: expired ? "default" : "pointer",
      opacity: expired ? 0.65 : 1,
      transition: "box-shadow .2s, transform .15s",
    }}>
      {/* Expiry urgency strip */}
      {urgentExpiry && (
        <div style={{ background: days <= 3 ? `${C.orange}15` : "rgba(214,138,12,.1)", padding: "5px 16px", display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={11} color={expClr} />
          <span style={{ fontSize: 10, fontWeight: 800, color: expClr }}>
            Reward verfällt in {days === 1 ? "1 Tag" : `${days} Tagen`} — jetzt einlösen!
          </span>
        </div>
      )}
      {expired && (
        <div style={{ background: "#F3F4F6", padding: "5px 16px", display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={11} color="#9CA3AF" />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF" }}>Reward abgelaufen</span>
        </div>
      )}

      {/* Colored strip */}
      <div style={{ height: 60, background: `linear-gradient(90deg, ${bg}22, ${bg}08)`, display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: `${bg}22`, border: `1.5px solid ${bg}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
          {spot?.emoji || "🏪"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {spot?.name || stamp.spot_id}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            {spot?.category}{spot?.area ? ` · ${spot.area}` : ""}
          </div>
        </div>
        {stamp.reward_ready ? (
          <div style={{ background: C.orange, color: "#fff", borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
            🎁 Bereit
          </div>
        ) : (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: bg, letterSpacing: -0.5 }}>
              {stamp.points}<span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>/{stamp.max_points}</span>
            </div>
            {expLbl && !urgentExpiry && (
              <div style={{ fontSize: 9, fontWeight: 700, color: expClr, marginTop: 1 }}>⏳ {expLbl}</div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "12px 16px 14px" }}>
        <StampGrid pts={stamp.points} max={stamp.max_points} color={stamp.reward_ready ? C.orange : bg} />
        <div style={{ marginTop: 10 }}>
          <ProgressBar value={stamp.points} max={stamp.max_points} color={stamp.reward_ready ? C.orange : bg} height={5} bg={`${bg}15`} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            {stamp.reward_ready
              ? <span style={{ color: C.orange, fontWeight: 700 }}>✨ {stamp.reward_text} bereit!</span>
              : expired
              ? <span style={{ color: "#9CA3AF" }}>Reward abgelaufen</span>
              : <span>{stamp.max_points - stamp.points} weitere bis: <strong style={{ color: C.dark }}>{stamp.reward_text}</strong></span>
            }
          </div>
          {stamp.last_visit && (
            <div style={{ fontSize: 10, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={10} />
              {stamp.last_visit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card Detail Sheet ─────────────────────────────────────────────────────────
function CardDetailSheet({ stamp, redeeming, redeemed, onClose, onRedeem, onSpotClick }) {
  const spot  = stamp.spot;
  const bg    = spot?.bg_color || C.green;
  const pct   = stamp.points / stamp.max_points;
  const days  = daysUntilExpiry(stamp.expires_at);
  const expLbl = expiryLabel(days);
  const expClr = expiryColor(days);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 420 }}
        style={{ background: C.white, borderRadius: "26px 26px 0 0", width: "100%", maxWidth: 390, margin: "0 auto", overflow: "hidden", maxHeight: "90vh" }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: "10px auto 0" }} />

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${bg}22, ${bg}08)`, padding: "16px 20px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${bg}25`, border: `2px solid ${bg}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {spot?.emoji || "🏪"}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.dark, letterSpacing: -0.5 }}>{spot?.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{spot?.category} · {spot?.area}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: `${bg}15`, border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted }}>
              <X size={16} />
            </button>
          </div>

          {/* Circular progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
              <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={40} cy={40} r={34} fill="none" stroke={`${bg}20`} strokeWidth={7} />
                <circle
                  cx={40} cy={40} r={34} fill="none"
                  stroke={stamp.reward_ready ? C.orange : bg}
                  strokeWidth={7}
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: stamp.reward_ready ? C.orange : bg, lineHeight: 1 }}>{stamp.points}</div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>/{stamp.max_points}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {stamp.reward_ready ? (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.orange, marginBottom: 4 }}>🎉 Reward bereit!</div>
                  <div style={{ fontSize: 13, color: C.dark, fontWeight: 700 }}>{stamp.reward_text}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Beim Personal einlösen.</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 4 }}>
                    Nächster Reward:
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: bg }}>{stamp.reward_text}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                    Noch <strong style={{ color: C.dark }}>{stamp.max_points - stamp.points}</strong> Stempel bis: <strong style={{ color: C.dark }}>{stamp.reward_text}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stamp grid */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ marginBottom: 14 }}>
            <StampGrid pts={stamp.points} max={stamp.max_points} color={stamp.reward_ready ? C.orange : bg} />
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Besuche", val: stamp.total_checkins || stamp.points, icon: "📍" },
              { label: "Mitglied seit", val: stamp.created_at?.slice(0, 7) || "–", icon: "📅" },
              { label: "Letzter Besuch", val: stamp.last_visit || "–", icon: "🕐" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{s.val}</div>
                <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Expiry warning */}
          {expLbl && (
            <div style={{
              background: days <= 3 ? `${C.orange}10` : "rgba(214,138,12,.08)",
              border: `1px solid ${expClr}35`,
              borderRadius: 12, padding: "10px 14px", marginBottom: 12,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <AlertTriangle size={14} color={expClr} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: expClr }}>
                  {days <= 0 ? "Reward abgelaufen" : `Verfällt in ${days === 1 ? "1 Tag" : `${days} Tagen`}`}
                </span>
                {stamp.expires_at && (
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
                    Ablaufdatum: {new Date(stamp.expires_at).toLocaleDateString("de-DE")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current action banner */}
          {spot?.current_action && (
            <div style={{ background: `${bg}10`, border: `1px solid ${bg}25`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
              <Zap size={14} color={bg} />
              <span style={{ fontSize: 12, fontWeight: 700, color: bg }}>{spot.current_action}</span>
            </div>
          )}

          {/* CTA Buttons */}
          {stamp.reward_ready && (
            <button
              onClick={onRedeem}
              disabled={redeeming || redeemed}
              style={{
                width: "100%", marginBottom: 10,
                background: redeemed ? C.fresh : C.orange,
                color: "#fff", border: "none", borderRadius: 14,
                padding: "14px", fontSize: 14, fontWeight: 800,
                cursor: redeeming || redeemed ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: `0 6px 20px ${C.orange}40`,
                transition: "background .3s",
              }}
            >
              {redeemed ? <><Check size={16} /> Eingelöst!</> :
               redeeming ? "Wird eingelöst…" :
               <><Gift size={16} /> {stamp.reward_text} einlösen</>}
            </button>
          )}
          <button
            onClick={onSpotClick}
            style={{
              width: "100%",
              background: "none", border: `1.5px solid ${C.border}`,
              borderRadius: 14, padding: "12px", fontSize: 13,
              fontWeight: 700, color: C.dark, cursor: "pointer",
            }}
          >
            Spot-Details ansehen →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── History Sheet ─────────────────────────────────────────────────────────────
function HistorySheet({ onClose }) {
  const typeStyle = {
    checkin: { color: C.fresh, label: "+", bg: C.mintLight },
    redeem: { color: C.orange, label: "−", bg: `${C.orange}10` },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 420 }}
        style={{ background: C.white, borderRadius: "26px 26px 0 0", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "75vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: "10px auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.dark }}>Verlauf</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><X size={18} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: "12px 20px 32px" }}>
          {demoTransactions.map((t, i) => {
            const style = typeStyle[t.type] || typeStyle.checkin;
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < demoTransactions.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: style.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {t.type === "checkin" ? "📍" : "🎁"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.spot}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{t.description}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: style.color }}>
                    {t.points > 0 ? `+${t.points}` : t.points} Stempel
                  </div>
                  <div style={{ fontSize: 10, color: C.muted }}>{t.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ query, filter }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{query ? "🔍" : filter !== "Alle" ? "📭" : "💳"}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        {query ? `Keine Karte für "${query}"` : filter !== "Alle" ? `Keine ${filter} Karten` : "Noch keine Stempelkarten"}
      </div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
        {query ? "Versuche einen anderen Suchbegriff." : "Scanne den QR-Code eines Spots, um deine erste Karte zu erstellen."}
      </div>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function Blob({ top, right, bottom, left, size, opacity, color = "#fff" }) {
  return (
    <div style={{
      position: "absolute", top, right, bottom, left,
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      opacity,
      pointerEvents: "none",
    }} />
  );
}
