import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { C, Card, Spinner } from "../ui";
import { loadGuestCommunityMemberships } from "../../lib/spotCommunities";

export default function MyCommunitiesPanel({ userId }) {
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadGuestCommunityMemberships(userId)
      .then(({ active: a }) => setActive(a))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (active.length === 0) return null;

  return (
    <div style={{ margin: "0 16px 16px" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <Users size={16} color={C.blue} />
        Meine Communities
      </div>
      {active.map((m) => {
        const c = m.community || {};
        const spot = c.spot || {};
        return (
          <Card key={m.id || m.community_id} style={{ padding: 12, marginBottom: 8, background: "#EFF6FF", border: `1px solid ${C.blue}20` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>
              {c.emoji || "👥"} {c.name || "Community"}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              {spot.emoji} {spot.name || "Spot"}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
