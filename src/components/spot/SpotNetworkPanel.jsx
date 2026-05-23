import { ChevronRight } from "lucide-react";
import { C } from "../ui";
import { SPOT_GROUP_TYPES } from "../../lib/spotGroups";

function GroupChip({ group, onPress }) {
  const meta = SPOT_GROUP_TYPES[group.type] || {};
  const inner = (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
      cursor: onPress ? "pointer" : "default",
    }}>
      <span style={{ fontSize: 20 }}>{group.emoji || meta.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {meta.label || group.type}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{group.name}</div>
        {group.description && (
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.35 }}>{group.description}</div>
        )}
      </div>
      {onPress && <ChevronRight size={16} color={C.muted} />}
    </div>
  );
  if (onPress) {
    return <button type="button" onClick={onPress} style={{ width: "100%", background: "none", border: "none", padding: 0, textAlign: "left" }}>{inner}</button>;
  }
  return inner;
}

export default function SpotNetworkPanel({ network, currentSpotId, onSpotClick, compact }) {
  if (!network?.brand) return null;

  const { brand, locations, communities, events, rewards, subgroups } = network;
  const otherLocations = (locations || []).filter(
    (loc) => !network.members?.some((m) => m.group_id === loc.id && m.spot_id === currentSpotId && m.is_primary),
  );

  return (
    <div style={{
      margin: compact ? "12px 0 0" : "0 0 16px",
      background: `linear-gradient(135deg, ${C.navy}08, ${C.mintLight})`,
      border: `1px solid ${C.border}`, borderRadius: compact ? 16 : 20,
      padding: compact ? "14px" : "16px",
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1.2, marginBottom: 4 }}>
        SPOT-NETZWERK
      </div>
      <div style={{ fontSize: 15, fontWeight: 900, color: C.dark, marginBottom: 8 }}>
        {brand.emoji} {brand.name}
      </div>
      {brand.description && (
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{brand.description}</div>
      )}

      {otherLocations.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, marginBottom: 8 }}>Weitere Standorte</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {otherLocations.map((loc) => (
              <GroupChip
                key={loc.id}
                group={loc}
                onPress={onSpotClick ? () => {
                  const m = network.members?.find((x) => x.group_id === loc.id);
                  if (m?.spot_id) onSpotClick(m.spot_id);
                } : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {[...communities, ...events, ...rewards, ...subgroups].length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted }}>Gruppen in diesem Netzwerk</div>
          {communities.map((g) => <GroupChip key={g.id} group={g} />)}
          {events.map((g) => <GroupChip key={g.id} group={g} />)}
          {rewards.map((g) => <GroupChip key={g.id} group={g} />)}
          {subgroups.map((g) => <GroupChip key={g.id} group={g} />)}
        </div>
      )}
    </div>
  );
}
