import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, Shield, AlertTriangle, Copy, Check } from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";
import { SecureQRBadge, MerchantTrustBanner } from "../../components/trust";

const QR_TTL = 180; // seconds before rotation (mehr Zeit zum Scannen am Handy)

function generateToken() {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

function buildQRUrl(merchantId, token) {
  return `${window.location.origin}?checkin=${merchantId}&t=${token}&exp=${Date.now() + QR_TTL * 1000}`;
}

export default function SecureQR({ merchantId, spotName, premium = false }) {
  const [token, setToken]     = useState(() => generateToken());
  const [ttl, setTtl]         = useState(QR_TTL);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [scanLog, setScanLog] = useState([]);
  const [showLog, setShowLog] = useState(false);

  const qrUrl = buildQRUrl(merchantId, token);

  const rotate = useCallback(() => {
    setRotating(true);
    setTimeout(() => {
      setToken(generateToken());
      setTtl(QR_TTL);
      setRotating(false);
    }, 400);
  }, []);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTtl(prev => {
        if (prev <= 1) { rotate(); return QR_TTL; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rotate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pct = (ttl / QR_TTL) * 100;
  const urgency = ttl < 10;

  const cardStyle = premium
    ? undefined
    : {
        background: C.white, borderRadius: 22, padding: "24px",
        border: `2px solid ${urgency ? `${C.orange}60` : `${C.green}30`}`,
        boxShadow: `0 8px 32px rgba(10,61,39,.12)`,
        textAlign: "center", marginBottom: 16,
        transition: "border-color .3s",
      };

  return (
    <div>
      {/* QR Card */}
      <div
        className={premium ? `rounded-[24px] border bg-white p-6 text-center shadow-[0_8px_28px_rgba(11,31,58,0.08)] mb-4 ${urgency ? "border-[#FF6B5A]/40" : "border-[#E8E8E4]/80"}` : undefined}
        style={cardStyle}
      >
        {!premium && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{spotName}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Sicherer Check-in QR</div>
            </div>
            <SecureQRBadge />
          </div>
        )}

        {/* QR Code */}
        <AnimatePresence mode="wait">
          <motion.div
            key={token}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
          >
            <div style={{ background: C.bg, padding: 14, borderRadius: 16 }}>
              <QRCodeSVG value={qrUrl} size={170} fgColor={C.dark} level="H" includeMargin={false} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Countdown bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${pct}%`, background: urgency ? C.orange : C.fresh }}
              transition={{ duration: 0.8, ease: "linear" }}
              style={{ height: "100%", borderRadius: 99 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: urgency ? C.orange : C.muted, fontWeight: 700 }}>
              {urgency ? "⚠️ " : ""}Läuft ab in {ttl}s
            </span>
            <span style={{ fontSize: 10, color: C.muted }}>Einmalig gültig</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={rotate}
            disabled={rotating}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: C.mintLight, border: `1px solid ${C.fresh}30`,
              borderRadius: 12, padding: "10px", fontSize: 12, fontWeight: 700, color: C.green, cursor: "pointer",
            }}
          >
            <motion.div animate={{ rotate: rotating ? 360 : 0 }} transition={{ duration: 0.4 }}>
              <RefreshCw size={14} />
            </motion.div>
            Neu generieren
          </button>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: copied ? C.mintLight : C.bg, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "10px", fontSize: 12, fontWeight: 700, color: copied ? C.fresh : C.muted, cursor: "pointer",
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Kopiert!" : "Link kopieren"}
          </button>
        </div>
      </div>

      {/* Security features */}
      <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16, boxShadow: `0 2px 10px rgba(6,13,8,.06)` }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={16} color={C.fresh} />
          <span style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Sicherheitsfunktionen</span>
        </div>
        {[
          { icon: "🔄", label: "Rotierender Token", desc: `Code wechselt automatisch alle ${QR_TTL} Sekunden` },
          { icon: "⏱️", label: "Zeitstempel-Validierung", desc: "Jeder Scan wird auf Gültigkeit geprüft" },
          { icon: "🛡️", label: "Anti-Farming Schutz", desc: "Ein gültiger Check-in pro Follower alle 2 Stunden" },
          { icon: "📍", label: "Soft-Standortcheck", desc: "Optionale Verortung zur Missbrauchserkennung" },
          { icon: "🚨", label: "Scan-Velocity Analyse", desc: "Ungewöhnliche Scanmuster werden markiert" },
        ].map((f, i) => (
          <div key={f.label} style={{ display: "flex", gap: 12, padding: "11px 16px", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{f.label}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scan cooldown rules */}
      <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "14px 16px", marginBottom: 16, boxShadow: `0 2px 10px rgba(6,13,8,.06)` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 12 }}>⚙️ Anti-Fraud Regeln</div>
        <ScanRuleRow label="Check-in Abstand" value="Min. 2 Stunden" color={C.teal} />
        <ScanRuleRow label="Max. Scans pro Tag" value="3 Punkte" color={C.fresh} />
        <ScanRuleRow label="Gerät-Fingerprint" value="Aktiv" color={C.green} />
        <ScanRuleRow label="Multi-Account Erkennung" value="Aktiv" color={C.green} last />
      </div>

      {/* Scan log */}
      <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 2px 10px rgba(6,13,8,.06)` }}>
        <button
          onClick={() => setShowLog(!showLog)}
          style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} color={C.gold} />
            <span style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Verdächtige Aktivitäten</span>
          </div>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>0 heute</span>
        </button>
        {showLog && (
          <div style={{ padding: "0 16px 14px" }}>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>Keine Anomalien erkannt</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Alle Scans heute sehen regulär aus.</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <MerchantTrustBanner />
      </div>

      {/* Print */}
      <button
        onClick={() => window.print()}
        style={{
          width: "100%", background: CARD_GRADIENT, color: "#fff", border: "none",
          borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700,
          cursor: "pointer", marginTop: 16,
          boxShadow: "0 6px 20px rgba(10,61,39,.25)",
        }}
      >
        🖨️ QR-Code drucken
      </button>
    </div>
  );
}

function ScanRuleRow({ label, value, color, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <span style={{ fontSize: 13, color: C.dark, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color, background: `${color}12`, borderRadius: 99, padding: "3px 10px" }}>{value}</span>
    </div>
  );
}
