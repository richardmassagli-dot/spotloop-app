import { Bell, ChevronRight, Zap } from "lucide-react";
import { C, Card } from "../ui";
import { NOTIFICATION_RULES_COPY } from "../../data/spotloopRetentionTriggers";

/**
 * Automatische Gastronomen-Trigger — übersichtliche Inbox im Dashboard.
 */
export default function MerchantTriggerInbox({ triggers = [], onAction }) {
  const actionable = triggers.filter((t) => t.oneTap && t.action);
  if (!triggers.length) return null;

  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12, border: `1px solid ${C.blue}25` }}>
      <div
        style={{
          padding: "12px 16px",
          background: `${C.blue}08`,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Bell size={16} color={C.blue} />
        <div style={{ fontSize: 13, fontWeight: 900, color: C.dark }}>Für dich — jetzt relevant</div>
        {actionable.length > 0 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              fontWeight: 800,
              background: C.orange,
              color: "#fff",
              borderRadius: 99,
              padding: "2px 8px",
            }}
          >
            {actionable.length}
          </span>
        )}
      </div>

      {triggers.slice(0, 4).map((t, i) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onAction?.(t)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 16px",
            border: "none",
            borderBottom: i < Math.min(triggers.length, 4) - 1 ? `1px solid ${C.border}` : "none",
            background: t.highlight ? `${C.mintLight}` : C.white,
            cursor: t.oneTap ? "pointer" : "default",
            textAlign: "left",
            fontFamily: "inherit",
            minHeight: 44,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background:
                t.severity === "high" ? `${C.orange}18` : t.severity === "medium" ? `${C.blue}12` : C.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap
              size={16}
              color={t.severity === "high" ? C.orange : t.severity === "medium" ? C.blue : C.muted}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.3 }}>
              {t.title}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginTop: 4, lineHeight: 1.4 }}>
              {t.body}
            </div>
            {t.action && (
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blue, marginTop: 8 }}>{t.action} →</div>
            )}
          </div>
          {t.oneTap && <ChevronRight size={18} color={C.muted} style={{ flexShrink: 0, marginTop: 8 }} />}
        </button>
      ))}

      <div style={{ padding: "10px 14px", background: C.bg, fontSize: 10, color: C.muted, lineHeight: 1.45 }}>
        {NOTIFICATION_RULES_COPY.right}
      </div>
    </Card>
  );
}
