import { useState, useEffect } from "react";
import { Users, Sparkles, Check, X } from "lucide-react";
import { C, Card } from "../ui";
import { PrivacyNote } from "../trust";
import {
  loadGuestCommunityMemberships,
  loadSpotCommunities,
  respondCommunityInvite,
} from "../../lib/spotCommunities";
import { canReceiveCommunityInvites, getPrivacyPrefs } from "../../lib/privacy";

export default function SpotCommunityMembership({ userId, spotId, spotName }) {
  const [invites, setInvites] = useState([]);
  const [active, setActive] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [busy, setBusy] = useState(null);

  const reload = async () => {
    const [mem, comms] = await Promise.all([
      loadGuestCommunityMemberships(userId),
      loadSpotCommunities(spotId),
    ]);
    const forSpot = (rows) =>
      rows.filter((m) => {
        const sid = m.community?.spot_id || m.spot_id;
        const cid = m.community_id;
        return sid === spotId || comms.some((c) => c.id === cid);
      });
    setInvites(forSpot(mem.invites));
    setActive(forSpot(mem.active));
    setClubs(comms);
  };

  useEffect(() => {
    if (userId && spotId) reload();
  }, [userId, spotId]);

  if (!canReceiveCommunityInvites()) {
    return (
      <Card style={{ padding: 14, marginTop: 12, background: C.mintLight }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>Community-Einladungen deaktiviert</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
          Aktiviere Einladungen unter Datenschutz & Sicherheit.
        </div>
      </Card>
    );
  }

  const handleRespond = async (m, accept) => {
    setBusy(m.id || m.community_id);
    try {
      await respondCommunityInvite({
        memberId: m.id,
        communityId: m.community_id,
        userId,
        accept,
        visibleToSpot: getPrivacyPrefs().community_visible_to_spot !== false,
      });
      await reload();
    } finally {
      setBusy(null);
    }
  };

  const spotInvites = invites.filter((m) => {
    const c = m.community || clubs.find((x) => x.id === m.community_id);
    return c?.spot_id === spotId || m.spot_id === spotId;
  });
  const spotActive = active.filter((m) => {
    const c = m.community || clubs.find((x) => x.id === m.community_id);
    return c?.spot_id === spotId || m.spot_id === spotId;
  });

  if (spotInvites.length === 0 && spotActive.length === 0 && clubs.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
        <Users size={16} color={C.blue} />
        Community bei {spotName || "diesem Spot"}
      </div>
      <PrivacyNote variant="info">
        Du entscheidest selbst über Beitritt und Sichtbarkeit — der Spot sieht nur dein Pseudonym.
      </PrivacyNote>

      {spotInvites.map((m) => {
        const c = m.community || clubs.find((x) => x.id === m.community_id) || {};
        return (
          <Card key={m.id || m.community_id} style={{ padding: 14, marginTop: 10, border: `1.5px solid ${C.blue}35` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.blue, marginBottom: 6 }}>Einladung</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>
              {c.emoji || "👥"} {c.name || "Community"}
            </div>
            {c.description && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.45 }}>{c.description}</div>
            )}
            {(c.perks || []).length > 0 && (
              <div style={{ fontSize: 11, color: C.dark, marginTop: 8 }}>
                {(c.perks || []).slice(0, 3).map((p) => (
                  <span key={p} style={{ display: "inline-block", marginRight: 6, marginBottom: 4 }}>
                    ✓ {p}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                disabled={busy === (m.id || m.community_id)}
                onClick={() => handleRespond(m, true)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "11px",
                  borderRadius: 12,
                  border: "none",
                  background: C.blue,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <Check size={14} /> Beitreten
              </button>
              <button
                type="button"
                disabled={busy === (m.id || m.community_id)}
                onClick={() => handleRespond(m, false)}
                style={{
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.muted,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </Card>
        );
      })}

      {spotActive.map((m) => {
        const c = m.community || clubs.find((x) => x.id === m.community_id) || {};
        return (
          <Card key={`active-${m.id}`} style={{ padding: 12, marginTop: 10, background: "#EFF6FF", border: `1px solid ${C.blue}25` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color={C.blue} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>
                  Mitglied · {c.emoji} {c.name}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>Community-Vorteile aktiv</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
