import { motion } from "framer-motion";
import { Ticket, Heart } from "lucide-react";
import CampaignPushPreview from "./CampaignPushPreview";
import { C } from "../ui";

/**
 * Kampagnen-Coupons eines Spots (Spot-Detail Übersicht).
 */
export default function SpotCampaignCoupons({
  coupons = [],
  loading = false,
  following = false,
  hasStamp = false,
  spotBg = C.green,
  onOpenCoupon,
  onFollowHint,
}) {
  const engaged = following || hasStamp;

  if (loading) {
    return (
      <div
        style={{
          background: C.white,
          borderRadius: 18,
          border: `1px solid ${C.border}`,
          padding: 20,
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Vorteile werden geladen…</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          padding: "0 2px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Ticket size={16} color={spotBg} />
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Deine Vorteile</div>
        </div>
        {coupons.length > 0 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: spotBg,
              background: `${spotBg}12`,
              padding: "4px 10px",
              borderRadius: 99,
            }}
          >
            {coupons.length} aktiv
          </span>
        )}
      </div>

      {coupons.length === 0 ? (
        <div
          style={{
            background: C.white,
            borderRadius: 18,
            border: `1px dashed ${C.border}`,
            padding: "18px 16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎟️</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 6 }}>
            {hasStamp ? "Noch keine Vorteile von diesem Spot" : following ? "Folgen — noch keine Treue-Karte" : "Scan für deine Treue-Karte"}
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: engaged ? 0 : 12 }}>
            {hasStamp
              ? "Kampagnen erscheinen hier, sobald du aktiv gesammelt hast (Besuch in 30 Tagen)."
              : following
                ? "Folgen = Interesse. Erst nach dem Scan bekommst du Kampagnen — kein Lärm vorher."
                : "QR scannen → Besuche sammeln → dann Vorteile & Kampagnen von diesem Spot."}
          </div>
          {!engaged && onFollowHint && (
            <button
              type="button"
              onClick={onFollowHint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                borderRadius: 12,
                border: "none",
                background: spotBg,
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <Heart size={14} /> Spot folgen
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {coupons.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenCoupon?.(item)}
                onKeyDown={(e) => e.key === "Enter" && onOpenCoupon?.(item)}
                style={{ cursor: "pointer" }}
              >
                <CampaignPushPreview item={item} />
              </div>
              <button
                type="button"
                onClick={() => onOpenCoupon?.(item)}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: `linear-gradient(135deg, ${item.spot_bg || spotBg}, ${item.spot_bg || spotBg}CC)`,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: `0 6px 20px ${item.spot_bg || spotBg}35`,
                }}
              >
                Vorteil öffnen →
              </button>
              {item.badge_label && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.muted,
                    textAlign: "center",
                    marginTop: 6,
                  }}
                >
                  {item.time_label} · {item.badge_label}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function spotCouponVisibleOnSpotPage(item, { following, hasStamp }) {
  const t = item?.campaign_type || "";
  if (t === "feed") return true;
  if (t === "stammgast") return hasStamp;
  if (t === "reactivation") return hasStamp;
  if (["push", "segment", "birthday", "notification"].includes(t)) return hasStamp;
  return following || hasStamp;
}
