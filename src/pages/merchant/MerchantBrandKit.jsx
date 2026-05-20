import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, Share2, Check, Copy } from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";

const TEMPLATES = [
  {
    id: "table_tent",
    name: "Tisch-Aufsteller",
    desc: "A6 · Beidseitig · Laminierbar",
    icon: "🪧",
    format: "A6",
  },
  {
    id: "sticker_small",
    name: "Fensteraufkleber",
    desc: "10×10cm · Wetterfest",
    icon: "🏷️",
    format: "10cm",
  },
  {
    id: "menu_footer",
    name: "Speisekarten-Fußzeile",
    desc: "Volle Breite · Schwarz/Weiß",
    icon: "📋",
    format: "A4 Breite",
  },
  {
    id: "receipt",
    name: "Bon-Aufdruck",
    desc: "80mm Thermodrucker · Bon-Breite",
    icon: "🧾",
    format: "80mm",
  },
  {
    id: "counter_stand",
    name: "Theken-Aufsteller",
    desc: "A5 · Hochformat · Premium-Look",
    icon: "🪵",
    format: "A5",
  },
  {
    id: "poster",
    name: "Einstiegs-Poster",
    desc: "A4 · Erklärt spotloop für Gäste",
    icon: "📜",
    format: "A4",
  },
];

const BRAND_MESSAGES = [
  "Hier Punkte sammeln mit spotloop!",
  "Scan & Punkte sammeln",
  "Deine Stempelkarte – digital",
  "Jetzt mit spotloop sammeln",
  "Treuepunkte – ganz einfach",
];

export default function MerchantBrandKit({ merchantId, spot }) {
  const [selected, setSelected] = useState("table_tent");
  const [message, setMessage] = useState(BRAND_MESSAGES[0]);
  const [copied, setCopied] = useState(false);
  const [activeMsg, setActiveMsg] = useState(0);

  const qrUrl = `${window.location.origin}?checkin=${merchantId}`;
  const bg = spot?.bg_color || C.green;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 20px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: 2, fontWeight: 700, marginBottom: 3 }}>MERCHANT BRAND KIT</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Marketing-Materialien</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 2 }}>Druck- und Digitalvorlagen</div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* QR Preview Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "20px", marginBottom: 16, border: `1px solid ${C.border}`, boxShadow: `0 4px 20px rgba(6,13,8,.08)` }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 12 }}>Vorschau · {TEMPLATES.find(t => t.id === selected)?.name}</div>

            {/* Template preview */}
            {selected === "table_tent" && (
              <TableTentPreview spot={spot} qrUrl={qrUrl} message={message} bg={bg} />
            )}
            {selected === "sticker_small" && (
              <StickerPreview spot={spot} qrUrl={qrUrl} bg={bg} />
            )}
            {selected === "receipt" && (
              <ReceiptPreview spot={spot} qrUrl={qrUrl} />
            )}
            {(selected === "menu_footer" || selected === "counter_stand" || selected === "poster") && (
              <GenericPreview spot={spot} qrUrl={qrUrl} bg={bg} message={message} template={selected} />
            )}
          </div>

          {/* Message selector */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>BOTSCHAFT AUSWÄHLEN</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {BRAND_MESSAGES.map((m, i) => (
                <button
                  key={m}
                  onClick={() => { setActiveMsg(i); setMessage(m); }}
                  style={{
                    flexShrink: 0, borderRadius: 99, padding: "5px 12px",
                    background: activeMsg === i ? C.green : "transparent",
                    border: `1.5px solid ${activeMsg === i ? C.green : C.border}`,
                    color: activeMsg === i ? "#fff" : C.muted,
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: CARD_GRADIENT, border: "none", borderRadius: 12, padding: "11px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}
            >
              <Printer size={14} /> Drucken
            </button>
            <button
              onClick={handleCopy}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: copied ? C.mintLight : C.bg, border: `1px solid ${copied ? C.fresh : C.border}`, borderRadius: 12, padding: "11px", fontSize: 12, fontWeight: 700, color: copied ? C.fresh : C.muted, cursor: "pointer" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Kopiert!" : "Link"}
            </button>
            <button
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px", fontSize: 12, fontWeight: 700, color: C.muted, cursor: "pointer" }}
            >
              <Download size={14} /> SVG
            </button>
          </div>
        </div>

        {/* Template selector */}
        <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Vorlage wählen</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              style={{
                background: selected === t.id ? C.mintLight : "#fff",
                border: `1.5px solid ${selected === t.id ? C.fresh : C.border}`,
                borderRadius: 14, padding: "12px", cursor: "pointer", textAlign: "left",
                transition: "all .15s",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.dark }}>{t.name}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{t.desc}</div>
              <div style={{ marginTop: 4, fontSize: 9, fontWeight: 800, color: selected === t.id ? C.fresh : C.muted, background: selected === t.id ? `${C.fresh}15` : C.border, borderRadius: 4, padding: "2px 6px", display: "inline-block" }}>
                {t.format}
              </div>
            </button>
          ))}
        </div>

        {/* Brand guidelines */}
        <div style={{ background: "#fff", borderRadius: 18, border: `1px solid ${C.border}`, padding: "14px 16px", marginBottom: 16, boxShadow: `0 2px 10px rgba(6,13,8,.06)` }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 12 }}>Brand-Empfehlungen</div>
          {[
            { icon: "📍", text: "Stelle den Aufsteller gut sichtbar auf dem Tresen oder Tisch auf" },
            { icon: "🖨️", text: "Drucke auf 160g Papier für beste Haptik, laminiere für Langlebigkeit" },
            { icon: "💡", text: "Aktiviere einen Mitarbeiter, der Gäste kurz erklärt, wie der Scan funktioniert" },
            { icon: "📲", text: "Teile den Link in deiner Instagram-Bio und Story" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 16 }}>{r.icon}</span>
              <span style={{ fontSize: 12, color: C.dark, lineHeight: 1.5 }}>{r.text}</span>
            </div>
          ))}
        </div>

        {/* Social share kit */}
        <div style={{ background: CARD_GRADIENT, borderRadius: 18, padding: "16px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 6 }}>📱 Social Media Kit</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginBottom: 14 }}>
            Teile deinen spotloop-Link auf Instagram, WhatsApp oder per E-Mail.
          </div>
          <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 10, padding: "10px 12px", marginBottom: 12, fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,.7)", wordBreak: "break-all" }}>
            {qrUrl}
          </div>
          <button
            onClick={handleCopy}
            style={{ width: "100%", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "10px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {copied ? <><Check size={14} /> Kopiert!</> : <><Copy size={14} /> Link kopieren</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Print Templates ───────────────────────────────────────────────────────────
function TableTentPreview({ spot, qrUrl, message, bg }) {
  return (
    <div style={{ display: "inline-block", background: bg, borderRadius: 16, padding: "18px 16px", textAlign: "center", width: 160, boxShadow: `0 8px 32px ${bg}44` }}>
      <div style={{ fontSize: 18, color: "#fff", fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 }}>
        {spot?.emoji || "☕"} {spot?.name || "Mein Spot"}
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,.7)", fontWeight: 700, marginBottom: 10 }}>{message}</div>
      <div style={{ background: "#fff", borderRadius: 10, padding: 8, display: "inline-block", marginBottom: 10 }}>
        <QRCodeSVG value={qrUrl} size={80} level="M" />
      </div>
      <div style={{ fontSize: 8, color: "rgba(255,255,255,.6)", fontWeight: 700, letterSpacing: 1 }}>POWERED BY SPOTLOOP</div>
    </div>
  );
}

function StickerPreview({ spot, qrUrl, bg }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: bg, borderRadius: 12, padding: "10px 14px", boxShadow: `0 4px 20px ${bg}44` }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 6 }}>
        <QRCodeSVG value={qrUrl} size={56} level="M" />
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>spotloop</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.7)", fontWeight: 700, marginTop: 2 }}>Punkte sammeln</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)" }}>{spot?.name || "Mein Spot"}</div>
      </div>
    </div>
  );
}

function ReceiptPreview({ spot, qrUrl }) {
  return (
    <div style={{ display: "inline-block", background: "#fff", border: "1px dashed #ccc", borderRadius: 4, padding: "12px 16px", textAlign: "center", fontFamily: "monospace", width: 180 }}>
      <div style={{ fontSize: 9, fontWeight: 900, marginBottom: 4 }}>DANKE FÜR DEINEN BESUCH!</div>
      <div style={{ fontSize: 8, color: "#666", marginBottom: 8 }}>Sammle Punkte bei {spot?.name}</div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <QRCodeSVG value={qrUrl} size={60} level="M" />
      </div>
      <div style={{ fontSize: 7, color: "#999" }}>Scanne mich mit spotloop · Punkte sammeln</div>
    </div>
  );
}

function GenericPreview({ spot, qrUrl, bg, message, template }) {
  const configs = {
    menu_footer: { width: 240, height: 60, fontSize: 10 },
    counter_stand: { width: 130, height: 180, fontSize: 12 },
    poster: { width: 160, height: 200, fontSize: 13 },
  };
  const cfg = configs[template] || configs.counter_stand;
  return (
    <div style={{ display: "inline-flex", background: bg, borderRadius: 12, width: cfg.width, height: cfg.height, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, padding: 14, boxShadow: `0 6px 24px ${bg}44` }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 6 }}>
        <QRCodeSVG value={qrUrl} size={56} level="M" />
      </div>
      <div style={{ fontSize: cfg.fontSize, fontWeight: 900, color: "#fff", textAlign: "center" }}>{message}</div>
    </div>
  );
}
