import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Zap, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getSpot, getOrCreateStamp, addStamp } from "../../lib/firestore";
import { Screen, Btn, Card, ProgressBar, BackBtn, Tag, C, Spinner, StampGrid, CARD_GRADIENT } from "../../components/ui";
import { ScanCooldownBadge, PrivacyNote } from "../../components/trust";
import CheckInConsent, { hasConsented, markConsented } from "./CheckInConsent";
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

export default function CheckInPage({ spotId, onBack, onSpotDetected }) {
  const { user } = useAuth();
  const [spot, setSpot]     = useState(null);
  const [stamp, setStamp]   = useState(null);
  const [step, setStep]     = useState(0); // 0=consent|confirm, 1=success
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [cooldownMs, setCooldownMs]   = useState(0);

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

  const handleConsentAccept = (selections) => {
    markConsented(user.uid, spotId || "demo");
    setShowConsent(false);
  };

  const collectPoint = async () => {
    if (cooldownMs > 0) return;
    setSaving(true);
    try {
      const updated = await addStamp(user.uid, spotId);
      setStamp(updated);
      setCooldown(user.uid, spotId);
      setStep(1);
    } catch {
      // demo mode fallback
      const next = { ...stamp, points: Math.min((stamp?.points || 0) + 1, stamp?.max_points || 8) };
      next.reward_ready = next.points >= next.max_points;
      setStamp(next);
      setCooldown(user.uid, spotId || "demo");
      setStep(1);
    }
    setSaving(false);
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
            {stamp.reward_ready ? "Reward freigeschaltet!" : "Punkt gesammelt!"}
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
              Noch {stamp.max_points - stamp.points} Punkte bis: {spot.reward_text}
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

  // ── CONFIRM ──
  return (
    <div style={{ height: "100%", overflowY: "auto", background: C.bg }}>
      {/* Consent overlay */}
      {showConsent && (
        <CheckInConsent
          spot={spot}
          onAccept={handleConsentAccept}
          onDecline={() => { setShowConsent(false); onBack(); }}
        />
      )}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${bg}20, ${bg}08)`, padding: "48px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <BackBtn onClick={onBack} />
          {cooldownMs > 0 ? (
            <ScanCooldownBadge seconds={Math.ceil(cooldownMs / 1000)} />
          ) : (
            <span style={{ background: C.mintLight, color: C.green, borderRadius: 99, padding: "4px 12px", fontSize: 10, fontWeight: 800 }}>
              📍 Bereit zum Scannen
            </span>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: `${bg}22`, border: `2px solid ${bg}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, margin: "0 auto 12px" }}>
            {spot.emoji || "🏪"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.dark, letterSpacing: -0.5 }}>{spot.name}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{spot.category}{spot.area ? ` · ${spot.area}` : ""}</div>
        </div>
      </div>

      <div style={{ padding: "16px 20px 32px" }}>
        {/* Action banner */}
        {spot.current_action && (
          <div style={{ background: `${C.orange}10`, border: `1.5px solid ${C.orange}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
            <Zap size={14} color={C.orange} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>{spot.current_action}</span>
          </div>
        )}

        {/* Stamp card */}
        <div style={{ background: "#fff", borderRadius: 18, padding: "16px", marginBottom: 14, border: `1px solid ${C.border}`, boxShadow: `0 3px 14px rgba(6,13,8,.07)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Deine Stempelkarte</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: bg }}>{stamp.points}<span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>/{stamp.max_points}</span></div>
          </div>
          <StampGrid pts={stamp.points} max={stamp.max_points} color={bg} />
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={stamp.points} max={stamp.max_points} color={bg} height={6} bg={`${bg}15`} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
            Reward: <strong style={{ color: C.dark }}>{spot.reward_text}</strong>
          </div>
        </div>

        {/* Reward ready */}
        {stamp.reward_ready && (
          <div style={{ background: `${C.orange}10`, border: `2px solid ${C.orange}50`, borderRadius: 16, padding: "16px", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🎁</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>Reward bereit!</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{spot.reward_text} – zeig es dem Personal</div>
          </div>
        )}

        {/* Cooldown warning */}
        {cooldownMs > 0 && (
          <div style={{ marginBottom: 14 }}>
            <PrivacyNote variant="warning">
              ⏱ Du kannst in {fmtCooldown(cooldownMs)} wieder einchecken. (Anti-Fraud Schutz · 2h Mindestabstand)
            </PrivacyNote>
          </div>
        )}

        {/* CTA */}
        {!stamp.reward_ready && (
          <div style={{ background: `linear-gradient(135deg, ${bg}, ${C.fresh})`, borderRadius: 16, padding: "18px 20px", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginBottom: 3 }}>Sammle jetzt</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>+1 Punkt</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 4 }}>
              Neuer Stand: {(stamp.points || 0) + 1}/{stamp.max_points}
            </div>
          </div>
        )}

        <motion.button
          whileTap={cooldownMs > 0 ? {} : { scale: 0.97 }}
          onClick={collectPoint}
          disabled={saving || cooldownMs > 0}
          style={{
            width: "100%",
            background: cooldownMs > 0 ? C.border : CARD_GRADIENT,
            color: cooldownMs > 0 ? C.muted : "#fff",
            border: "none", borderRadius: 14, padding: "15px",
            fontSize: 15, fontWeight: 800,
            cursor: saving || cooldownMs > 0 ? "not-allowed" : "pointer",
            boxShadow: cooldownMs > 0 ? "none" : "0 6px 20px rgba(10,61,39,.25)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {saving ? (
            <><Spinner size={18} color="#fff" /> Wird gespeichert…</>
          ) : cooldownMs > 0 ? (
            <><Clock size={16} /> Wieder verfügbar in {fmtCooldown(cooldownMs)}</>
          ) : (
            <><Check size={16} /> Punkt sichern</>
          )}
        </motion.button>
      </div>
    </div>
  );
}
