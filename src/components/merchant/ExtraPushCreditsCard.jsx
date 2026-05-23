import { useState } from "react";
import { Zap, TrendingUp, ArrowUpRight } from "lucide-react";
import { C, Card } from "../ui";
import {
  SPOTLOOP_EXTRA_PUSH_CREDITS,
  EXTRA_PUSH_CREDITS_COPY,
  SPOTLOOP_PRICING_CONTACT,
  getExtraCreditsUpgradeNudge,
  getExtraCreditsSpentThisMonth,
  recordExtraCreditsPurchase,
} from "../../data/spotloopPricing";

/**
 * Extra Push-Credits — Pakete, Preislogik & Upgrade-Nudge wenn Kontingent leer.
 */
export default function ExtraPushCreditsCard({
  spotId,
  spotName,
  merchantPlanId = "growth",
  quotaExhausted = false,
  compact = false,
}) {
  const [spent, setSpent] = useState(() => getExtraCreditsSpentThisMonth(spotId));
  const nudge = getExtraCreditsUpgradeNudge(merchantPlanId, spent);

  const mailPack = (pack) => {
    const subject = encodeURIComponent(
      `Extra Push-Credits — ${pack.label}${spotName ? ` (${spotName})` : ""}`,
    );
    const body = encodeURIComponent(
      `Hallo Spotloop-Team,\n\nich möchte das Paket „${pack.label}“ (${pack.price}) nachkaufen.\n\nSpot: ${spotName || spotId || "—"}\nPlan: ${merchantPlanId}\n\nBitte schickt mir die Zahlungsinfo.\n`,
    );
    return `mailto:${SPOTLOOP_PRICING_CONTACT}?subject=${subject}&body=${body}`;
  };

  const onSelectPack = (pack) => {
    if (spotId) {
      const next = recordExtraCreditsPurchase(spotId, pack.priceEur);
      setSpent(next);
    }
    window.location.href = mailPack(pack);
  };

  return (
    <Card
      style={{
        padding: compact ? 14 : 16,
        marginBottom: 14,
        border: quotaExhausted ? `1.5px solid ${C.orange}50` : `1px solid ${C.border}`,
        background: quotaExhausted ? "#FFFBEB" : C.white,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Zap size={16} color={quotaExhausted ? C.orange : C.blue} />
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{EXTRA_PUSH_CREDITS_COPY.title}</div>
      </div>

      {quotaExhausted && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.orange,
            marginBottom: 10,
            lineHeight: 1.45,
          }}
        >
          Dein Wochen-Kontingent ist aufgebraucht — Push-Credits jederzeit nachkaufen.
        </div>
      )}

      <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
        {EXTRA_PUSH_CREDITS_COPY.subtitle}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
        {SPOTLOOP_EXTRA_PUSH_CREDITS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => onSelectPack(pack)}
            style={{
              minHeight: 44,
              padding: "12px 8px",
              borderRadius: 14,
              border: `1.5px solid ${pack.highlight ? C.green : C.border}`,
              background: pack.highlight ? C.mintLight : C.white,
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: C.dark, lineHeight: 1.2 }}>{pack.label}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.green, marginTop: 6 }}>{pack.price}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, marginTop: 4, lineHeight: 1.2 }}>
              {pack.pricePerPushLabel}/Push
            </div>
          </button>
        ))}
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 12, lineHeight: 1.45 }}>
        {EXTRA_PUSH_CREDITS_COPY.perPushHint}
      </div>

      {!compact && (
        <>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>
            {EXTRA_PUSH_CREDITS_COPY.rationale}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              fontSize: 11,
              color: C.dark,
              lineHeight: 1.5,
              padding: "10px 12px",
              borderRadius: 12,
              background: C.mintLight,
              border: `1px solid ${C.fresh}25`,
              marginBottom: nudge ? 12 : 0,
            }}
          >
            <TrendingUp size={14} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{EXTRA_PUSH_CREDITS_COPY.roi}</span>
          </div>
        </>
      )}

      {nudge && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 14,
            background:
              nudge.severity === "critical"
                ? `linear-gradient(135deg, ${C.orange}12 0%, #FFF7ED 100%)`
                : `linear-gradient(135deg, ${C.navy}08 0%, ${C.blue}12 100%)`,
            border: `1px solid ${nudge.severity === "critical" ? `${C.orange}50` : `${C.blue}30`}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <ArrowUpRight size={14} color={nudge.severity === "critical" ? C.orange : C.blue} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: nudge.severity === "critical" ? C.orange : C.blue,
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              {nudge.severity === "critical" ? "Stärkster Upgrade-Moment" : "Upgrade lohnt sich"}
            </span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, lineHeight: 1.5 }}>{nudge.body}</div>
        </div>
      )}
    </Card>
  );
}
