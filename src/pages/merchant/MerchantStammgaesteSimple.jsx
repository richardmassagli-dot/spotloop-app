import { useState, useEffect, useMemo } from "react";
import { Users, Shield } from "lucide-react";
import { C, Alert, Card } from "../../components/ui";
import { loadSpotStampMembers } from "../../lib/spotCommunities";
import { buildStammgaesteDashboard } from "../../lib/merchantStammgaeste";
import {
  ACTIVE_MEMBER_DAYS,
  canSendReactivation,
  REACTIVATION_CAMPAIGN_MESSAGE,
} from "../../lib/memberProtection";
import { formatEuro } from "../../lib/merchantOverview";
import { createCampaign, getMerchantCampaigns, getCampaignAudience } from "../../lib/firestore";
import { PrivacyNote } from "../../components/trust";
import StammGuestProfileCard from "../../components/merchant/StammGuestProfileCard";
import {
  STAMMGAST_PRIVACY_INTRO,
  STAMMGAST_TOP_PERCENT_NOTE,
  STAMMGAST_PHILOSOPHY,
  STAMMGAST_PLAN_GROWTH,
  STAMMGAST_PLAN_VIP,
  STAMMGAST_PLAN_PRESTIGE,
  canAccessStammgaeste,
  canAccessVipStammgastActions,
  hasPrestigeStammgastDetail,
} from "../../data/stammgaesteMessaging";

export default function MerchantStammgaesteSimple({
  spotId,
  spotName,
  checkins = [],
  campaigns = [],
  followerCount = 0,
  merchantPlanId = "pilot",
  setCampaigns,
  onError,
}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [spotCampaigns, setSpotCampaigns] = useState([]);

  const stammAccess = canAccessStammgaeste(merchantPlanId);
  const vipAccess = canAccessVipStammgastActions(merchantPlanId);
  const prestigeDetail = hasPrestigeStammgastDetail(merchantPlanId);

  useEffect(() => {
    if (!spotId) return;
    loadSpotStampMembers(spotId)
      .then(setMembers)
      .finally(() => setLoading(false));
    getMerchantCampaigns(spotId).then(setSpotCampaigns).catch(() => setSpotCampaigns([]));
  }, [spotId]);

  const dash = useMemo(
    () =>
      buildStammgaesteDashboard(members, spotId, {
        checkins,
        campaigns,
        followerCount,
        prestigeDetail,
      }),
    [members, spotId, checkins, campaigns, followerCount, prestigeDetail],
  );

  const reactivationGate = canSendReactivation({ campaigns: spotCampaigns });

  const sendReactivation = async (guest) => {
    setSending(true);
    setError("");
    onError?.("");
    try {
      if (!reactivationGate.ok) {
        setError(reactivationGate.reason);
        return;
      }
      const audience = await getCampaignAudience(spotId, "reactivation", {
        inactiveDays: ACTIVE_MEMBER_DAYS,
      });
      if (!audience.count) {
        setError("Keine inaktiven Gäste für Reaktivierung (30+ Tage).");
        return;
      }
      const label = guest?.pseudonym ? ` für ${guest.pseudonym}` : "";
      await createCampaign(spotId, {
        type: "reactivation",
        message: REACTIVATION_CAMPAIGN_MESSAGE,
        spot_name: spotName,
        audience: "reactivation",
        inactive_days: ACTIVE_MEMBER_DAYS,
        recipient_count: audience.count,
      });
      setSpotCampaigns(await getMerchantCampaigns(spotId));
      if (setCampaigns) {
        setCampaigns(await getMerchantCampaigns(spotId));
      }
      window.dispatchEvent(new Event("spotloop:campaign"));
      setSuccess(`Reaktivierungs-Kampagne${label} an ${audience.count} Gäste gesendet`);
      setTimeout(() => setSuccess(""), 3500);
    } catch (e) {
      const msg = e.message || "Kampagne konnte nicht gesendet werden.";
      setError(msg);
      onError?.(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>Laden…</div>;
  }

  if (!stammAccess) {
    return (
      <Card style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Stammgäste</div>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: 0 }}>{STAMMGAST_PLAN_GROWTH}</p>
      </Card>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="success">{success}</Alert>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Users size={18} color={C.blue} />
        <div style={{ fontSize: 16, fontWeight: 900, color: C.dark }}>Stammgäste</div>
      </div>

      <PrivacyNote variant="success">
        <span style={{ display: "inline-flex", gap: 6, alignItems: "flex-start" }}>
          <Shield size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {STAMMGAST_PRIVACY_INTRO}
        </span>
      </PrivacyNote>

      <Card style={{ padding: 14, marginTop: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
          Top {dash.topPercent}% · {dash.topCount} Stammgäste
        </div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{STAMMGAST_TOP_PERCENT_NOTE}</div>
        {dash.revenueSharePct > 0 && (
          <div style={{ marginTop: 10, fontSize: 13, fontWeight: 900, color: C.green }}>
            {formatEuro(dash.topRevenueEstimate)}{" "}
            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>
              ({dash.revenueSharePct}% des Monatsumsatzes, geschätzt)
            </span>
          </div>
        )}
      </Card>

      {dash.guests.length === 0 ? (
        <Card style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.muted }}>Noch keine Stammgäste erkannt. Teile deinen QR-Code.</div>
        </Card>
      ) : (
        dash.guests.map((g) => (
          <StammGuestProfileCard
            key={g.userId}
            guest={g}
            showPrestigeDetail={prestigeDetail}
            onSuggestReactivation={sendReactivation}
            onSuggestInvite={sendReactivation}
            busy={sending}
          />
        ))
      )}

      {!vipAccess && (
        <p style={{ fontSize: 11, color: C.muted, marginTop: 14, lineHeight: 1.45 }}>{STAMMGAST_PLAN_VIP}</p>
      )}
      {!prestigeDetail && (
        <p style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>{STAMMGAST_PLAN_PRESTIGE}</p>
      )}

      <p style={{ fontSize: 11, color: C.muted, marginTop: 16, lineHeight: 1.55, fontStyle: "italic" }}>
        {STAMMGAST_PHILOSOPHY}
      </p>
    </div>
  );
}
