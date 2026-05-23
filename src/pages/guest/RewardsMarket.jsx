import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserStamps, getAllSpots, redeemStamp } from "../../lib/firestore";
import { C, ProgressBar, Spinner, CARD_GRADIENT } from "../../components/ui";
import { demoStamps, demoSpots } from "../../lib/demoData";

export default function RewardsMarket({ onSpotClick }) {
  const { user, profile } = useAuth();
  const [stamps, setStamps] = useState([]);
  const [allSpots, setAllSpots] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [filter, setFilter]     = useState("all"); // all | ready | progress

  const load = async () => {
    try {
      const [s, sp] = await Promise.all([getUserStamps(user.uid), getAllSpots()]);
      setStamps(s.length ? s : demoStamps);
      setAllSpots(sp.length ? sp : demoSpots);
    } catch {
      setStamps(demoStamps); setAllSpots(demoSpots);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user.uid]);

  const handleRedeem = async (stamp, e) => {
    e.stopPropagation();
    setRedeeming(stamp.spot_id);
    await redeemStamp(user.uid, stamp.spot_id);
    await load();
    setRedeeming(null);
  };

  const ready    = stamps.filter(s => s.reward_ready);
  const progress = stamps.filter(s => !s.reward_ready && s.points > 0);
  const discover = allSpots.filter(sp => !stamps.some(st => st.spot_id === sp.id));

  const shown = filter === "all" ? stamps : filter === "ready" ? ready : progress;

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 92 }}>
      {/* ── Header ── */}
      <div style={{ background: C.white, padding: "52px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.dark, letterSpacing: -0.5, marginBottom: 4 }}>Rewards</div>
        <div style={{ fontSize: 13, color: C.muted }}>Einlösbare Vorteile & Stempelkarten</div>
      </div>

      {/* ── Ready rewards banner ── */}
      {ready.length > 0 && (
        <div style={{ margin: "16px 20px 0", background: CARD_GRADIENT, borderRadius: 18, padding: "18px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 8px 28px ${C.shadowLg}` }}>
          <div style={{ fontSize: 36 }}>🎁</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
              {ready.length} Reward{ready.length > 1 ? "s"  : ""} einlösbar!
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
              Zeige sie dem Personal deines Lieblingsspots.
            </div>
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            ["all",      "Alle",        stamps.length],
            ["ready",    "Einlösbar",   ready.length],
            ["progress", "In Arbeit",   progress.length],
          ].map(([id, label, count]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                flex: 1, background: filter === id ? C.green : C.white,
                color: filter === id ? "#fff" : C.mid,
                border: `1.5px solid ${filter === id ? C.green : C.border}`,
                borderRadius: 10, padding: "8px 6px",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {label}
              <span style={{ marginLeft: 4, opacity: 0.7 }}>({count})</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={36} /></div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
              {filter === "ready" ? "Noch kein Reward einlösbar" : "Keine aktiven Karten"}
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
              Scanne QR-Codes um Stempel zu sammeln.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shown.map(stamp => (
              <RewardCard
                key={stamp.id}
                stamp={stamp}
                onPress={() => onSpotClick(stamp.spot_id)}
                onRedeem={(e) => handleRedeem(stamp, e)}
                redeeming={redeeming === stamp.spot_id}
              />
            ))}
          </div>
        )}

        {/* ── Discover new spots ── */}
        {discover.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Neue Spots entdecken</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Sammle bei diesen Spots deine erste Stempelkarte</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", margin: "0 -20px", padding: "0 20px 4px" }}>
              {discover.slice(0, 6).map(spot => (
                <DiscoverChip key={spot.id} spot={spot} onPress={() => onSpotClick(spot.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RewardCard({ stamp, onPress, onRedeem, redeeming }) {
  const spot = stamp.spot;
  const bg   = spot?.bg_color || C.green;
  const pct  = Math.round((stamp.points / stamp.max_points) * 100);

  return (
    <div
      onClick={onPress}
      style={{
        background: C.white, borderRadius: 18,
        border: `1.5px solid ${stamp.reward_ready ? C.orange : C.border}`,
        boxShadow: stamp.reward_ready ? `0 6px 20px ${C.orange}22` : `0 2px 10px ${C.shadow}`,
        overflow: "hidden", cursor: "pointer",
      }}
    >
      {/* Top color bar */}
      <div style={{ height: 4, background: stamp.reward_ready ? C.orange : `${bg}88` }} />

      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `${bg}1A`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}>
            {spot?.emoji || "🏪"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {spot?.name || stamp.spot_id}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{spot?.category}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {stamp.reward_ready
              ? <div style={{ background: C.orange, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 800 }}>🎁 Bereit!</div>
              : <div style={{ fontSize: 18, fontWeight: 900, color: C.green, letterSpacing: -1 }}>{stamp.points}<span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>/{stamp.max_points}</span></div>
            }
          </div>
        </div>

        {/* Progress */}
        <ProgressBar
          value={stamp.points}
          max={stamp.max_points}
          color={stamp.reward_ready ? C.orange : bg}
          height={6}
          bg={stamp.reward_ready ? "#FFF2EE" : `${bg}15`}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            {stamp.reward_ready
              ? <span style={{ color: C.orange, fontWeight: 700 }}>✨ {stamp.reward_text}</span>
              : <span>{stamp.max_points - stamp.points} Stempel bis: <strong style={{ color: C.dark }}>{stamp.reward_text}</strong></span>
            }
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{pct}%</div>
        </div>

        {stamp.reward_ready && (
          <button
            onClick={onRedeem}
            disabled={redeeming}
            style={{
              width: "100%", marginTop: 12,
              background: C.orange, color: "#fff", border: "none",
              borderRadius: 12, padding: "11px", fontSize: 13,
              fontWeight: 700, cursor: redeeming ? "not-allowed" : "pointer",
              opacity: redeeming ? 0.7 : 1,
              boxShadow: `0 4px 14px ${C.orange}44`,
            }}
          >
            {redeeming ? "Wird eingelöst…" : "🎁 Reward einlösen"}
          </button>
        )}
      </div>
    </div>
  );
}

function DiscoverChip({ spot, onPress }) {
  const bg = spot.bg_color || C.green;
  return (
    <div
      onClick={onPress}
      style={{
        minWidth: 120, borderRadius: 14,
        background: `${bg}14`, border: `1.5px solid ${bg}28`,
        padding: "12px 10px", cursor: "pointer", flexShrink: 0, textAlign: "center",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{spot.emoji || "🏪"}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{spot.name}</div>
      <div style={{ fontSize: 10, color: C.muted }}>{spot.max_points} Stempel</div>
    </div>
  );
}
