import { AlertTriangle, Moon, Sparkles, Send, Mail } from "lucide-react";
import { C } from "../ui";
import { formatEuro } from "../../lib/merchantOverview";
import { SLEEP_RISK_LABELS } from "../../data/stammgaesteMessaging";

/**
 * Anonymes Stammgast-Profil für Merchant (Gast #A72X, Besuche, Umsatz, Risiko).
 */
export default function StammGuestProfileCard({
  guest,
  compact = false,
  isLast = false,
  onSuggestReactivation,
  onSuggestInvite,
  busy = false,
}) {
  const risk = guest.sleepRisk;
  const RiskIcon = risk?.level === "critical" ? AlertTriangle : Moon;

  return (
    <div
      style={{
        padding: compact ? "12px 14px" : "14px 16px",
        borderBottom: compact && !isLast ? `1px solid ${C.border}` : "none",
        background: compact ? "transparent" : C.white,
        borderRadius: compact ? 0 : 14,
        border: compact ? "none" : `1px solid ${C.border}`,
        marginBottom: compact ? 0 : 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: compact ? 13 : 15, fontWeight: 900, color: C.dark }}>{guest.pseudonym}</div>
          {!compact && guest.rank && (
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginTop: 2 }}>
              Top {guest.rank} · Top 10 %
            </div>
          )}
        </div>
        {risk && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 9,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              padding: "4px 8px",
              borderRadius: 99,
              background: risk.level === "critical" ? `${C.orange}18` : `${C.blue}12`,
              color: risk.level === "critical" ? C.orange : C.blue,
              flexShrink: 0,
            }}
          >
            <RiskIcon size={10} />
            {SLEEP_RISK_LABELS[risk.level] || risk.label}
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr 1fr 1fr" : "repeat(3, 1fr)",
          gap: 8,
          marginTop: 10,
          fontSize: 11,
          color: C.muted,
        }}
      >
        <Stat label="Besuche (Monat)" value={String(guest.visitsThisMonth ?? guest.visitCount ?? 0)} />
        <Stat label="Zuletzt" value={guest.lastVisitLabel || "—"} />
        <Stat label="Umsatz (geschätzt)" value={formatEuro(guest.revenueMonthEstimate ?? 0)} highlight />
      </div>

      {guest.patternHint && (
        <div
          style={{
            marginTop: 10,
            fontSize: 11,
            color: C.teal,
            fontWeight: 600,
            lineHeight: 1.45,
            display: "flex",
            alignItems: "flex-start",
            gap: 6,
          }}
        >
          <Sparkles size={12} style={{ flexShrink: 0, marginTop: 1 }} />
          {guest.patternHint}
          {guest.patternHint.includes("Kampagnen") && !compact && (
            <span style={{ color: C.muted, fontWeight: 500 }}> — z. B. Happy Hour gezielt legen</span>
          )}
        </div>
      )}

      {risk && !compact && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 10,
            background: risk.level === "critical" ? C.orangeLight : C.mintLight,
            border: `1px solid ${risk.level === "critical" ? `${C.orange}30` : `${C.fresh}25`}`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dark, lineHeight: 1.45 }}>
            {guest.daysSinceVisit} Tage nicht da — {risk.suggestion}
          </div>
          {(onSuggestReactivation || onSuggestInvite) && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                risk.action === "invite" ? onSuggestInvite?.(guest) : onSuggestReactivation?.(guest)
              }
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 10,
                border: "none",
                background: C.green,
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                cursor: busy ? "wait" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {risk.action === "invite" ? <Mail size={12} /> : <Send size={12} />}
              {risk.action === "invite" ? "Einladung vorschlagen" : "Reaktivierung vorschlagen"}
            </button>
          )}
        </div>
      )}

      {compact && risk && (
        <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, marginTop: 6 }}>
          {guest.daysSinceVisit} Tage weg · {risk.suggestion}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.3 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: highlight ? C.green : C.dark, marginTop: 2 }}>{value}</div>
    </div>
  );
}
