import { useMemo, useState } from "react";
import { BarChart3, Users, Send, Image, ChevronRight } from "lucide-react";
import { C, Card } from "../../components/ui";
import MerchantSubBack from "../../components/merchant/MerchantSubBack";
import { buildCampaignReport } from "../../lib/campaignIntelligence";

export default function MerchantCampaigns({ campaigns }) {
  const report = useMemo(() => buildCampaignReport(campaigns), [campaigns]);
  const { stats, typeBreakdown, insightText, history } = report;
  const [detail, setDetail] = useState(null);

  if (detail) {
    const c = detail;
    return (
      <div>
        <MerchantSubBack
          title={c.meta?.label || "Kampagne"}
          subtitle={c.dateLabel}
          onBack={() => setDetail(null)}
        />
        <Card style={{ padding: 16, overflow: "hidden" }}>
          {c.image_url && (
            <img
              src={c.image_url}
              alt=""
              style={{
                width: "100%",
                maxHeight: 200,
                objectFit: "cover",
                borderRadius: 12,
                marginBottom: 14,
              }}
            />
          )}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>NACHRICHT</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, lineHeight: 1.5, marginBottom: 16 }}>
            {c.message}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: C.muted }}>Empfänger</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{c.recipient_count ?? "—"}</div>
            </div>
            <div style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, color: C.muted }}>Status</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{c.status || "gesendet"}</div>
            </div>
          </div>
          {c.extra && (
            <div style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>Zielgruppe: {c.extra}</div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Kampagnen-Auswertung</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.45 }}>
        Übersicht deiner gesendeten Kampagnen — nur Auswertung, kein Versand von hier.
      </div>

      <Card
        style={{
          padding: 16,
          marginBottom: 14,
          background: `linear-gradient(135deg, ${C.mintLight} 0%, ${C.white} 100%)`,
          border: `1.5px solid ${C.mint}`,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <BarChart3 size={22} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.5, fontWeight: 600 }}>{insightText}</div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[
          { label: "Gesendet", val: stats.sent, icon: <Send size={14} /> },
          { label: "Empfänger", val: stats.totalRecipients, icon: <Users size={14} /> },
          { label: "Ø pro Kampagne", val: stats.avgRecipients, icon: <Users size={14} /> },
          { label: "Mit Bild", val: stats.withImage, icon: <Image size={14} /> },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px 10px",
            }}
          >
            <div style={{ color: C.muted, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.dark }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 16 }}>
        Letzte Kampagne: {stats.lastLabel}
      </div>

      {typeBreakdown.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Nach Typ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {typeBreakdown.map((row) => (
              <div
                key={row.type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 20 }}>{row.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {row.count}× gesendet · {row.recipients} Empfänger
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>
        Alle Kampagnen ({history.length})
      </div>

      {history.length === 0 ? (
        <Card style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Noch keine Daten</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
            Nach dem ersten Versand unter „Kampagnen → Senden“ erscheint hier die Auswertung.
          </div>
        </Card>
      ) : (
        history.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setDetail(c)}
            style={{
              width: "100%",
              textAlign: "left",
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "12px 14px",
              marginBottom: 8,
              cursor: "pointer",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            {c.image_url ? (
              <img
                src={c.image_url}
                alt=""
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  background: C.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {c.meta?.icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.dark,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.message}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                {c.meta?.label}
                {c.recipient_count != null ? ` · ${c.recipient_count} Empfänger` : ""}
                {c.extra ? ` · ${c.extra}` : ""}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{c.dateLabel}</div>
            </div>
            <ChevronRight size={18} color={C.muted} />
          </button>
        ))
      )}
    </div>
  );
}
