import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUserStamps, getAllSpots } from "../../lib/firestore";
import { C, Spinner } from "../../components/ui";
import HomeHero from "../../components/guest/HomeHero";
import HomeNearbySection from "../../components/guest/HomeNearbySection";
import SectionHeader from "../../components/guest/SectionHeader";
import StackedStampCards from "../../components/stamp/StackedStampCards";
import { mergeSpots } from "../../lib/demoData";
import { resolveUserPosition, sortSpotsByDistance, DEFAULT_MAP_CENTER } from "../../lib/nearbySpots";
import { getLastVisitStamp, formatVisitLabel } from "../../lib/guestStats";

const NEARBY_LIMIT = 3;
const STAMP_PREVIEW_LIMIT = 3;

export default function Home({ onSpotClick, onCheckin, onDiscover, onWallet }) {
  const { user, profile } = useAuth();
  const [stamps, setStamps] = useState([]);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    resolveUserPosition().then(setUserPos);
  }, []);

  useEffect(() => {
    Promise.all([getUserStamps(user.uid), getAllSpots()])
      .then(([s, sp]) => {
        setStamps(s ?? []);
        setSpots(mergeSpots(sp ?? []));
        setLoading(false);
      })
      .catch(() => {
        setStamps([]);
        setSpots([]);
        setLoading(false);
      });
  }, [user.uid]);

  const stampBySpotId = useMemo(() => Object.fromEntries(stamps.map((s) => [s.spot_id, s])), [stamps]);

  const nearbySpots = useMemo(
    () => sortSpotsByDistance(spots, userPos ?? DEFAULT_MAP_CENTER).slice(0, NEARBY_LIMIT),
    [spots, userPos],
  );

  const previewStamps = useMemo(() => {
    const sorted = [...stamps].sort((a, b) => {
      if (a.reward_ready && !b.reward_ready) return -1;
      if (!a.reward_ready && b.reward_ready) return 1;
      const ta = new Date(a.updated_at || a.created_at || 0).getTime();
      const tb = new Date(b.updated_at || b.created_at || 0).getTime();
      return tb - ta;
    });
    return sorted.slice(0, STAMP_PREVIEW_LIMIT);
  }, [stamps]);

  const nextReward = useMemo(() => {
    const ready = stamps.find((s) => s.reward_ready);
    if (ready) return { type: "ready", stamp: ready };
    const closest = [...stamps]
      .filter((s) => !s.reward_ready && s.max_points > s.points)
      .sort((a, b) => (a.max_points - a.points) - (b.max_points - b.points))[0];
    if (closest) return { type: "progress", stamp: closest };
    return null;
  }, [stamps]);

  const lastVisit = useMemo(() => getLastVisitStamp(stamps), [stamps]);

  const readyCount = stamps.filter((s) => s.reward_ready).length;
  const firstName = profile?.name?.split(" ")[0] || "du";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  const dateStr = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 100 }}>
      <HomeHero
        greeting={greeting}
        firstName={firstName}
        dateStr={dateStr}
        profileName={profile?.name}
        bellCount={readyCount}
        onMySpots={onWallet}
      />

      <div style={{ padding: "0 18px" }}>
        {nextReward && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSpotClick?.(nextReward.stamp.spot_id)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "16px 18px",
              borderRadius: 18,
              border: `1.5px solid ${nextReward.type === "ready" ? C.orange : C.blue}40`,
              background: nextReward.type === "ready" ? `${C.orange}14` : `${C.blue}10`,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: nextReward.type === "ready" ? C.orange : C.blue, letterSpacing: 1, marginBottom: 6 }}>
              {nextReward.type === "ready" ? "NÄCHSTER REWARD" : "FAST DA"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.dark }}>
              {nextReward.stamp.spot?.name || "Spot"}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              {nextReward.type === "ready"
                ? `🎁 ${nextReward.stamp.reward_text || nextReward.stamp.spot?.reward_text || "Reward bereit"}`
                : `${nextReward.stamp.points}/${nextReward.stamp.max_points} Stempel · ${nextReward.stamp.spot?.reward_text || nextReward.stamp.reward_text || "Reward"}`}
            </div>
          </motion.button>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spinner size={32} />
          </div>
        ) : (
          <>
            {previewStamps.length > 0 && (
              <section style={{ marginTop: 22 }}>
                <SectionHeader
                  label="Aktive Stempelkarten"
                  count={stamps.length > STAMP_PREVIEW_LIMIT ? `${STAMP_PREVIEW_LIMIT} von ${stamps.length}` : undefined}
                  actionLabel={stamps.length > STAMP_PREVIEW_LIMIT ? "Alle" : undefined}
                  onAction={stamps.length > STAMP_PREVIEW_LIMIT ? onWallet : undefined}
                />
                <StackedStampCards stamps={previewStamps} onSpotClick={onSpotClick} showCta />
              </section>
            )}

            {lastVisit && (
              <section style={{ marginTop: 20 }}>
                <SectionHeader label="Letzter Besuch" icon={Clock} />
                <button
                  type="button"
                  onClick={() => onSpotClick?.(lastVisit.spot_id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{lastVisit.spot?.emoji || "📍"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{lastVisit.spot?.name || "Spot"}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {formatVisitLabel(lastVisit.updated_at || lastVisit.last_visit)} · {lastVisit.points}/{lastVisit.max_points} Stempel
                    </div>
                  </div>
                  <MapPin size={16} color={C.muted} />
                </button>
              </section>
            )}

            <HomeNearbySection
              spots={nearbySpots}
              stampBySpotId={stampBySpotId}
              loading={loading}
              onSpotClick={onSpotClick}
              onCheckin={onCheckin}
              onDiscover={onDiscover}
            />

            {stamps.length === 0 && <EmptyWalletState onDiscover={onDiscover} />}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyWalletState({ onDiscover }) {
  return (
    <div
      style={{
        marginTop: 24,
        textAlign: "center",
        padding: "32px 20px",
        background: C.white,
        borderRadius: 20,
        border: `1.5px dashed ${C.border}`,
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: C.dark, marginBottom: 8 }}>Scan deinen ersten Spot</div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 16 }}>
        Tippe unten auf Scannen — Stempel landen automatisch in deiner Wallet.
      </p>
      {onDiscover && (
        <button
          type="button"
          onClick={onDiscover}
          style={{ background: "none", border: "none", color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          Spots entdecken →
        </button>
      )}
    </div>
  );
}
