import { useState } from "react";
import { Ticket, Gift, TrendingUp, TrendingDown, Minus, Calendar, Repeat } from "lucide-react";
import { C, Btn } from "../ui";
import { STAMMGAST_BONUS_REWARD_DEFAULT } from "../../lib/stammgaeste";

/**
 * Stammgast-Zeile: Status + Coupon senden + Bonus-Stempel.
 */
export default function StammGuestCard({
  guest,
  onSendCoupon,
  onGrantBonus,
  busyCoupon,
  busyBonus,
  vipAccess = true,
}) {
  const [showCoupon, setShowCoupon] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [offer, setOffer] = useState("2 für 1 — heute, 17–21 Uhr");
  const [validity, setValidity] = useState("Gültig bis 21:00 Uhr");
  const [rewardText, setRewardText] = useState(STAMMGAST_BONUS_REWARD_DEFAULT);

  const TrendIcon =
    guest.trend?.trend === "up" ? TrendingUp : guest.trend?.trend === "down" ? TrendingDown : Minus;

  return (
    <div
      style={{
        background: C.white,
        borderRadius: 18,
        border: `1px solid ${C.border}`,
        padding: "16px",
        marginBottom: 12,
        boxShadow: `0 4px 16px rgba(6,13,8,.05)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.dark }}>{guest.pseudonym}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginTop: 2 }}>
            Top {guest.rank} · Stammgast
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 10px",
            borderRadius: 99,
            background: `${guest.trend?.color || C.muted}12`,
            border: `1px solid ${guest.trend?.color || C.muted}25`,
          }}
        >
          <TrendIcon size={12} color={guest.trend?.color || C.muted} />
          <span style={{ fontSize: 10, fontWeight: 800, color: guest.trend?.color || C.muted }}>
            {guest.trend?.label || "Stabil"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginTop: 14,
          padding: "12px",
          background: C.bg,
          borderRadius: 12,
        }}
      >
        <Stat icon={<Repeat size={14} color={C.green} />} label="Besuche (Monat)" value={String(guest.visitsThisMonth ?? guest.visitCount)} />
        <Stat icon={<Calendar size={14} color={C.teal} />} label="Zuletzt da" value={guest.lastVisitLabel} />
      </div>
      {(guest.revenueMonthEstimate > 0 || guest.patternHint || guest.sleepRisk) && (
        <div style={{ marginTop: 10, fontSize: 11, color: C.muted, lineHeight: 1.45 }}>
          {guest.revenueMonthEstimate > 0 && (
            <div style={{ fontWeight: 800, color: C.green }}>
              Geschätzter Umsatz: EUR {guest.revenueMonthEstimate}/Monat
            </div>
          )}
          {guest.patternHint && <div style={{ marginTop: 4, color: C.teal }}>{guest.patternHint}</div>}
          {guest.sleepRisk && (
            <div style={{ marginTop: 4, color: C.orange, fontWeight: 700 }}>
              {guest.daysSinceVisit} Tage weg · {guest.sleepRisk.label}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {!showCoupon ? (
          <Btn
            onClick={() => vipAccess && setShowCoupon(true)}
            variant="dark"
            style={{ width: "100%", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, opacity: vipAccess ? 1 : 0.5 }}
            disabled={busyCoupon || busyBonus || !vipAccess}
          >
            <Ticket size={14} /> {vipAccess ? "VIP-Aktion senden" : "VIP ab Pro-Plan"}
          </Btn>
        ) : (
          <div style={{ padding: 12, background: C.mintLight, borderRadius: 12, border: `1px solid ${C.fresh}30` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.green, marginBottom: 8 }}>
              VIP-Aktion — nur an diesen Stammgast, nicht alle Follower
            </div>
            <input
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="z. B. 2 für 1 Pizza — heute, 17–21 Uhr"
              style={inputStyle}
            />
            <input
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              placeholder="Gültig bis 21:00 Uhr"
              style={{ ...inputStyle, marginTop: 8 }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn
                onClick={() => {
                  onSendCoupon(guest, { offer, validity });
                  setShowCoupon(false);
                }}
                variant="dark"
                style={{ flex: 1 }}
                disabled={busyCoupon}
              >
                Senden
              </Btn>
              <button type="button" onClick={() => setShowCoupon(false)} style={cancelBtnStyle}>
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {!showBonus ? (
          <Btn onClick={() => setShowBonus(true)} variant="dark" style={{ width: "100%" }} disabled={busyCoupon || busyBonus}>
            <Gift size={14} /> Bonus-Stempel vergeben
          </Btn>
        ) : (
          <div style={{ padding: 12, background: "#FFFBEB", borderRadius: 12, border: `1px solid ${C.gold}35` }}>
            <input
              value={rewardText}
              onChange={(e) => setRewardText(e.target.value)}
              placeholder={STAMMGAST_BONUS_REWARD_DEFAULT}
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn
                onClick={() => {
                  onGrantBonus(guest, rewardText.trim() || STAMMGAST_BONUS_REWARD_DEFAULT);
                  setShowBonus(false);
                }}
                variant="dark"
                style={{ flex: 1 }}
                disabled={busyBonus}
              >
                Bonus vergeben
              </Btn>
              <button type="button" onClick={() => setShowBonus(false)} style={cancelBtnStyle}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{value}</div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1.5px solid ${C.border}`,
  fontSize: 13,
  fontFamily: "inherit",
};

const cancelBtnStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: C.white,
  fontSize: 12,
  fontWeight: 700,
  color: C.muted,
  cursor: "pointer",
};
