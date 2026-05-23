import { Heart, ScanLine } from "lucide-react";
import { C, Card } from "../ui";
import { FOLLOW_VS_COLLECT } from "../../data/spotloopProductRules";

/** Erklärt Folgen vs. Sammeln — für Gäste & Spots. */
export default function FollowVsCollectCard({ compact = false }) {
  return (
    <Card style={{ padding: compact ? 14 : 16, marginBottom: 14, background: C.mintLight, border: `1px solid ${C.fresh}25` }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>{FOLLOW_VS_COLLECT.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Row icon={<Heart size={14} color={C.blue} />} title={FOLLOW_VS_COLLECT.follow.headline} body={FOLLOW_VS_COLLECT.follow.body} />
        <Row icon={<ScanLine size={14} color={C.green} />} title={FOLLOW_VS_COLLECT.collect.headline} body={FOLLOW_VS_COLLECT.collect.body} />
      </div>
    </Card>
  );
}

function Row({ icon, title, body }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.dark }}>{title}</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}
