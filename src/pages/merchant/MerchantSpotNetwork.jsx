import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { C, Card, Btn, Alert } from "../../components/ui";
import {
  getMerchantNetwork,
  createLocalGroup,
  linkSpotToGroup,
  seedDemoNetworkForMerchant,
  SPOT_GROUP_TYPES,
} from "../../lib/spotGroups";

export default function MerchantSpotNetwork({ merchantId, spot }) {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState("community");
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState("");

  const reload = async () => {
    setLoading(true);
    const n = await getMerchantNetwork(merchantId, spot);
    setNetwork(n);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [merchantId, spot?.id]);

  const handleSeedDemo = () => {
    seedDemoNetworkForMerchant(merchantId, spot?.id);
    setMsg("Demo-Netzwerk „Pizza Roma“ geladen.");
    reload();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const brand = network?.brand;
    const type = !brand ? "brand" : newType;
    const g = createLocalGroup(merchantId, {
      type,
      name: newName.trim(),
      parent_id: type === "brand" ? null : brand?.id || null,
      emoji: SPOT_GROUP_TYPES[type]?.emoji,
      description: SPOT_GROUP_TYPES[type]?.desc,
    });
    if (spot?.id) linkSpotToGroup(merchantId, g.id, spot.id, type === "location");
    setNewName("");
    setMsg(type === "brand" ? "Hauptmarke angelegt." : "Gruppe erstellt.");
    reload();
  };

  if (loading) return <div style={{ padding: 24, color: C.muted, fontSize: 13 }}>Netzwerk wird geladen…</div>;

  const hasNetwork = network?.groups?.length > 0;

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Spot-Netzwerk</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.55 }}>
        Pflege Hauptmarke, Standorte, Community-, Event- und Reward-Gruppen — ein Gastro-Konzern als aktiviertes Netzwerk, nicht nur ein einzelner Pin.
      </div>

      {msg && <Alert type="success" style={{ marginBottom: 12 }}>{msg}</Alert>}

      {!hasNetwork && (
        <Card style={{ marginBottom: 16, textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🌐</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Noch kein Netzwerk</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
            Lege eine Hauptmarke an oder starte mit der Demo-Struktur (Pizza Roma).
          </div>
          <Btn small onClick={handleSeedDemo}>Demo-Netzwerk laden</Btn>
        </Card>
      )}

      {hasNetwork && (
        <>
          <Card style={{ marginBottom: 14, background: C.mintLight, border: `1px solid ${C.fresh}30` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.green, marginBottom: 6 }}>HAUPTMARKE</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.dark }}>
              {network.brand?.emoji} {network.brand?.name}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{network.brand?.description}</div>
          </Card>

          {[
            { key: "locations", label: "Standorte", items: network.locations },
            { key: "subgroups", label: "Untergruppen", items: network.subgroups },
            { key: "communities", label: "Community-Gruppen", items: network.communities },
            { key: "events", label: "Event-Gruppen", items: network.events },
            { key: "rewards", label: "Reward-Gruppen", items: network.rewards },
          ].map(({ label, items }) =>
            items?.length > 0 ? (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, marginBottom: 8 }}>{label}</div>
                {items.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
                      padding: "10px 12px", marginBottom: 8, display: "flex", gap: 10, alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{g.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{g.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null,
          )}
        </>
      )}

      <Card style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Neue Gruppe</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {Object.values(SPOT_GROUP_TYPES).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setNewType(t.id)}
              style={{
                borderRadius: 99, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${newType === t.id ? C.green : C.border}`,
                background: newType === t.id ? C.mintLight : C.white,
                color: newType === t.id ? C.green : C.muted,
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={`Name der ${SPOT_GROUP_TYPES[newType]?.label}`}
          style={{
            width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12,
            border: `1.5px solid ${C.border}`, fontSize: 14, marginBottom: 12,
          }}
        />
        <Btn small onClick={handleCreate}>
          <Plus size={16} /> Gruppe anlegen
        </Btn>
      </Card>

      {spot?.id && hasNetwork && (
        <div style={{ marginTop: 12, fontSize: 11, color: C.muted }}>
          Dieser Standort ({spot.name}) kann mehreren Gruppen zugeordnet werden — Rewards und Community gelten netzwerkweit konfigurierbar.
        </div>
      )}
    </div>
  );
}
