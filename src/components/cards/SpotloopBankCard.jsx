import { MapPin, Stamp, Gift } from "lucide-react";
import { Logo } from "../ui";
import { CARD_GRADIENT, C } from "../../design/tokens.js";
import BankCardShell from "./BankCardShell";

const STAT_ICONS = {
  spots: { Icon: MapPin, color: C.blue, bg: `${C.blue}14` },
  cards: { Icon: Stamp, color: "#0369A1", bg: "rgba(6, 182, 212, 0.12)" },
  rewards: { Icon: Gift, color: C.orange, bg: `${C.orange}18` },
};

function StatPill({ value, label, highlight, statKey }) {
  const meta = STAT_ICONS[statKey];
  const Icon = meta?.Icon;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        textAlign: "center",
        background: highlight
          ? "linear-gradient(165deg, #FFF7ED 0%, #FFFFFF 100%)"
          : "linear-gradient(165deg, #FFFFFF 0%, #F8FAFF 100%)",
        border: `1px solid ${highlight ? `${C.orange}35` : "rgba(226, 232, 245, 0.95)"}`,
        borderRadius: 16,
        padding: "12px 8px 10px",
        boxShadow: highlight
          ? `0 0 0 1px ${C.orange}15, 0 8px 20px rgba(249, 115, 22, 0.12)`
          : "0 1px 0 rgba(255,255,255,1) inset, 0 6px 18px rgba(10, 22, 40, 0.05)",
      }}
    >
      {Icon && (
        <div
          style={{
            width: 28,
            height: 28,
            margin: "0 auto 8px",
            borderRadius: 10,
            background: meta.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} color={meta.color} strokeWidth={2.25} />
        </div>
      )}
      <div style={{ fontSize: 20, fontWeight: 900, color: highlight ? C.orange : C.dark, letterSpacing: -0.5, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: highlight ? C.orange : C.muted,
          marginTop: 5,
          letterSpacing: 0.3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/** Spotloop Wallet — Stempel & Rewards pro Spot */
export default function SpotloopBankCard({ ownerName, activeSpotCount, cardCount, readyCount, tagline }) {
  return (
    <div>
      <BankCardShell gradient={CARD_GRADIENT} glow="0 0 0 1px rgba(255,255,255,.12), 0 0 60px rgba(27, 79, 216, 0.35)">
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Logo size={16} light hideText />
            <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.65)", letterSpacing: 2.2 }}>
              SPOTLOOP WALLET
            </span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: -0.3, textShadow: "0 2px 8px rgba(0,0,0,.2)" }}>
            Deine Stempelkarten
          </div>
          {tagline && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 6, fontWeight: 600, lineHeight: 1.45 }}>
              {tagline}
            </div>
          )}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,.45)", letterSpacing: 1.2, fontWeight: 700 }}>MEMBER</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 }}>
            {ownerName}
          </div>
        </div>
      </BankCardShell>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <StatPill statKey="spots" value={activeSpotCount} label={activeSpotCount === 1 ? "Spot" : "Spots"} />
        <StatPill statKey="cards" value={cardCount} label={cardCount === 1 ? "Stempelkarte" : "Stempel"} />
        <StatPill
          statKey="rewards"
          value={readyCount}
          label={readyCount === 1 ? "Reward" : "Rewards"}
          highlight={readyCount > 0}
        />
      </div>
    </div>
  );
}
