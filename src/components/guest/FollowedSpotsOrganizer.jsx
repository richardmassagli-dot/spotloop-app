import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { C } from "../ui";
import {
  FOLLOWER_CATEGORY_BUCKETS,
  FOLLOWER_SORT_MODES,
  categoryCountsForFollowed,
  groupFollowedByCategory,
} from "../../lib/followedSpotOrganize";

/**
 * Sortieren & Kategorisieren gefolgter Spots (My Spots).
 */
export default function FollowedSpotsOrganizer({
  spots = [],
  sortMode = "activity",
  categoryFilter = "all",
  userCategories = {},
  onSortChange,
  onCategoryFilterChange,
  onAssignCategory,
  onSpotClick,
  SpotChip,
}) {
  const [editingSpot, setEditingSpot] = useState(null);
  const counts = categoryCountsForFollowed(spots);
  const visibleBuckets = FOLLOWER_CATEGORY_BUCKETS.filter(
    (b) => b.id === "all" || (counts[b.id] ?? 0) > 0,
  );
  const grouped = sortMode === "category" ? groupFollowedByCategory(spots) : null;

  const editingRow = editingSpot ? spots.find((s) => s.id === editingSpot) : null;

  return (
    <div
      style={{
        background: C.white,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        padding: 14,
        boxShadow: `0 4px 18px ${C.shadow}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SlidersHorizontal size={14} color={C.blue} />
          <span style={{ fontSize: 12, fontWeight: 800, color: C.dark }}>Sortieren & Kategorien</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{spots.length} Spots</span>
      </div>

      {/* Sortierung */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {FOLLOWER_SORT_MODES.map((mode) => {
          const active = sortMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSortChange?.(mode.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 99,
                border: `1.5px solid ${active ? C.green : C.border}`,
                background: active ? C.mintLight : C.bg,
                fontSize: 11,
                fontWeight: 800,
                color: active ? C.green : C.muted,
                cursor: "pointer",
              }}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Kategorie-Filter */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 12,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {visibleBuckets.map((bucket) => {
          const active = categoryFilter === bucket.id;
          const count = counts[bucket.id] ?? 0;
          return (
            <button
              key={bucket.id}
              type="button"
              onClick={() => onCategoryFilterChange?.(bucket.id)}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 99,
                border: `1.5px solid ${active ? C.green : C.border}`,
                background: active ? C.mintLight : C.white,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 14 }}>{bucket.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: active ? C.dark : C.muted }}>
                {bucket.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: active ? C.green : C.light,
                  background: active ? `${C.green}18` : C.bg,
                  padding: "2px 7px",
                  borderRadius: 99,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10, lineHeight: 1.45 }}>
        Tipp: Spot lange drücken, um die Kategorie manuell zu setzen (z.&nbsp;B. Italienisch, Sushi).
      </div>

      {/* Spot-Liste */}
      {spots.length === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 8px", fontSize: 12, color: C.muted }}>
          Keine Spots in dieser Kategorie.
        </div>
      ) : grouped ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {grouped.map(({ bucket, spots: groupSpots }) => (
            <div key={bucket.id}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.muted,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{bucket.emoji}</span>
                {bucket.label}
                <span style={{ color: C.light }}>({groupSpots.length})</span>
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
                {groupSpots.map((spot) => (
                  <SpotChip
                    key={spot.id}
                    spot={spot}
                    onClick={() => onSpotClick?.(spot.id)}
                    onLongPress={() => setEditingSpot(spot.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
          {spots.map((spot) => (
            <SpotChip
              key={spot.id}
              spot={spot}
              onClick={() => onSpotClick?.(spot.id)}
              onLongPress={() => setEditingSpot(spot.id)}
            />
          ))}
        </div>
      )}

      {/* Kategorie zuweisen */}
      <AnimatePresence>
        {editingRow && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSpot(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(10,22,40,.45)",
                zIndex: 300,
              }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 301,
                maxWidth: 390,
                margin: "0 auto",
                background: C.white,
                borderRadius: "24px 24px 0 0",
                padding: "20px 16px 32px",
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.dark }}>Kategorie zuordnen</div>
                <button
                  type="button"
                  onClick={() => setEditingSpot(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: C.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} color={C.muted} />
                </button>
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
                {editingRow.emoji} {editingRow.name}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FOLLOWER_CATEGORY_BUCKETS.filter((b) => b.id !== "all").map((bucket) => {
                  const active =
                    userCategories[editingRow.id] === bucket.id ||
                    (!userCategories[editingRow.id] && editingRow.bucket_id === bucket.id);
                  return (
                    <button
                      key={bucket.id}
                      type="button"
                      onClick={() => {
                        onAssignCategory?.(editingRow.id, bucket.id);
                        setEditingSpot(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: `1.5px solid ${active ? C.green : C.border}`,
                        background: active ? C.mintLight : C.white,
                        cursor: "pointer",
                        minWidth: "calc(50% - 4px)",
                        flex: "1 1 45%",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{bucket.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.dark }}>{bucket.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  onAssignCategory?.(editingRow.id, null);
                  setEditingSpot(null);
                }}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: C.bg,
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.muted,
                  cursor: "pointer",
                }}
              >
                Automatisch erkennen (Zurücksetzen)
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
