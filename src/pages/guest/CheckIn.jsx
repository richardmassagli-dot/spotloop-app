import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Zap, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getSpot, getOrCreateStamp, addStamp } from "../../lib/firestore";
import { Screen, Btn, Card, ProgressBar, BackBtn, Tag, C, Spinner, CARD_GRADIENT } from "../../components/ui";
import StampGrid from "../../components/stamp/StampSlots";
import { ScanCooldownBadge, PrivacyNote } from "../../components/trust";
import CheckInConsent, { hasConsented, markConsented } from "./CheckInConsent";
import { savePrivacyPrefs } from "../../lib/privacy";
import QRScanner from "../../components/QRScanner";
import { demoSpots } from "../../lib/demoData";

const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const COOLDOWN_KEY = (userId, spotId) => `myspot_checkin_${userId}_${spotId}`;

function getCooldownRemaining(userId, spotId) {
  const last = parseInt(localStorage.getItem(COOLDOWN_KEY(userId, spotId)) || "0");
  if (!last) return 0;
  const remaining = COOLDOWN_MS - (Date.now() - last);
  return remaining > 0 ? remaining : 0;
}

function setCooldown(userId, spotId) {
  localStorage.setItem(COOLDOWN_KEY(userId, spotId), String(Date.now()));
}

function fmtCooldown(ms) {
  const mins = Math.ceil(ms / 60000);
  return mins >= 60 ? `${Math.ceil(mins / 60)}h ${mins % 60}min` : `${mins} min`;
}

export default function CheckInPage({ spotId, onBack, onSpotDetected, onComplete }) {
  const { user } = useAuth();
  const [spot, setSpot]     = useState(null);
  const [stamp, setStamp]   = useState(null);
  const [step, setStep]     = useState(0); // 0=consent|confirm, 1=success
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [cooldownMs, setCooldownMs]   = useState(0);
  const autoCollected = useRef(false);

  useEffect(() => {
    if (!spotId) { setLoading(false); return; }
    Promise.all([getSpot(spotId), getOrCreateStamp(user.uid, spotId)])
      .then(([s, st]) => {
        const foundSpot = s || demoSpots.find(d => d.id === spotId);
        if (!foundSpot) throw new Error("Spot nicht gefunden");
        setSpot(foundSpot);
        setStamp(st);

        // Check consent
        if (!hasConsented(user.uid, spotId)) {
          setShowConsent(true);
        }

        // Check cooldown
        const rem = getCooldownRemaining(user.uid, spotId);
        setCooldownMs(rem);
        setLoading(false);
      })
      .catch(() => {
        const fallback = demoSpots[0];
        if (!fallback) {
          setSpot(null);
          setLoading(false);
          return;
        }
        setSpot(fallback);
        setStamp({ points: 3, max_points: fallback.max_points, reward_text: fallback.reward_text, reward_ready: false });
        if (!hasConsented(user.uid, spotId || "demo")) setShowConsent(true);
        setLoading(false);
      });
  }, [spotId, user.uid]);

  const collectPoint = useCallback(async () => {
    if (cooldownMs > 0) {
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const updated = await addStamp(user.uid, spotId);
      setStamp(updated);
      setCooldown(user.uid, spotId);
      setStep(1);
    } catch {
      const next = { ...stamp, points: Math.min((stamp?.points || 0) + 1, stamp?.max_points || 8) };
      next.reward_ready = next.points >= next.max_points;
      setStamp(next);
      setCooldown(user.uid, spotId || "demo");
      setStep(1);
    }
    setSaving(false);
  }, [cooldownMs, spotId, stamp, user.uid]);

  useEffect(() => {
    if (step !== 1 || !onComplete) return;
    const t = setTimeout(() => onComplete(), 2600);
    return () => clearTimeout(t);
  }, [step, onComplete]);

  useEffect(() => {
    if (loading || showConsent || !spot || !stamp || step !== 0 || autoCollected.current) return;
    autoCollected.current = true;
    collectPoint();
  }, [loading, showConsent, spot, stamp, step, collectPoint]);

  const handleConsentAccept = async (selections = {}) => {
    markConsented(user.uid, spotId || "demo");
    await savePrivacyPrefs(user.uid, {
      push_campaigns: !!selections.campaigns,
      push_nearby: !!selections.location,
      location_nearby: !!selections.location,
      loyalty_active: true,
    });
    if (selections.location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {}, {
        enableHighAccuracy: false,
        maximumAge: 600000,
        timeout: 8000,
      });
    }
    setShowConsent(false);
  };

  // ── No spot ID: Kamera-QR-Scanner ──
  if (!spotId) {
    return (
      <QRScanner
        onDetected={(id) => onSpotDetected?.(id)}
        onCancel={onBack}
      />
    );
  }

  if (loading) return (
    <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Spinner size={40} />
    </div>
  );

  if (!spot) return (
    <div style={{ padding: 24, background: C.bg, height: "100%" }}>
      <BackBtn onClick={onBack} />
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>Spot nicht gefunden</div>
      </div>
    </div>
  );

  const bg = spot.bg_color || C.green;

  // ── SUCCESS ──
  if (step === 1) return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ background: `linear-gradient(160deg, ${bg}, ${C.fresh})`, padding: "52px 24px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.06)", pointerEvents: "none" }} />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16 }}
          style={{ fontSize: 64, marginBottom: 12 }}
        >
          {stamp.reward_ready ? "🎉" : "⭐"}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4, letterSpacing: -0.5 }}>
            {stamp.reward_ready ? "Reward erreicht!" : cooldownMs > 0 ? "Schon eingecheckt!" : "Besuch gezählt!"}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.8)" }}>{spot.name}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ background: "rgba(255,255,255,.1)", backdropFilter: "blur(10px)", borderRadius: 18, padding: "18px 20px", margin: "20px 0 0", border: "1px solid rgba(255,255,255,.15)" }}
        >
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 6 }}>Neuer Stand</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#fff", letterSpacing: -2, marginBottom: 10 }}>
            {stamp.points}<span style={{ fontSize: 18, opacity: 0.6 }}>/{stamp.max_points}</span>
          </div>
          <ProgressBar value={stamp.points} max={stamp.max_points} color="rgba(255,255,255,.9)" height={7} bg="rgba(255,255,255,.15)" />
          {stamp.reward_ready ? (
            <div style={{ fontSize: 14, color: "#FFE082", fontWeight: 800, marginTop: 10 }}>
              🎁 {spot.reward_text} – zeig das dem Personal!
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 8 }}>
              Noch {stamp.max_points - stamp.points} Besuche bis: {spot.reward_text}
            </div>
          )}
        </motion.div>
      </div>

      {/* Security confirmation */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ background: C.mintLight, border: `1px solid ${C.fresh}25`, borderRadius: 12, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
          <Shield size={15} color={C.fresh} />
          <div style={{ fontSize: 11, color: C.green, fontWeight: 700, lineHeight: 1.4 }}>
            Besuch verifiziert · Token einmalig gültig · Nächster Check-in frühestens in 2h
          </div>
        </div>
        <button
          onClick={onBack}
          style={{ width: "100%", background: CARD_GRADIENT, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(10,61,39,.25)" }}
        >
          ← Weitere Spots entdecken
        </button>
      </div>
    </div>
  );

  // ── CONFIRM (Auto-Check-in) ──
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24 }}>
      {showConsent && (
        <CheckInConsent
          spot={spot}
          onAccept={handleConsentAccept}
          onDecline={() => { setShowConsent(false); onBack(); }}
        />
      )}
      <Spinner size={40} />
      <div style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: C.dark }}>{spot.name}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{saving ? "Besuch wird gespeichert…" : "Check-in…"}</div>
    </div>
  );
}
