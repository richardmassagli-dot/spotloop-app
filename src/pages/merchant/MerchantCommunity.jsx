import { useState, useEffect, useMemo } from "react";
import { Ticket } from "lucide-react";
import { C, Btn, Card, Alert } from "../../components/ui";
import { loadSpotStampMembers } from "../../lib/spotCommunities";
import { buildStammgaesteDashboard } from "../../lib/merchantStammgaeste";
import {
  STAMMGAST_PRIVACY_INTRO,
  STAMMGAST_TOP_PERCENT_NOTE,
  canAccessVipStammgastActions,
} from "../../data/stammgaesteMessaging";
import { sendStammgastCoupon, grantStammgastBonusStamp } from "../../lib/firestore";
import { addVipGuest } from "../../lib/spotPage";
import { PrivacyNote } from "../../components/trust";
import StammGuestCard from "../../components/merchant/StammGuestCard";

export default function MerchantCommunity({ spotId, spot, checkins = [], campaigns = [], merchantPlanId = "pilot" }) {
  const [stampMembers, setStampMembers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);
  const [bulkOffer, setBulkOffer] = useState("2 für 1 — heute, 17–21 Uhr");
  const [bulkValidity, setBulkValidity] = useState("Nur heute gültig");

  const spotName = spot?.name || "Mein Spot";

  const reload = async () => {
    if (!spotId) return;
    const stamps = await loadSpotStampMembers(spotId);
    setStampMembers(stamps);
  };

  useEffect(() => {
    reload();
  }, [spotId]);

  const dash = useMemo(
    () =>
      buildStammgaesteDashboard(stampMembers, spotId, {
        checkins,
        campaigns,
        prestigeDetail: merchantPlanId === "prestige" || merchantPlanId === "enterprise" || merchantPlanId === "pilot",
      }),
    [stampMembers, spotId, checkins, campaigns, merchantPlanId],
  );

  const topRegulars = { guests: dash.guests, topCount: dash.topCount, total: dash.totalWithStamps, threshold: 0, percent: dash.topPercent };
  const vipAccess = canAccessVipStammgastActions(merchantPlanId);

  const stammUserIds = useMemo(() => dash.guests.map((g) => g.userId), [dash.guests]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3500);
  };

  const handleSendCoupon = async (guest, { offer, validity }) => {
    setBusyUserId(guest.userId);
    setBusy(true);
    setError("");
    try {
      await sendStammgastCoupon(spotId, {
        userIds: [guest.userId],
        spotName,
        offer: offer?.trim() || "Exklusives Angebot",
        validity: validity?.trim() || "Nur heute gültig",
      });
      showSuccess(`Coupon an ${guest.pseudonym} gesendet`);
      window.dispatchEvent(new CustomEvent("spotloop:campaign"));
    } catch (e) {
      setError(e.message || "Coupon konnte nicht gesendet werden.");
    } finally {
      setBusy(false);
      setBusyUserId(null);
    }
  };

  const handleSendAllCoupons = async () => {
    if (!stammUserIds.length) return;
    setBusy(true);
    setError("");
    try {
      await sendStammgastCoupon(spotId, {
        userIds: stammUserIds,
        spotName,
        offer: bulkOffer.trim(),
        validity: bulkValidity.trim(),
      });
      showSuccess(`Coupon an ${stammUserIds.length} Stammgäste gesendet`);
      window.dispatchEvent(new CustomEvent("spotloop:campaign"));
    } catch (e) {
      setError(e.message || "Coupons konnten nicht gesendet werden.");
    } finally {
      setBusy(false);
    }
  };

  const handleGrantBonus = async (guest, rewardText) => {
    setBusyUserId(guest.userId);
    setBusy(true);
    setError("");
    try {
      await grantStammgastBonusStamp(guest.userId, spotId);
      await addVipGuest(spotId, {
        user_id: guest.userId,
        name: guest.pseudonym,
        tier: "stammgast",
        visits: guest.visitCount,
        vip_reward: rewardText,
        bonus_points: 1,
        note: `Bonus-Stempel · ${guest.lastVisitLabel}`,
      });
      showSuccess(`Bonus-Stempel für ${guest.pseudonym} vergeben`);
    } catch (e) {
      setError(e.message || "Bonus konnte nicht vergeben werden.");
    } finally {
      setBusy(false);
      setBusyUserId(null);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>
        Stammgäste
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
        Top 10&nbsp;% — Verhalten sehen, handeln, bevor Gäste wegbleiben. {vipAccess ? "VIP-Aktionen nur an Top-Stammgäste." : ""}
      </div>
      <PrivacyNote variant="success">{STAMMGAST_PRIVACY_INTRO}</PrivacyNote>

      {error && (
        <div style={{ marginTop: 12 }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div style={{ marginTop: 12 }}>
          <Alert type="success">{success}</Alert>
        </div>
      )}

      <Card style={{ padding: 14, marginTop: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 4 }}>
          Top 10&nbsp;% · {topRegulars.topCount} Stammgäste
        </div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, marginBottom: 12 }}>
          {topRegulars.total === 0
            ? "Noch keine Daten — Gäste müssen zuerst stempeln."
            : STAMMGAST_TOP_PERCENT_NOTE}
        </div>
        {stammUserIds.length > 0 && (
          <>
            <input
              value={bulkOffer}
              onChange={(e) => setBulkOffer(e.target.value)}
              placeholder="Angebot für alle"
              style={inputStyle}
            />
            <input
              value={bulkValidity}
              onChange={(e) => setBulkValidity(e.target.value)}
              placeholder="Gültigkeit"
              style={{ ...inputStyle, marginTop: 8, marginBottom: 10 }}
            />
            <Btn
              onClick={handleSendAllCoupons}
              variant="dark"
              style={{ width: "100%", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})` }}
              disabled={busy}
            >
              <Ticket size={14} /> Coupon an alle Stammgäste ({stammUserIds.length})
            </Btn>
          </>
        )}
      </Card>

      {topRegulars.guests.length === 0 ? (
        <div style={{ textAlign: "center", padding: 28, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Noch keine Stammgäste</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Teile deinen QR-Code mit Gästen.</div>
        </div>
      ) : (
        topRegulars.guests.map((guest) => (
          <StammGuestCard
            key={guest.userId}
            guest={guest}
            vipAccess={vipAccess}
            onSendCoupon={handleSendCoupon}
            onGrantBonus={handleGrantBonus}
            busyCoupon={busy && busyUserId === guest.userId}
            busyBonus={busy && busyUserId === guest.userId}
          />
        ))
      )}
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
