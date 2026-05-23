import { motion } from "framer-motion";
import { MapPin, Compass } from "lucide-react";
import { C, Spinner } from "../ui";
import SectionHeader from "./SectionHeader";
import { SpotListTile } from "../tiles/SpotTiles";
import { formatDistanceKm } from "../../lib/nearbySpots";

function NearbySpotRow({ spot, stamp, socialHint, onPress, onAdd, index }) {
  const dist = formatDistanceKm(spot._distanceKm);
  const extraParts = [dist, socialHint?.friends > 0 ? socialHint.label : null, spot.area].filter(Boolean);

  return (
    <SpotListTile
      spot={spot}
      stamp={stamp}
      extraLine={extraParts.join(" · ")}
      onPress={onPress}
      index={index}
      action={
        stamp ? (
          <span
            style={{
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 800,
              color: C.blue,
              padding: "10px 12px",
              background: `${C.blue}10`,
              borderRadius: 12,
            }}
          >
            In Wallet
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            style={{
              flexShrink: 0,
              background: "linear-gradient(145deg, #EFF6FF 0%, #FFFFFF 100%)",
              color: C.blue,
              border: `1px solid ${C.blue}30`,
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(27, 79, 216, 0.12)",
            }}
          >
            + Wallet
          </button>
        )
      }
    />
  );
}

export default function HomeNearbySection({
  spots,
  stampBySpotId = {},
  socialHintFor,
  loading,
  onSpotClick,
  onCheckin,
  onDiscover,
}) {
  return (
    <section style={{ marginTop: 26, marginBottom: 8 }}>
      <SectionHeader label="In deiner Nähe" actionLabel="Karte" onAction={onDiscover} icon={MapPin} />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 28 }}>
          <Spinner size={28} />
        </div>
      ) : spots.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {spots.map((spot, i) => (
            <NearbySpotRow
              key={spot.id}
              spot={spot}
              stamp={stampBySpotId[spot.id]}
              socialHint={socialHintFor?.(spot.id)}
              onPress={() => onSpotClick(spot.id)}
              onAdd={() => onCheckin(spot.id)}
              index={i}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(165deg, #FFFFFF 0%, #F8FAFF 100%)",
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            padding: "22px 18px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 12px",
              borderRadius: 14,
              background: `${C.blue}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Compass size={24} color={C.blue} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Noch keine Spots geladen</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>
            Öffne die Karte und entdecke Lokale in deiner Umgebung.
          </div>
          {onDiscover && (
            <button
              type="button"
              onClick={onDiscover}
              style={{
                background: "none",
                border: "none",
                color: C.blue,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Zur Karte →
            </button>
          )}
        </motion.div>
      )}
    </section>
  );
}
