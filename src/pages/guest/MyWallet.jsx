import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserStamps, redeemStamp } from "../../lib/firestore";
import { C, PremiumCard, Spinner, CARD_GRADIENT } from "../../components/ui";
import StampCard from "../../components/stamp/StampCard";

export default function MyWallet({ onSpotClick, onLogout }) {
  const { user, profile } = useAuth();
  const [stamps, setStamps]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [selected, setSelected]   = useState(null);

  const load = async () => {
    const data = await getUserStamps(user.uid);
    setStamps(data); setLoading(false);
  };

  useEffect(() => { load(); }, [user.uid]);

  const handleRedeem = async (stamp, e) => {
    e.stopPropagation();
    setRedeeming(stamp.spot_id);
    await redeemStamp(user.uid, stamp.spot_id);
    await load();
    setRedeeming(null);
  };

  const totalPoints  = stamps.reduce((a, s) => a + s.points, 0);
  const readyRewards = stamps.filter(s => s.reward_ready);
  const totalVisits  = stamps.reduce((a, s) => a + s.points, 0);

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 92 }}>
      {/* ── Dark hero header ── */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -20, width: 180, height: 180, borderRadius: "50%", background: "rgba(19,176,92,.06)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, position: "relative" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>Meine Karte</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 2 }}>{profile?.name}</div>
          </div>
          <button
            onClick={onLogout}
            style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", borderRadius: 10, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
          >
            Abmelden
          </button>
        </div>

        {/* Card visual */}
        <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", backdropFilter: "blur(10px)", borderRadius: 20, padding: "22px 20px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.38)", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>PUNKTE</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: -2.5, lineHeight: 1 }}>{totalPoints.toLocaleString("de")}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 10, padding: "5px 12px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,.5)", letterSpacing: 1.5 }}>MEMBER</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { val: stamps.length,       label: "Stempelkarten" },
              { val: totalVisits,          label: "Besuche" },
              { val: readyRewards.length,  label: "Rewards" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px" }}>
        {/* Ready rewards banner */}
        {readyRewards.length > 0 && (
          <div style={{
            background: C.orangeLight, border: `1.5px solid ${C.orange}`,
            borderRadius: 14, padding: "12px 16px", marginBottom: 16,
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.orange }}>
                {readyRewards.length} Reward{readyRewards.length > 1 ? "s" : ""} einlösbar!
              </div>
              <div style={{ fontSize: 11, color: C.orange, opacity: 0.7 }}>Zeig sie dem Personal beim nächsten Besuch.</div>
            </div>
          </div>
        )}

        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>Stempelkarten</div>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{stamps.length} aktiv</div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={36} /></div>
        ) : stamps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Noch keine Stempelkarten</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
              Scanne den QR-Code eines Spots, um deine erste Stempelkarte zu erstellen.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stamps.map((stamp) => (
              <StampCard
                key={stamp.id}
                stamp={stamp}
                spot={stamp.spot}
                variant="full"
                onPress={() => onSpotClick(stamp.spot_id)}
                onRedeem={(e) => handleRedeem(stamp, e)}
                redeeming={redeeming === stamp.spot_id}
                showCta
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
