import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Check, ChevronRight, AlertTriangle,
  Gift, QrCode, CreditCard, HelpCircle, Send, Clock,
} from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";

const TOPICS = [
  { id: "reward_missing", icon: "🎁", label: "Reward nicht einlösbar", color: "#F05830" },
  { id: "scan_failed",    icon: "📷", label: "QR-Scan fehlgeschlagen", color: "#1B6CA8" },
  { id: "points_missing", icon: "⭐", label: "Punkte fehlen", color: "#D68A0C" },
  { id: "duplicate",      icon: "🔄", label: "Doppelter Check-in", color: "#8B5CF6" },
  { id: "payment",        icon: "💳", label: "Zahlungsproblem", color: "#13B05C" },
  { id: "fraud",          icon: "🚨", label: "Missbrauch melden", color: "#F05830" },
  { id: "other",          icon: "💬", label: "Andere Frage", color: C.muted },
];

const FAQ = [
  {
    q: "Warum wurde mein QR-Scan abgelehnt?",
    a: "QR-Codes rotieren automatisch alle 60 Sekunden und sind einmalig gültig. Falls der Scan fehlschlug, bitte den Code neu laden oder beim Personal nachfragen.",
  },
  {
    q: "Wann kann ich wieder einchecken?",
    a: "Pro Besuch ist ein Check-in möglich, mit einem Mindestabstand von 2 Stunden. Dies verhindert Mehrfach-Scans.",
  },
  {
    q: "Wie lange sind Rewards gültig?",
    a: "Rewards sind unbegrenzt gültig, solange du aktives Mitglied bist. Manche Spots definieren eigene Ablaufdaten — diese werden direkt auf der Karte angezeigt.",
  },
  {
    q: "Was passiert, wenn ein Spot spotloop verlässt?",
    a: "Deine gesammelten Punkte bleiben 90 Tage gültig und können noch eingelöst werden. Danach werden sie archiviert.",
  },
  {
    q: "Wie kann ich meine Daten löschen?",
    a: "In Profil → Datenschutz & Sicherheit → Konto löschen. Alle Daten werden innerhalb von 30 Tagen entfernt.",
  },
];

export default function SupportCenter({ onClose }) {
  const [step, setStep]     = useState("home"); // home | topic | form | sent | faq
  const [topic, setTopic]   = useState(null);
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const selectedTopic = TOPICS.find(t => t.id === topic);

  const handleSend = () => {
    if (!message.trim()) return;
    setStep("sent");
    setMessage("");
  };

  return (
    <div style={{ background: C.bg, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Hilfe & Support</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 1 }}>Wir helfen dir sofort</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 32px" }}>

        {/* ── HOME ── */}
        {step === "home" && (
          <>
            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <QuickCard icon="💬" label="Ticket erstellen" sub="Direkte Hilfe" color={C.teal} onClick={() => setStep("topic")} />
              <QuickCard icon="❓" label="FAQ" sub="Häufige Fragen" color={C.fresh} onClick={() => setStep("faq")} />
            </div>

            {/* Status */}
            <div style={{ background: C.mintLight, border: `1px solid ${C.fresh}25`, borderRadius: 14, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.fresh, marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Alle Systeme normal</div>
                <div style={{ fontSize: 11, color: C.muted }}>Ø Antwortzeit: unter 2 Stunden</div>
              </div>
            </div>

            {/* Recent tickets */}
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Meine Anfragen</div>
            <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>Keine offenen Anfragen</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Alles läuft reibungslos!</div>
              </div>
            </div>

            {/* Contact info */}
            <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 16px", marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Kontakt</div>
              {[
                { icon: "✉️", label: "E-Mail", value: "support@spotloop.app" },
                { icon: "💬", label: "In-App Chat", value: "Mo–Fr 9–18 Uhr" },
                { icon: "📖", label: "Hilfecenter", value: "help.spotloop.app" },
              ].map((r, i) => (
                <div key={r.label} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TOPIC SELECTION ── */}
        {step === "topic" && (
          <>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Worum geht es?</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Wähle das passende Thema für deine Anfrage.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTopic(t.id); setStep("form"); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#fff", border: `1.5px solid ${C.border}`,
                    borderRadius: 14, padding: "13px 14px", cursor: "pointer",
                    transition: "border-color .15s",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${t.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.dark, flex: 1, textAlign: "left" }}>{t.label}</span>
                  <ChevronRight size={16} color={C.muted} />
                </button>
              ))}
            </div>
            <button onClick={() => setStep("home")} style={{ marginTop: 16, width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 8 }}>
              ← Zurück
            </button>
          </>
        )}

        {/* ── FORM ── */}
        {step === "form" && selectedTopic && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, background: "#fff", borderRadius: 14, padding: "12px 14px", border: `1.5px solid ${selectedTopic.color}25` }}>
              <span style={{ fontSize: 22 }}>{selectedTopic.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{selectedTopic.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Neue Anfrage erstellen</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>DEINE NACHRICHT</div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 500))}
                placeholder="Beschreibe das Problem so genau wie möglich…"
                rows={5}
                style={{
                  width: "100%", background: C.bg, border: `1.5px solid ${message ? C.green : C.border}`,
                  borderRadius: 14, padding: "12px 14px", fontSize: 14,
                  color: C.dark, outline: "none", resize: "none", fontFamily: "inherit",
                  transition: "border-color .15s", boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, marginTop: 4 }}>
                <span>Wir antworten in &lt; 2h</span>
                <span>{message.length}/500</span>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!message.trim()}
              style={{
                width: "100%", background: message.trim() ? CARD_GRADIENT : C.border,
                color: "#fff", border: "none", borderRadius: 14, padding: "14px",
                fontSize: 14, fontWeight: 700, cursor: message.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Send size={15} /> Anfrage senden
            </button>
            <button onClick={() => setStep("topic")} style={{ marginTop: 12, width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 8 }}>
              ← Zurück
            </button>
          </>
        )}

        {/* ── SENT ── */}
        {step === "sent" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: "center", padding: "32px 20px" }}
          >
            <div style={{ width: 80, height: 80, borderRadius: 24, background: C.mintLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>
              ✅
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.dark, letterSpacing: -0.5, marginBottom: 8 }}>
              Anfrage gesendet!
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
              Wir haben deine Anfrage erhalten und melden uns innerhalb von 2 Stunden per E-Mail.
            </div>
            <div style={{ background: C.bg, borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Clock size={14} color={C.teal} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>Ticket-Nummer: #MS-{Date.now().toString(36).toUpperCase()}</span>
              </div>
            </div>
            <button onClick={() => setStep("home")} style={{ width: "100%", background: CARD_GRADIENT, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Zum Support-Center
            </button>
          </motion.div>
        )}

        {/* ── FAQ ── */}
        {step === "faq" && (
          <>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 16 }}>Häufige Fragen</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  style={{ background: "#fff", borderRadius: 14, border: `1px solid ${openFaq === i ? `${C.green}40` : C.border}`, overflow: "hidden" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", background: "none", border: "none", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", textAlign: "left", gap: 12 }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.dark, lineHeight: 1.4 }}>{item.q}</span>
                    <span style={{ color: C.muted, fontSize: 16, flexShrink: 0, transform: openFaq === i ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 16px 14px", fontSize: 13, color: C.muted, lineHeight: 1.7, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <button onClick={() => setStep("home")} style={{ marginTop: 16, width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 8 }}>
              ← Zurück
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function QuickCard({ icon, label, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 16,
        padding: "16px 14px", cursor: "pointer", textAlign: "center",
        boxShadow: `0 2px 10px rgba(6,13,8,.06)`,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{label}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>
    </button>
  );
}
