import { useState, useEffect, useMemo } from "react";
import { Send, Users, Shield } from "lucide-react";
import { C, Card, Alert } from "../../components/ui";
import {
  computeCheckinsToday,
  computeReturningRevenueThisMonth,
  formatEuro,
} from "../../lib/merchantOverview";
import { loadSpotStampMembers } from "../../lib/spotCommunities";
import { buildStammgaesteDashboard } from "../../lib/merchantStammgaeste";
import {
  ACTIVE_MEMBER_DAYS,
  canSendReactivation,
  REACTIVATION_CAMPAIGN_MESSAGE,
} from "../../lib/memberProtection";
import { createCampaign, getMerchantCampaigns, getCampaignAudience } from "../../lib/firestore";
import { PrivacyNote } from "../../components/trust";
import StammGuestProfileCard from "../../components/merchant/StammGuestProfileCard";
import StammgaesteMetricsGrid, { StammgaesteScoreBar } from "../../components/merchant/StammgaesteMetricsGrid";
import {
  STAMMGAST_PRIVACY_INTRO,
  STAMMGAST_TOP_PERCENT_NOTE,
  STAMMGAST_PHILOSOPHY,
  canAccessStammgaeste,
} from "../../data/stammgaesteMessaging";

export default function MerchantOverviewSimple({
  checkins = [],
  followerCount = 0,
  spotId,
  spotName,
  campaigns = [],
  merchantPlanId = "pilot",
  setCampaigns,
  onError,
}) {
  const checkinsToday = computeCheckinsToday(checkins);
  const returningRevenue = computeReturningRevenueThisMonth(checkins);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [sending, setSending] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState("");
  const [spotCampaigns, setSpotCampaigns] = useState([]);

  const stammAccess = canAccessStammgaeste(merchantPlanId);

  useEffect(() => {
    if (!spotId) {
      setLoadingMembers(false);
      return;
    }
    loadSpotStampMembers(spotId)
      .then(setMembers)
      .finally(() => setLoadingMembers(false));
    getMerchantCampaigns(spotId).then(setSpotCampaigns).catch(() => setSpotCampaigns([]));
  }, [spotId]);

  const dash = useMemo(
    () =>
      buildStammgaesteDashboard(members, spotId, {
        checkins,
        campaigns,
        followerCount,
      }),
    [members, spotId, checkins, campaigns, followerCount],
  );

  const reactivationGate = canSendReactivation({ campaigns: spotCampaigns });

  const sendReactivation = async (guestLabel) => {
    setSending(true);
    onError?.("");
    try {
      if (!reactivationGate.ok) {
        onError?.(reactivationGate.reason);
        return;
      }
      const audience = await getCampaignAudience(spotId, "reactivation", {
        inactiveDays: ACTIVE_MEMBER_DAYS,
      });
      if (!audience.count) {
        onError?.("Keine inaktiven Gäste für Reaktivierung (30+ Tage).");
        return;
      }
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
      const extra = guestLabel ? ` (${guestLabel})` : "";
      setCampaignMsg(`Reaktivierungs-Kampagne an ${audience.count} Gäste gesendet${extra}`);
      setTimeout(() => setCampaignMsg(""), 3500);
    } catch (e) {
      onError?.(e.message || "Senden fehlgeschlagen");
    } finally {
      setSending(false);
    }
  };

  const items = [
    { label: "Check-ins heute", value: String(checkinsToday), color: C.green, bg: C.mintLight },
    { label: "Follower gesamt", value: String(followerCount), color: C.purple, bg: C.purpleLight },
    {
      label: "Wiederkehrender Umsatz",
      value: formatEuro(returningRevenue),
      color: C.orange,
      bg: C.orangeLight,
      small: true,
    },
  ];

  const previewGuests = [...dash.critical, ...dash.atRisk, ...dash.regular].slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {campaignMsg && <Alert type="success">{campaignMsg}</Alert>}

      {items.map((item) => (
        <Card key={item.label} style={{ padding: "20px 18px", background: item.bg, border: `1px solid ${C.border}` }}>
          <div
            style={{
              fontSize: item.small ? 28 : 36,
              fontWeight: 900,
              color: item.color,
              letterSpacing: -1,
              lineHeight: 1,
            }}
          >
            {item.value}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginTop: 10, lineHeight: 1.35 }}>
            {item.label}
          </div>
        </Card>
      ))}

      <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, margin: "0 2px", textAlign: "center" }}>
        Umsatz = Schätzung · sichtbare Wiederkehr, keine Garantie
      </p>

      {!loadingMembers && stammAccess && (
        <>
          <Card style={{ padding: 16, marginBottom: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.dark, marginBottom: 12 }}>
              Stammgäste & Umsatz
            </div>
            <StammgaesteMetricsGrid
              variant="sheet"
              data={{
                returningRevenue,
                repeatRate:
                  dash.totalRevenueEstimate > 0
                    ? Math.round((dash.topRevenueEstimate / dash.totalRevenueEstimate) * 100)
                    : 0,
                activeStammgaeste: dash.regular?.length ?? 0,
                sleepers: (dash.inactive?.length ?? 0) + (dash.atRisk?.length ?? 0) + (dash.critical?.length ?? 0),
              }}
            />
            <div style={{ marginTop: 14 }}>
              <StammgaesteScoreBar
                score={Math.min(
                  100,
                  Math.max(0, Math.round((dash.revenueSharePct || 0) * 1.1)),
                )}
              />
            </div>
          </Card>

          <Card style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Users size={16} color={C.blue} />
              <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Top-Stammgäste (anonym)</div>
            </div>
            <PrivacyNote variant="success">
              <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 6 }}>
                <Shield size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {STAMMGAST_PRIVACY_INTRO}
              </span>
            </PrivacyNote>
            {dash.topCount > 0 && (
              <div style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
                {STAMMGAST_TOP_PERCENT_NOTE}
                {dash.revenueSharePct > 0 && (
                  <>
                    <br />
                    <strong style={{ color: C.dark }}>
                      Top {dash.topCount} ≈ {dash.revenueSharePct}% des geschätzten Monatsumsatzes
                    </strong>{" "}
                    ({formatEuro(dash.topRevenueEstimate)} von {formatEuro(dash.totalRevenueEstimate)}).
                  </>
                )}
              </div>
            )}
          </Card>

          {previewGuests.length > 0 ? (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {previewGuests.map((g, i) => (
                <StammGuestProfileCard
                  key={g.userId}
                  guest={g}
                  compact
                  isLast={i === previewGuests.length - 1}
                  onSuggestReactivation={() => sendReactivation(g.pseudonym)}
                  onSuggestInvite={() => sendReactivation(g.pseudonym)}
                  busy={sending}
                />
              ))}
            </Card>
          ) : (
            <Card style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: C.muted }}>Noch keine Stammgäste — Gäste müssen zuerst stempeln.</div>
            </Card>
          )}

          {(dash.atRisk.length > 0 || dash.critical.length > 0) && (
            <Card style={{ padding: "16px 18px", background: C.mintLight, border: `1px solid ${C.fresh}30` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
                {dash.atRisk.length + dash.critical.length} Gast
                {dash.atRisk.length + dash.critical.length > 1 ? "e" : ""} mit Schläfer-Risiko
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 1.45 }}>
                Reaktivierung: max. 1× pro Monat · persönliche Einladung, keine Werbe-Kampagne.
                {!reactivationGate.ok && (
                  <>
                    <br />
                    <span style={{ color: C.orange, fontWeight: 700 }}>{reactivationGate.reason}</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => sendReactivation()}
                disabled={sending || !reactivationGate.ok}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: C.green,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: sending ? "wait" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Send size={16} />
                {sending ? "Wird gesendet…" : "Reaktivierungs-Kampagne senden"}
              </button>
            </Card>
          )}

          <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.55, margin: "4px 4px 0", fontStyle: "italic" }}>
            {STAMMGAST_PHILOSOPHY}
          </p>
        </>
      )}
    </div>
  );
}
