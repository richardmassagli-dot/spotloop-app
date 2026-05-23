import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { C } from "../ui";
import StammgaesteMetricsGrid, { StammgaesteScoreBar } from "./StammgaesteMetricsGrid";

/** Full-width Hub-Kachel — Stammgäste & Umsatz, übersichtlich gestapelt. */
export default function MerchantStammgaesteHubCard({ insights, onClick, index = 4 }) {
  const h = insights?.hub ?? {};
  const score = h.returnScore ?? 0;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileTap={{ scale: 0.99 }}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      style={{
        width: "100%",
        display: "block",
        padding: 16,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        background: C.white,
        boxShadow: "0 4px 20px rgba(10, 22, 40, 0.07)",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        minHeight: 44,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#ECFDF5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <TrendingUp size={22} color="#059669" strokeWidth={2.25} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.dark, lineHeight: 1.2 }}>
            Stammgäste & Umsatz
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginTop: 4 }}>
            Automatische Auswertung · Tippen für Details
          </div>
        </div>
        <ChevronRight size={20} color={C.muted} style={{ flexShrink: 0 }} />
      </div>

      <StammgaesteMetricsGrid data={h} variant="hub" animate={false} />

      <div style={{ marginTop: 14 }}>
        <StammgaesteScoreBar score={score} animate={false} />
      </div>
    </motion.button>
  );
}
