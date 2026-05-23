import { Shield } from "lucide-react";
import { C, Card } from "../ui";
import {
  MEMBER_SPAM_PROTECTION,
  REACTIVATION_RULES,
  BALANCE_SUMMARY,
} from "../../data/spotloopProductRules";

/** Spam-Schutz & Reaktivierung — für Merchant-Kampagne. */
export default function MemberProtectionCard({ showReactivation = true }) {
  return (
    <Card style={{ padding: 14, marginBottom: 14, background: "#F8FAFF", border: `1px solid ${C.blue}20` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Shield size={16} color={C.blue} />
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{MEMBER_SPAM_PROTECTION.title}</div>
      </div>
      <ul style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
        {MEMBER_SPAM_PROTECTION.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {showReactivation && (
        <div style={{ fontSize: 11, color: C.dark, lineHeight: 1.45, marginBottom: 10, padding: "10px 12px", background: C.white, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <strong>{REACTIVATION_RULES.title}</strong>
          <br />
          {REACTIVATION_RULES.body}
        </div>
      )}
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 0.5, marginBottom: 6 }}>DAS GLEICHGEWICHT</div>
      {BALANCE_SUMMARY.map((row) => (
        <div key={row.role} style={{ fontSize: 10, color: C.muted, lineHeight: 1.45, marginBottom: 4 }}>
          <span style={{ fontWeight: 800, color: C.dark }}>{row.role}</span> → {row.rule}
        </div>
      ))}
    </Card>
  );
}
