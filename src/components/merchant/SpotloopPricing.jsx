import { useState } from "react";
import { Check, Sparkles, Mail, Zap, Users } from "lucide-react";
import { C, Card } from "../ui";
import {
  SPOTLOOP_PRICING_PLANS,
  SPOTLOOP_PRICING_CONTACT,
  SPOTLOOP_PRODUCT_INTRO,
  SPOTLOOP_EXTRA_PUSH_CREDITS,
  EXTRA_PUSH_CREDITS_COPY,
  EXTRA_CREDITS_UPGRADE_NUDGE,
  SPOTLOOP_PILOT_NOTE,
  SPOTLOOP_ANNUAL_NOTE,
  SPOTLOOP_ROI_COPY,
  STAMMGAST_RULES,
  PLAN_FEATURE_BULLETS,
} from "../../data/spotloopPricing";
import { PRICING_HEADLINE, PRICING_BODY } from "../../data/spotloopMessaging";

/** Spotloop-Abo — Kampagnen & Stammgäste. */
export default function SpotloopPricing({ spotName, compact = false }) {
  const [selected, setSelected] = useState("pilot");

  const selectedPlan = SPOTLOOP_PRICING_PLANS.find((p) => p.id === selected) || SPOTLOOP_PRICING_PLANS[0];
  const bullets = PLAN_FEATURE_BULLETS[selected] || [];

  const mailSubject = encodeURIComponent(`Spotloop Plan-Anfrage${spotName ? ` — ${spotName}` : ""}`);
  const mailBody = encodeURIComponent(
    `Hallo Spotloop-Team,\n\nich interessiere mich für den Plan: ${selectedPlan.name}.\n\nSpot: ${spotName || "—"}\n\nBitte meldet euch bei mir.\n`,
  );
  const mailHref = `mailto:${SPOTLOOP_PRICING_CONTACT}?subject=${mailSubject}&body=${mailBody}`;

  if (compact) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SPOTLOOP_PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: C.white,
              borderRadius: 12,
              border: `1px solid ${plan.recommended ? `${C.fresh}40` : C.border}`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{plan.name}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{plan.tagline || plan.features}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: C.green }}>{plan.price}</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{plan.period}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Card
        style={{
          padding: 16,
          marginBottom: 14,
          border: `1.5px solid ${C.mint}`,
          background: `linear-gradient(180deg, ${C.mintLight} 0%, ${C.white} 100%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Sparkles size={18} color={C.green} />
          <div style={{ fontSize: 11, fontWeight: 800, color: C.blue, letterSpacing: 1.1, textTransform: "uppercase" }}>
            Spotloop Abo
          </div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 900, color: C.dark, letterSpacing: -0.3, marginBottom: 6 }}>
          Preismodell
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{SPOTLOOP_PRODUCT_INTRO}</div>
        <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginTop: 10, lineHeight: 1.45 }}>
          {SPOTLOOP_PILOT_NOTE}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
          1 Kampagne = 1 Nachricht an alle Follower — garantierte Zustellung, kein Algorithmus.
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {SPOTLOOP_PRICING_PLANS.map((plan) => {
          const active = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                padding: 14,
                borderRadius: 16,
                border: `2px solid ${active ? C.green : plan.recommended ? `${C.fresh}35` : C.border}`,
                background: active ? C.mintLight : C.white,
                boxShadow: active ? `0 4px 16px ${C.green}18` : `0 2px 8px rgba(6,13,8,.04)`,
                fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: C.dark }}>{plan.name}</span>
                    {plan.recommended && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: 0.6,
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: 99,
                          background: C.fresh,
                          color: "#fff",
                        }}
                      >
                        Start hier
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.45 }}>
                    {plan.tagline}
                  </div>
                  {plan.campaignsPerWeek > 0 && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 8,
                        fontSize: 10,
                        fontWeight: 800,
                        color: C.blue,
                        background: `${C.blue}10`,
                        padding: "4px 8px",
                        borderRadius: 99,
                      }}
                    >
                      <Zap size={10} />
                      {plan.campaignsPerWeek} Kampagnen/Woche
                    </div>
                  )}
                  {plan.campaignsPerWeek === "Unbegrenzt" && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 8,
                        fontSize: 10,
                        fontWeight: 800,
                        color: C.purple,
                        background: `${C.purple}12`,
                        padding: "4px 8px",
                        borderRadius: 99,
                      }}
                    >
                      <Zap size={10} />
                      Unbegrenzte Kampagnen
                    </div>
                  )}
                  {plan.note && (
                    <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, marginTop: 6 }}>{plan.note}</div>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.green, letterSpacing: -0.5 }}>{plan.price}</div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{plan.period}</div>
                </div>
              </div>

              {active && (
                <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
                  {bullets.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        fontSize: 12,
                        color: C.dark,
                        marginTop: 6,
                        lineHeight: 1.45,
                      }}
                    >
                      <Check size={14} color={C.green} strokeWidth={3} style={{ flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      {selectedPlan.includesStammgaeste && (
        <Card style={{ padding: 14, marginBottom: 14, background: "#F8FAFF", border: `1px solid ${C.blue}25` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Users size={16} color={C.blue} />
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>Stammgäste (ab Growth)</div>
          </div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
            · {STAMMGAST_RULES.stammgast}
            <br />
            · {STAMMGAST_RULES.privacy}
            <br />· {STAMMGAST_RULES.insight}
          </div>
        </Card>
      )}

      {selectedPlan.includesCampaigns && selectedPlan.id !== "pilot" && !selectedPlan.contactSales && (
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
            {EXTRA_PUSH_CREDITS_COPY.title}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.45 }}>
            {EXTRA_PUSH_CREDITS_COPY.subtitle}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
            {SPOTLOOP_EXTRA_PUSH_CREDITS.map((pack) => (
              <div
                key={pack.id}
                style={{
                  padding: "10px 8px",
                  borderRadius: 12,
                  border: `1px solid ${pack.highlight ? `${C.green}50` : C.border}`,
                  background: pack.highlight ? C.mintLight : C.white,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 900, color: C.dark }}>{pack.label}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginTop: 4 }}>{pack.price}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, marginTop: 4 }}>
                  {pack.pricePerPushLabel}/Push
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 10 }}>
            {EXTRA_PUSH_CREDITS_COPY.perPushHint}
          </div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55, marginBottom: 8 }}>
            {EXTRA_PUSH_CREDITS_COPY.rationale}
          </div>
          <div style={{ fontSize: 11, color: C.dark, fontWeight: 600, lineHeight: 1.5, marginBottom: 10 }}>
            {EXTRA_PUSH_CREDITS_COPY.roi}
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.blue,
              fontWeight: 700,
              lineHeight: 1.5,
              padding: "10px 12px",
              borderRadius: 10,
              background: `${C.blue}10`,
            }}
          >
            {EXTRA_CREDITS_UPGRADE_NUDGE.growthToProAt59}
          </div>
        </Card>
      )}

      {(selectedPlan.id === "starter" || selectedPlan.id === "growth") && (
        <Card style={{ padding: 14, marginBottom: 14, background: C.mintLight, border: `1px solid ${C.fresh}30` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 6 }}>{SPOTLOOP_ROI_COPY.headline}</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{SPOTLOOP_ROI_COPY.body}</div>
        </Card>
      )}

      <Card
        style={{
          padding: 18,
          marginBottom: 14,
          background: `linear-gradient(165deg, ${C.navy}08 0%, ${C.white} 100%)`,
          border: `1.5px solid ${C.navy}20`,
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: C.dark,
            lineHeight: 1.35,
            letterSpacing: -0.3,
            marginBottom: 10,
          }}
        >
          {PRICING_HEADLINE}
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{PRICING_BODY}</div>
      </Card>

      <a
        href={mailHref}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "14px 16px",
          borderRadius: 14,
          background: C.green,
          color: "#fff",
          fontSize: 14,
          fontWeight: 800,
          textDecoration: "none",
          boxShadow: `0 6px 20px ${C.green}35`,
        }}
      >
        <Mail size={18} />
        {selectedPlan.contactSales
          ? selectedPlan.id === "enterprise"
            ? "Enterprise anfragen"
            : "Prestige anfragen"
          : "Plan anfragen"}{" "}
        — {selectedPlan.name}
      </a>

      <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 12, lineHeight: 1.45 }}>
        {SPOTLOOP_ANNUAL_NOTE} · Preise netto · monatlich (außer Pilot) · {SPOTLOOP_PRICING_CONTACT}
      </div>
    </div>
  );
}
