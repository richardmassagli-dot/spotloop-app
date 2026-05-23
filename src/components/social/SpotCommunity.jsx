import { C, Card } from "../ui";
import SocialAvatar from "./SocialAvatar";
import { getFoodMoments } from "../../lib/social";

export default function SpotCommunity({ spot, friendsFollowing = 0 }) {
  const moments = getFoodMoments().filter((m) => m.spot === spot?.name || m.spotId === spot?.id).slice(0, 3);
  const vipGuests = spot?.vip_guests ?? [];
  const communityMsg = spot?.community_message || spot?.page_config?.community_message;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Spot-Community</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>
        {communityMsg || "Empfehlungen & Momente — ruhig, lokal, ohne Feed-Overload."}
      </div>

      {vipGuests.length > 0 && (
        <Card style={{ padding: 12, marginBottom: 10, background: "#FFFBEB", border: `1px solid ${C.gold}35` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 8 }}>👑 Stammgast-Community</div>
          <div style={{ fontSize: 12, color: C.dark, lineHeight: 1.45 }}>
            Dieser Spot belohnt treue Gäste mit Stammgast-Boni — frag am Tresen nach deinem Vorteil.
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
            {vipGuests.length} Stammgast{vipGuests.length > 1 ? "e" : ""} in der Community
          </div>
        </Card>
      )}

      {friendsFollowing > 0 && (
        <Card style={{ padding: 12, marginBottom: 10, background: "#EFF6FF" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>
            {friendsFollowing} Freund{friendsFollowing > 1 ? "e" : ""} folgen diesem Spot
          </div>
        </Card>
      )}

      {spot?.current_action && (
        <Card style={{ padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.orange }}>Aktion vom Spot</div>
          <div style={{ fontSize: 13, color: C.dark, marginTop: 4 }}>{spot.current_action}</div>
        </Card>
      )}

      {moments.length > 0 ? (
        moments.map((m) => (
          <Card key={m.id} style={{ padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <SocialAvatar initials={m.avatar} color={m.color} size={36} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{m.user}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{m.dish} · {m.caption}</div>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div style={{ fontSize: 12, color: C.muted, padding: "8px 0" }}>Noch keine Food Moments — sei der Erste.</div>
      )}

      <Card style={{ padding: 12, marginTop: 8, border: `1px dashed ${C.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>Gemeinsame Rewards</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>
          Bring einen Freund mit — Bonuspunkt beim nächsten Besuch (Pilot).
        </div>
      </Card>
    </div>
  );
}
