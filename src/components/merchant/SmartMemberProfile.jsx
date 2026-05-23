import { Shield } from "lucide-react";
import { C } from "../ui";
import { buildSmartMemberProfile } from "../../lib/privacy";

/**
 * Anonymes Loyalty-Profil für Merchants — kein echter Name, keine Zahlungsdaten.
 */
export default function SmartMemberProfile({
  userId,
  spotId,
  stamp,
  visitCount,
  rewardsRedeemed = 0,
  compact = false,
}) {
  const profile = buildSmartMemberProfile({
    userId,
    spotId,
    stamp,
    visitCount,
    rewardsRedeemed,
  });

  if (profile.restricted) {
    return (
      <div
        style={{
          padding: compact ? "12px 14px" : "16px 18px",
          borderRadius: 18,
          background: C.mintLight,
          border: `1px solid ${C.border}`,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Shield size={18} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{profile.pseudonym}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.45 }}>{profile.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        background: "linear-gradient(165deg, #FFFFFF 0%, #F8FAFF 55%, #F1F5FF 100%)",
        boxShadow: "0 10px 28px rgba(10, 22, 40, 0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: compact ? "12px 16px" : "14px 18px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Smart Member Profile
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.dark, letterSpacing: -0.3, marginTop: 2 }}>
            {profile.pseudonym}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {profile.engagementMeta && (
            <div style={{ fontSize: 10, fontWeight: 800, color: profile.engagementMeta.color }}>
              {profile.engagementMeta.emoji} {profile.engagementMeta.label}
            </div>
          )}
          {profile.tier && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: C.blue,
                background: `${C.blue}12`,
                border: `1px solid ${C.blue}25`,
                borderRadius: 99,
                padding: "6px 12px",
                whiteSpace: "nowrap",
              }}
            >
              {profile.tier.emoji} {profile.tier.label}
            </div>
          )}
        </div>
      </div>

      {profile.engagement != null && !compact && (
        <div style={{ padding: "10px 16px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, marginBottom: 6 }}>
            <span>Engagement-Score</span>
            <span style={{ fontWeight: 800, color: profile.engagementMeta?.color }}>{profile.engagement}/100</span>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${profile.engagement}%`,
                background: `linear-gradient(90deg, ${profile.engagementMeta?.color || C.blue}, ${C.sky})`,
                borderRadius: 99,
              }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr 1fr" : "repeat(2, 1fr)",
          gap: 0,
        }}
      >
        {profile.metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              padding: "12px 16px",
              borderRight: i % 2 === 0 ? `1px solid ${C.border}` : "none",
              borderBottom: i < profile.metrics.length - 2 ? `1px solid ${C.border}` : "none",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginTop: 4 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {stamp && (
        <div style={{ padding: "10px 16px 12px", fontSize: 10, color: C.muted, borderTop: `1px solid ${C.border}` }}>
          Stempelkarte: {profile.points}/{profile.maxPoints}
          {profile.rewardReady ? " · Reward bereit" : ""}
        </div>
      )}
    </div>
  );
}
