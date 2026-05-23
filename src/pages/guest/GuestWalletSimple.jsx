import { useState, useEffect } from "react";
import { ScanLine } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUserStamps, redeemStamp } from "../../lib/firestore";
import { C, Spinner } from "../../components/ui";
import StackedStampCards from "../../components/stamp/StackedStampCards";
import { incrementRedeemedCount } from "../../lib/guestStats";

export default function GuestWalletSimple({ onSpotClick, onScan }) {
  const { user } = useAuth();
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  const load = async () => {
    try {
      setStamps(await getUserStamps(user.uid));
    } catch {
      setStamps([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user.uid]);

  const handleRedeem = async (stamp, e) => {
    e?.stopPropagation?.();
    if (!stamp?.reward_ready) return;
    setRedeeming(stamp.spot_id);
    try {
      await redeemStamp(user.uid, stamp.spot_id);
      incrementRedeemedCount(user.uid);
      await load();
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 100 }}>
      <div style={{ padding: "52px 20px 16px" }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>WALLET</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: C.dark, letterSpacing: -0.6 }}>
          Deine Treue-Karten
        </h1>
      </div>

      <div style={{ padding: "0 18px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spinner size={36} />
          </div>
        ) : stamps.length === 0 ? (
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              padding: "48px 24px",
              background: C.white,
              borderRadius: 22,
              border: `1.5px dashed ${C.border}`,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.dark, marginBottom: 8 }}>
              Scan deinen ersten Spot
            </div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 20 }}>
              Halte den QR-Code an der Theke ins Feld — deine Treue-Karte landet automatisch hier.
            </p>
            {onScan && (
              <button
                type="button"
                onClick={onScan}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 22px",
                  borderRadius: 14,
                  border: "none",
                  background: C.green,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <ScanLine size={18} />
                QR scannen
              </button>
            )}
          </div>
        ) : (
          <StackedStampCards
            stamps={stamps}
            onSpotClick={onSpotClick}
            onRedeem={handleRedeem}
            redeeming={redeeming}
            showCta
            emptyMessage="Scan deinen ersten Spot"
          />
        )}
      </div>
    </div>
  );
}
