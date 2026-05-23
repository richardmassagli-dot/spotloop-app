import { useState } from "react";
import { Send, BarChart3 } from "lucide-react";
import { C } from "../../components/ui";
import MerchantCampaignComposer from "./MerchantCampaignComposer";
import MerchantCampaigns from "./MerchantCampaigns";

const VIEWS = [
  { id: "send", label: "Senden", icon: Send },
  { id: "report", label: "Auswertung", icon: BarChart3 },
];

export default function MerchantCampaignHub({
  spotId,
  spot,
  spotName,
  campaigns,
  setCampaigns,
  followerCount = 0,
  onError,
}) {
  const [view, setView] = useState("send");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: 4,
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          marginBottom: 18,
          boxShadow: `0 2px 12px ${C.shadow}`,
        }}
      >
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 10px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: active
                  ? "linear-gradient(145deg, #0A1628 0%, #1B4FD8 55%, #0EA5E9 100%)"
                  : "transparent",
                color: active ? "#fff" : C.muted,
                fontSize: 13,
                fontWeight: active ? 800 : 600,
                boxShadow: active ? "0 4px 14px rgba(27, 79, 216, 0.25)" : "none",
                transition: "all .2s ease",
              }}
            >
              <Icon size={16} strokeWidth={2.25} />
              {label}
            </button>
          );
        })}
      </div>

      {view === "send" ? (
        <MerchantCampaignComposer
          embedded
          spotId={spotId}
          spot={spot}
          spotName={spotName}
          setCampaigns={setCampaigns}
          followerCount={followerCount}
          onError={onError}
        />
      ) : (
        <MerchantCampaigns campaigns={campaigns} />
      )}
    </div>
  );
}
