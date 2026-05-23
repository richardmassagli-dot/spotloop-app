import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToSpot,
  subscribeMerchantCheckins,
  getMerchantCampaigns,
  countSpotFollowers,
  getMerchantStats,
} from "../../lib/firestore";
import { MERCHANT_CLASSIC } from "../../lib/config";
import { C, Alert, Spinner } from "../../components/ui";
import MerchantSettings from "./MerchantSettings";
import MerchantHero from "./MerchantHero";
import MerchantDashboardHub from "./MerchantDashboardHub";
import MerchantStammgaesteSheet from "../../components/merchant/MerchantStammgaesteSheet";
import MerchantSubBack from "../../components/merchant/MerchantSubBack";
import MerchantOverviewSimple from "./MerchantOverviewSimple";
import MerchantQRSimple from "./MerchantQRSimple";
import MerchantRewardSimple from "./MerchantRewardSimple";
import MerchantCampaignSimple from "./MerchantCampaignSimple";
import NavTileGrid from "../../components/merchant/NavTileGrid";
import { loadSpotStampMembers } from "../../lib/spotCommunities";
import { buildMerchantInsights } from "../../lib/merchantInsights";
import { buildMerchantRetentionTriggers, merchantNotificationsOnboarded } from "../../lib/retentionTriggers";
import MerchantNotificationsOnboarding from "./MerchantNotificationsOnboarding";
import { MERCHANT_PAGE_BG } from "../../components/merchant/merchantHeader";
import {
  LayoutDashboard,
  QrCode,
  Megaphone,
  Gift,
  Settings,
} from "lucide-react";

const MERCHANT_NAV = [
  { id: "overview", icon: LayoutDashboard, label: "Übersicht", hint: "3 Zahlen" },
  { id: "qr", icon: QrCode, label: "QR-Code", hint: "Anzeigen" },
  { id: "reward", icon: Gift, label: "Reward", hint: "Stempelkarte" },
  { id: "campaigns", icon: Megaphone, label: "Kampagne", hint: "Senden" },
  { id: "msettings", icon: Settings, label: "Einstellungen", hint: "Account" },
];

export default function MerchantDashboard({ onLogout }) {
  const { user, profile } = useAuth();
  const [spot, setSpot] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stampMembers, setStampMembers] = useState([]);
  const [merchantStats, setMerchantStats] = useState({ redemptions: 0 });
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [stammSheetOpen, setStammSheetOpen] = useState(false);
  const [showNotifOnboarding, setShowNotifOnboarding] = useState(
    () => !merchantNotificationsOnboarded(user?.uid),
  );

  const goHub = () => setTab(null);
  const activeNav = MERCHANT_NAV.find((n) => n.id === tab);

  const insights = useMemo(() => {
    if (!user?.uid) {
      return buildMerchantInsights({
        checkins: [],
        stampMembers: [],
        spotId: "",
        followerCount: 0,
        campaigns: [],
        redemptions: 0,
      });
    }
    try {
      return buildMerchantInsights({
        checkins,
        stampMembers,
        spotId: user.uid,
        followerCount,
        campaigns,
        redemptions: merchantStats.redemptions,
      });
    } catch {
      return buildMerchantInsights({
        checkins: [],
        stampMembers: [],
        spotId: user.uid,
        followerCount: 0,
        campaigns: [],
        redemptions: 0,
      });
    }
  }, [checkins, stampMembers, user?.uid, followerCount, campaigns, merchantStats.redemptions]);

  const merchantTriggers = useMemo(
    () =>
      buildMerchantRetentionTriggers({
        insights,
        campaigns,
        spotName: spot?.name,
        followerCount,
      }),
    [insights, campaigns, spot?.name, followerCount],
  );

  const handleTriggerAction = (trigger) => {
    if (trigger.type === "sleeper_alert") {
      setStammSheetOpen(true);
      return;
    }
    if (trigger.type === "campaign_reminder") {
      setTab("campaigns");
    }
  };

  const refreshFollowerCount = () => {
    countSpotFollowers(user.uid).then(setFollowerCount).catch(() => {});
  };

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return undefined;
    }

    let unsubSpot = () => {};
    let unsubCheckins = () => {};

    try {
      unsubSpot = subscribeToSpot(user.uid, (s) => {
        setSpot(s);
        setLoading(false);
        refreshFollowerCount();
      });
      unsubCheckins = subscribeMerchantCheckins(user.uid, setCheckins);
    } catch (e) {
      setError(e.message || "Daten konnten nicht geladen werden.");
      setLoading(false);
      return undefined;
    }

    const t = setTimeout(() => setLoading(false), 8000);
    refreshFollowerCount();
    getMerchantCampaigns(user.uid).then(setCampaigns).catch(() => {});
    getMerchantStats(user.uid).then(setMerchantStats).catch(() => {});
    loadSpotStampMembers(user.uid).then(setStampMembers).catch(() => setStampMembers([]));

    return () => {
      clearTimeout(t);
      unsubSpot();
      unsubCheckins();
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          minHeight: "100dvh",
          gap: 12,
          background: MERCHANT_PAGE_BG,
        }}
      >
        <Spinner size={40} color={C.blue} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>Dashboard wird geladen…</span>
      </div>
    );
  }

  if (tab === "msettings") {
    return <MerchantSettings onBack={goHub} onLogout={onLogout} spot={spot} embedded />;
  }

  const isHub = !tab || MERCHANT_CLASSIC;

  return (
    <div
      style={{
        background: MERCHANT_PAGE_BG,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <MerchantHero
        spot={spot}
        profile={profile}
        followerCount={followerCount}
        stats={insights.kpis}
        showKpis={isHub && !MERCHANT_CLASSIC}
        hub={isHub && !MERCHANT_CLASSIC}
        onLogout={onLogout}
      />

      {isHub ? (
        MERCHANT_CLASSIC ? (
          <div className="scroll-y" style={{ flex: 1, padding: "16px 16px 32px", minHeight: 0 }}>
            <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>
              Klassische Ansicht — VITE_MERCHANT_CLASSIC entfernen oder auf false setzen.
            </div>
            <NavTileGrid items={MERCHANT_NAV} active={null} onSelect={setTab} columns={2} />
          </div>
        ) : (
          <MerchantDashboardHub
            insights={insights}
            onSelectTab={setTab}
            onOpenStammgaeste={() => setStammSheetOpen(true)}
            merchantTriggers={merchantTriggers}
            onTriggerAction={handleTriggerAction}
          />
        )
      ) : (
        <div className="scroll-y" style={{ flex: 1, padding: "16px 20px 32px", minHeight: 0 }}>
          <MerchantSubBack title={activeNav?.label || "Bereich"} subtitle={activeNav?.hint} onBack={goHub} />

          {error && (
            <div style={{ marginBottom: 12 }}>
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {tab === "overview" && (
            <MerchantOverviewSimple
              checkins={checkins}
              followerCount={followerCount}
              spotId={user.uid}
              spotName={spot?.name}
              campaigns={campaigns}
              merchantPlanId={spot?.plan_id || "pilot"}
              setCampaigns={setCampaigns}
              onError={setError}
            />
          )}

          {tab === "qr" && (
            <MerchantQRSimple merchantId={user.uid} spotName={spot?.name || profile?.name} />
          )}

          {tab === "reward" && <MerchantRewardSimple spotId={user.uid} spot={spot} />}

          {tab === "campaigns" && (
            <MerchantCampaignSimple
              spotId={user.uid}
              spotName={spot?.name}
              followerCount={followerCount}
              merchantPlanId={spot?.plan_id || "pilot"}
              setCampaigns={setCampaigns}
              onError={setError}
            />
          )}
        </div>
      )}

      {showNotifOnboarding && isHub && !MERCHANT_CLASSIC && !loading && (
        <MerchantNotificationsOnboarding
          userId={user.uid}
          onDone={() => setShowNotifOnboarding(false)}
        />
      )}

      <MerchantStammgaesteSheet
        open={stammSheetOpen}
        onClose={() => setStammSheetOpen(false)}
        insights={insights}
        onNavigate={(id) => {
          setStammSheetOpen(false);
          setTab(id);
        }}
        onReactivation={() => {
          setStammSheetOpen(false);
          setTab("overview");
        }}
      />
    </div>
  );
}
