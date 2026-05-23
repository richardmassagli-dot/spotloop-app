import { LogOut } from "lucide-react";
import { categoryLabelOnly } from "../../lib/spotDisplay";
import {
  HeaderShell,
  HeaderLogoRow,
  HeaderTitle,
  HeaderSubtitle,
  HeaderSpotAvatar,
  HeaderKpiGrid,
  HeaderIconButton,
} from "../../components/merchant/merchantHeader";

/** Premium Header: Spot · KPIs · weicher Fade zum Content */
export default function MerchantHero({
  spot,
  profile,
  followerCount,
  stats,
  showKpis = true,
  hub = false,
  onLogout,
}) {
  const category = categoryLabelOnly(spot);
  const areaSuffix = spot?.area ? ` · ${spot.area}` : "";

  return (
    <HeaderShell paddingBottom={showKpis ? 22 : 14} fadeToContent={hub}>
      {!hub && <HeaderLogoRow onLogout={onLogout} />}
      {hub && onLogout && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <HeaderIconButton onClick={onLogout} label="Abmelden" size={40}>
            <LogOut size={18} strokeWidth={2.25} />
          </HeaderIconButton>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: showKpis ? 14 : 0 }}>
        <HeaderSpotAvatar emoji={spot?.emoji || "☕"} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <HeaderTitle>{spot?.name || profile?.name || "Mein Spot"}</HeaderTitle>
          {(category || areaSuffix) && (
            <HeaderSubtitle>
              {category}
              {areaSuffix}
            </HeaderSubtitle>
          )}
        </div>
      </div>

      {showKpis && (
        <HeaderKpiGrid
          items={[
            { val: stats?.checkinsToday ?? spot?.total_checkins ?? 0, label: "Check-ins" },
            { val: followerCount ?? 0, label: "Gäste" },
            { val: stats?.redemptions ?? 0, label: "Einlösungen" },
          ]}
        />
      )}
    </HeaderShell>
  );
}
