import { QRCodeSVG } from "qrcode.react";
import { buildCouponViewModel, couponThemeFromSpot } from "../../lib/campaignCoupon";
import { C } from "../ui";

function TicketNotch({ side, color }) {
  const count = 6;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [side]: -7,
        display: "flex",
        flexDirection: "column",
        gap: 5,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: C.bg,
            boxShadow: `inset 0 0 0 1px ${color}18`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * In-App Coupon — premium Ticket-Look, QR mittig, Spot-Farben.
 */
export default function PremiumCouponCard({ item, coupon: couponProp }) {
  const coupon = couponProp || (item ? buildCouponViewModel(item) : null);
  if (!coupon) return null;

  const theme = couponThemeFromSpot(coupon.spotBg);
  const qrSize = 148;

  return (
    <div style={{ padding: "4px 20px 20px", maxWidth: 360, margin: "0 auto" }}>
      <div
        style={{
          borderRadius: 26,
          overflow: "hidden",
          boxShadow: `0 20px 56px ${theme.glow}, 0 8px 24px rgba(10, 22, 40, 0.12)`,
          border: `1px solid ${theme.ring}`,
        }}
      >
        {/* Spot-Header */}
        <div
          style={{
            background: theme.gradient,
            padding: "22px 20px 20px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -40,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: -50,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />

          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              margin: "0 auto 12px",
              background: "rgba(255,255,255,0.18)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            {coupon.spotEmoji}
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -0.4,
              marginBottom: 8,
              position: "relative",
            }}
          >
            {coupon.spotName}
          </div>

          <div
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "#fff",
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.28)",
              borderRadius: 99,
              padding: "5px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            Exklusiver Vorteil
          </div>
        </div>

        {/* Angebot */}
        <div
          style={{
            background: theme.gradientSoft,
            padding: "22px 22px 18px",
            textAlign: "center",
            borderBottom: `1px dashed ${theme.ring}`,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: C.dark,
              lineHeight: 1.2,
              letterSpacing: -0.6,
              marginBottom: 8,
            }}
          >
            {coupon.offerTitle}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              color: theme.accent,
              background: `${theme.accent}12`,
              border: `1px solid ${theme.accent}28`,
              borderRadius: 99,
              padding: "6px 14px",
            }}
          >
            {coupon.offerWindow}
          </div>
        </div>

        {/* QR — mittig */}
        <div
          style={{
            background: C.white,
            padding: "24px 20px 20px",
            position: "relative",
          }}
        >
          <TicketNotch side="left" color={theme.accent} />
          <TicketNotch side="right" color={theme.accent} />

          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: C.muted,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            Beim Personal vorzeigen
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              maxWidth: qrSize + 48,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                borderRadius: 20,
                background: `linear-gradient(180deg, ${theme.accent}08 0%, #FFFFFF 100%)`,
                border: `2px solid ${theme.accent}35`,
                boxShadow: `0 12px 32px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.9)`,
              }}
            >
              <QRCodeSVG
                value={coupon.redeemCode}
                size={qrSize}
                level="M"
                fgColor={C.navy}
                bgColor="#FFFFFF"
                style={{ display: "block", margin: "0 auto" }}
              />
            </div>

            <div
              style={{
                marginTop: 16,
                width: "100%",
                maxWidth: 200,
                height: 1,
                background: `repeating-linear-gradient(
                  90deg,
                  ${C.muted}55 0px,
                  ${C.muted}55 4px,
                  transparent 4px,
                  transparent 8px
                )`,
              }}
            />

            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                letterSpacing: 1.6,
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                textAlign: "center",
              }}
            >
              {coupon.redeemCode}
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 800,
              color: theme.accent,
            }}
          >
            {coupon.validUntil}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          fontWeight: 600,
          color: C.muted,
          textAlign: "center",
          lineHeight: 1.5,
          padding: "0 8px",
        }}
      >
        {coupon.finePrint}
      </div>
    </div>
  );
}
