import { motion } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";
import { C } from "../ui";

export default function PaymentTile({ payment, onSpotClick, featured = false, index = 0 }) {
  const bg = payment.stamp?.spot?.bg_color || C.blue;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onSpotClick(payment.spot_id)}
      style={{
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        background: featured
          ? `linear-gradient(155deg, ${bg}14 0%, #FFFFFF 42%, #F8FAFF 100%)`
          : "linear-gradient(165deg, #FFFFFF 0%, #F8FAFF 55%, #F1F5FF 100%)",
        border: featured ? `1.5px solid ${bg}35` : `1px solid rgba(226, 232, 245, 0.95)`,
        borderRadius: 22,
        padding: "16px 18px",
        boxShadow: featured
          ? `0 0 0 1px ${bg}18, 0 16px 40px ${bg}22, 0 6px 16px rgba(10, 22, 40, 0.07)`
          : "0 1px 0 rgba(255,255,255,1) inset, 0 10px 28px rgba(10, 22, 40, 0.06), 0 2px 8px rgba(10, 22, 40, 0.04)",
      }}
    >
      {featured && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: 3,
            borderRadius: "0 4px 4px 0",
            background: `linear-gradient(180deg, ${bg}, ${C.sky})`,
          }}
        />
      )}

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: `linear-gradient(145deg, ${bg}22 0%, ${bg}08 100%)`,
            border: `1px solid ${bg}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            flexShrink: 0,
            boxShadow: `0 6px 16px ${bg}18`,
          }}
        >
          {payment.emoji || "🏪"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, letterSpacing: -0.3 }}>
              {payment.spot_name}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, flexShrink: 0 }}>
              {payment.dateLabel}
            </span>
          </div>

          {payment.amountLabel ? (
            <div style={{ fontSize: 15, fontWeight: 900, color: C.dark, marginTop: 6, letterSpacing: -0.3 }}>
              {payment.amountLabel}
              <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}> bezahlt</span>
            </div>
          ) : (
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginTop: 6 }}>Zahlung verbunden</div>
          )}

          {payment.description && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>
              {payment.description}
            </div>
          )}

          <div
            style={{
              marginTop: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: `linear-gradient(135deg, ${C.mintLight}, #FFFFFF)`,
              border: `1px solid ${C.fresh}30`,
              borderRadius: 99,
              padding: "5px 12px",
              boxShadow: `0 2px 8px ${C.shadow}`,
            }}
          >
            <Zap size={12} color={C.fresh} strokeWidth={2.5} />
            <span style={{ fontSize: 11, fontWeight: 800, color: C.blue }}>
              +{payment.stamps_earned} Stempel automatisch
            </span>
          </div>

          {payment.nextReward && (
            <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginTop: 8 }}>
              {payment.nextReward}
            </div>
          )}
        </div>

        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(241, 245, 255, 0.9)",
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          <ChevronRight size={16} color={C.light} strokeWidth={2.5} />
        </div>
      </div>
    </motion.button>
  );
}
