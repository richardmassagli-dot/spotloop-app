import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, ChevronUp } from "lucide-react";
import { C } from "../ui";
import StampCard from "./StampCard";

const STACK_OFFSET = 36;
const SCALE_STEP = 0.028;

/**
 * Stempelkarten wie Apple Wallet — gestapelt, ab 2 Karten.
 * Tap auf Stapel: aufklappen · erneut: stapeln.
 */
export default function StackedStampCards({
  stamps = [],
  onSpotClick,
  onRedeem,
  redeeming,
  showCta = true,
  emptyMessage = "Noch keine Stempelkarten",
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...stamps].sort((a, b) => {
    if (a.reward_ready && !b.reward_ready) return -1;
    if (!a.reward_ready && b.reward_ready) return 1;
    return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || 0);
  });
  const count = sorted.length;

  if (count === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "32px 20px",
          borderRadius: 20,
          border: `1.5px dashed ${C.border}`,
          background: C.white,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{emptyMessage}</div>
      </div>
    );
  }

  if (count === 1) {
    const s = sorted[0];
    return (
      <StampCard
        stamp={s}
        spot={s.spot}
        variant="full"
        showCta={showCta}
        onPress={() => onSpotClick?.(s.spot_id)}
        onRedeem={onRedeem ? (e) => onRedeem(s, e) : undefined}
        redeeming={redeeming === s.spot_id}
      />
    );
  }

  if (expanded) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            background: C.mintLight,
            border: `1px solid ${C.fresh}35`,
            borderRadius: 99,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: C.green,
            cursor: "pointer",
          }}
        >
          <Layers size={14} />
          Stapeln ({count})
          <ChevronUp size={14} />
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sorted.map((s) => (
            <StampCard
              key={s.id}
              stamp={s}
              spot={s.spot}
              variant="full"
              showCta={showCta}
              onPress={() => onSpotClick?.(s.spot_id)}
              onRedeem={onRedeem ? (e) => onRedeem(s, e) : undefined}
              redeeming={redeeming === s.spot_id}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: 12,
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "10px 14px",
          cursor: "pointer",
          boxShadow: `0 2px 10px ${C.shadow}`,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: C.dark }}>
          <Layers size={16} color={C.teal} />
          {count} Stempelkarten
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>Tippen zum Aufklappen</span>
      </button>

      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: (count - 1) * STACK_OFFSET,
        }}
      >
        {sorted.map((stamp, i) => {
          const isTop = i === 0;
          const z = count - i;
          const scale = 1 - i * SCALE_STEP;

          return (
            <motion.div
              key={stamp.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: isTop ? "relative" : "absolute",
                top: isTop ? 0 : i * STACK_OFFSET,
                left: 0,
                right: 0,
                zIndex: z,
                transform: isTop ? undefined : `scale(${scale})`,
                transformOrigin: "top center",
                pointerEvents: "auto",
              }}
            >
              <div
                style={{
                  boxShadow: isTop
                    ? `0 20px 48px rgba(10, 22, 40, 0.18)`
                    : `0 8px 24px rgba(10, 22, 40, 0.12)`,
                  borderRadius: 20,
                }}
              >
                <StampCard
                  stamp={stamp}
                  spot={stamp.spot}
                  variant="full"
                  showCta={showCta && isTop}
                  onPress={() => onSpotClick?.(stamp.spot_id)}
                  onRedeem={onRedeem && isTop ? (e) => onRedeem(stamp, e) : undefined}
                  redeeming={redeeming === stamp.spot_id}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: C.muted, fontWeight: 600 }}>
        Wische die oberste Karte — {count - 1} weitere im Stapel
      </div>
    </div>
  );
}
