import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import PremiumCouponCard from "./PremiumCouponCard";
import { buildCouponViewModel, couponThemeFromSpot } from "../../lib/campaignCoupon";
import { C } from "../ui";

export default function CouponRevealSheet({ item, open, onClose, onSpot }) {
  const spotBg = item ? (buildCouponViewModel(item)?.spotBg || "#1B4FD8") : "#1B4FD8";
  const theme = couponThemeFromSpot(spotBg);

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10, 22, 40, 0.55)",
              backdropFilter: "blur(8px)",
              zIndex: 200,
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
              zIndex: 201,
              maxWidth: 390,
              margin: "0 auto",
              background: `linear-gradient(180deg, ${spotBg}10 0%, ${C.bg} 28%)`,
              borderRadius: "28px 28px 0 0",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: `0 -16px 56px ${theme.glow}, 0 -4px 24px rgba(10,22,40,.15)`,
            }}
          >
            <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: "10px auto 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "8px 16px 0",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Schließen"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} color={C.muted} />
              </button>
            </div>
            <PremiumCouponCard item={item} />
            {onSpot && item.spot_id && (
              <div style={{ padding: "0 20px 32px" }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSpot(item.spot_id);
                  }}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.dark,
                    cursor: "pointer",
                  }}
                >
                  Spot öffnen →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
