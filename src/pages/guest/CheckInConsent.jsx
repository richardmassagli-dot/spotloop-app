/**
 * First-scan consent flow.
 * Shown the first time a guest scans a specific merchant's QR code.
 * Transparently explains what the merchant can access.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Bell, MapPin, Star, Check, ChevronRight, X } from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";
import { ConsentRow, PrivacyNote } from "../../components/trust";

const CONSENT_KEY = (userId, spotId) => `myspot_consent_${userId}_${spotId}`;

export function hasConsented(userId, spotId) {
  return !!localStorage.getItem(CONSENT_KEY(userId, spotId));
}

export function markConsented(userId, spotId) {
  localStorage.setItem(CONSENT_KEY(userId, spotId), "1");
}

const PERMISSIONS = [
  {
    id: "loyalty",
    Icon: Star,
    label: "Treue-Karte & Rewards",
    desc: "Besuche sammeln und Rewards einlösen",
    color: C.fresh,
    required: true,
  },
  {
    id: "campaigns",
    Icon: Bell,
    label: "Kampagnen & Angebote",
    desc: "Sonderaktionen von diesem Spot",
    color: "#D68A0C",
    required: false,
  },
  {
    id: "location",
    Icon: MapPin,
    label: "In der Nähe erinnert werden",
    desc: "Nur ~200 m vom Spot — z. B. „Noch 3 Besuche bis Gratis-Kaffee“",
    color: "#1B6CA8",
    required: false,
  },
];

export default function CheckInConsent({ spot, onAccept, onDecline }) {
  const [selections, setSelections] = useState({ loyalty: true, campaigns: false, location: false });

  const toggle = (id) => {
    if (PERMISSIONS.find(p => p.id === id)?.required) return;
    setSelections(s => ({ ...s, [id]: !s[id] }));
  };

  const bg = spot?.bg_color || C.green;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 400 }}
          style={{ background: "#fff", borderRadius: "26px 26px 0 0", width: "100%", maxWidth: 390, overflow: "hidden" }}
        >
          {/* Handle */}
          <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: "10px auto 0" }} />

          {/* Spot Header */}
          <div style={{ background: `linear-gradient(135deg, ${bg}20, ${bg}08)`, padding: "16px 20px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: `${bg}22`, border: `2px solid ${bg}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                {spot?.emoji || "🏪"}
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>STEMPELKARTE HINZUFÜGEN</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.dark, letterSpacing: -0.5 }}>{spot?.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{spot?.category} · {spot?.area}</div>
              </div>
            </div>

            {/* Reward preview */}
            <div style={{ marginTop: 14, background: "rgba(255,255,255,.8)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🎁</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.dark }}>Dein Reward: {spot?.reward_text}</div>
                <div style={{ fontSize: 11, color: C.muted }}>bei {spot?.max_points} Besuchen</div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 4 }}>
              Dieser Spot möchte folgendes:
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.45 }}>
              Kein Pflicht-Standort — nur ein Vorteil: Wir erinnern dich, wenn du wirklich in der Nähe bist.
              Du kannst alles später in den Einstellungen ändern.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PERMISSIONS.map(({ id, Icon, label, desc, color, required }) => {
                const checked = selections[id];
                return (
                  <motion.button
                    key={id}
                    whileTap={required ? {} : { scale: 0.98 }}
                    onClick={() => toggle(id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: checked ? `${color}08` : C.bg,
                      border: `1.5px solid ${checked ? `${color}30` : C.border}`,
                      borderRadius: 14, padding: "12px 14px", cursor: required ? "default" : "pointer",
                      transition: "all .18s",
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color={color} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{label}</span>
                        {required && <span style={{ fontSize: 9, fontWeight: 800, color: color, background: `${color}15`, borderRadius: 99, padding: "2px 7px" }}>NÖTIG</span>}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>{desc}</div>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                      border: `2px solid ${checked ? color : C.border}`,
                      background: checked ? color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .2s",
                    }}>
                      {checked && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Privacy note */}
            <div style={{ marginTop: 12 }}>
              <PrivacyNote variant="success">
                Der Spot sieht dich als anonymes Loyalty-Profil (z. B. Member #A72X91) — kein Name, keine Zahlungsdaten. Besuche gelten nur bei diesem Spot.
              </PrivacyNote>
            </div>

            {/* Buttons */}
            <button
              onClick={() => onAccept(selections)}
              style={{
                width: "100%", background: CARD_GRADIENT, color: "#fff",
                border: "none", borderRadius: 14, padding: "15px",
                fontSize: 14, fontWeight: 800, cursor: "pointer",
                marginTop: 14, boxShadow: "0 6px 20px rgba(10,61,39,.25)",
              }}
            >
              ✓ Treue-Karte hinzufügen
            </button>
            <button
              onClick={onDecline}
              style={{ width: "100%", background: "none", border: "none", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "10px 0 4px" }}
            >
              Ablehnen
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
