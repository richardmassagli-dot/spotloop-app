import { buildCouponViewModel } from "../../lib/campaignCoupon";

/**
 * Push-Benachrichtigung (außen) — Premium, kein Spam-Look.
 */
export default function CampaignPushPreview({ item, alert, compact = false, onClick }) {
  const coupon = item?.coupon || (item ? buildCouponViewModel(item) : null);
  const push = alert
    ? {
        merchantLine: alert.pushMerchant || alert.title?.split(":")[0] || alert.title,
        headline: alert.pushHeadline || "Dein exklusiver Vorteil wartet",
        meta: alert.pushMeta || alert.cta || "Jetzt öffnen",
      }
    : coupon?.push;

  if (!push) return null;

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        cursor: onClick ? "pointer" : "default",
        border: "none",
        padding: 0,
        fontFamily: "inherit",
        background: "transparent",
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #0A1628 0%, #1B2A4A 100%)",
          borderRadius: compact ? 16 : 18,
          padding: compact ? "12px 14px" : "14px 16px",
          boxShadow: "0 8px 28px rgba(10, 22, 40, 0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            fontSize: compact ? 13 : 14,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: -0.2,
            marginBottom: 6,
          }}
        >
          {push.merchantLine}
        </div>
        <div
          style={{
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.45,
            marginBottom: 8,
          }}
        >
          {push.headline}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(125, 211, 252, 0.95)",
            letterSpacing: 0.2,
          }}
        >
          {push.meta}
        </div>
      </div>
    </Wrapper>
  );
}
