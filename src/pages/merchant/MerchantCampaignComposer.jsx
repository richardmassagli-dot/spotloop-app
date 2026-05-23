import { useState, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import {
  createCampaign,
  getMerchantCampaigns,
  getCampaignAudience,
  syncCampaignsToSpotGuestFeed,
} from "../../lib/firestore";
import {
  CAMP_TYPES,
  CAMP_TYPE_META,
  REACTIVATION_DAY_OPTIONS,
  audienceSummary,
} from "../../lib/campaignAudiences";
import {
  loadCampaignInsights,
  MESSAGE_TEMPLATES,
  personalizeMessage,
  campaignTypesWithCounts,
  previewGuestMessage,
} from "../../lib/campaignIntelligence";
import { C, Card, Alert, CARD_GRADIENT } from "../../components/ui";
import MerchantSubBack from "../../components/merchant/MerchantSubBack";
import CampaignImagePicker from "../../components/merchant/CampaignImagePicker";
import { CAMPAIGN_SEND_GUARANTEE } from "../../data/spotloopMessaging";

const STEPS = ["Ziel", "Nachricht", "Senden"];

export default function MerchantCampaignComposer({
  spotId,
  spotName,
  spot,
  setCampaigns,
  followerCount = 0,
  onBack,
  onError,
  embedded = false,
}) {
  const [step, setStep] = useState(0);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [campType, setCampType] = useState("reactivation");
  const [campMsg, setCampMsg] = useState("");
  const [campImage, setCampImage] = useState(null);
  const [campSent, setCampSent] = useState(false);
  const [campLoading, setCampLoading] = useState(false);
  const [inactiveDays, setInactiveDays] = useState(30);
  const [birthdayScope, setBirthdayScope] = useState("today");
  const [audience, setAudience] = useState({ count: 0, guests: [] });
  const [audienceLoading, setAudienceLoading] = useState(false);

  const refreshInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const data = await loadCampaignInsights(spotId, {
        followerCount,
        spotName: spotName || spot?.name,
      });
      setInsights(data);
    } catch {
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  }, [spotId, followerCount, spotName, spot?.name]);

  useEffect(() => {
    refreshInsights();
    if (spotId) syncCampaignsToSpotGuestFeed(spotId).catch(() => {});
  }, [spotId, refreshInsights]);

  const loadAudience = useCallback(async () => {
    if (!spotId) return;
    if (campType === "push") {
      setAudience({ count: followerCount, guests: [] });
      return;
    }
    if (!["reactivation", "birthday"].includes(campType)) {
      setAudience({ count: 0, guests: [] });
      return;
    }
    setAudienceLoading(true);
    try {
      const data = await getCampaignAudience(spotId, campType, { inactiveDays, birthdayScope });
      setAudience(data);
    } catch (e) {
      onError?.(e.message || "Zielgruppe konnte nicht geladen werden.");
      setAudience({ count: 0, guests: [] });
    } finally {
      setAudienceLoading(false);
    }
  }, [spotId, campType, inactiveDays, birthdayScope, followerCount, onError]);

  useEffect(() => {
    loadAudience();
  }, [loadAudience]);

  useEffect(() => {
    const meta = CAMP_TYPE_META[campType];
    if (!campMsg.trim() && meta?.defaultMessage) {
      setCampMsg(personalizeMessage(meta.defaultMessage, spotName || spot?.name));
    }
  }, [campType, spotName, spot?.name]);

  const needsAudience = ["reactivation", "birthday", "push"].includes(campType);
  const audienceOk =
    campType === "push"
      ? followerCount > 0
      : campType === "reactivation" || campType === "birthday"
        ? audience.count > 0
        : true;
  const canSend = campMsg.trim().length > 0 && audienceOk;

  const sendCampaign = async () => {
    if (!canSend) return;
    setCampLoading(true);
    onError?.("");
    try {
      await createCampaign(spotId, {
        type: campType,
        message: campMsg.trim(),
        spot_name: spotName,
        audience: campType,
        inactive_days: campType === "reactivation" ? inactiveDays : null,
        birthday_scope: campType === "birthday" ? birthdayScope : null,
        recipient_count: needsAudience
          ? campType === "push"
            ? followerCount
            : audience.count
          : null,
        image_url: campImage || null,
      });
      setCampaigns(await getMerchantCampaigns(spotId));
      await syncCampaignsToSpotGuestFeed(spotId).catch(() => {});
      window.dispatchEvent(new Event("spotloop:campaign"));
      setCampSent(true);
      await refreshInsights();
      setTimeout(() => {
        setCampSent(false);
        setCampImage(null);
        setStep(0);
        onBack?.();
      }, 2200);
    } catch (e) {
      onError?.(e.message || "Kampagne konnte nicht gesendet werden.");
    } finally {
      setCampLoading(false);
    }
  };

  const guestPreview = previewGuestMessage(campType, campMsg, spotName || spot?.name, campImage);
  const typeCounts = insights ? campaignTypesWithCounts(insights) : [];

  return (
    <div>
      {!embedded && (
        <MerchantSubBack
          title="Kampagne senden"
          subtitle={STEPS[step]}
          onBack={() => (step > 0 ? setStep(step - 1) : onBack?.())}
        />
      )}

      {embedded && step > 0 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: C.green,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 12,
            padding: 0,
          }}
        >
          ‹ {STEPS[step - 1]}
        </button>
      )}

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 99,
                  background: i <= step ? C.green : C.border,
                }}
              />
              <div style={{ fontSize: 9, color: i <= step ? C.green : C.muted, marginTop: 4, fontWeight: 700 }}>
                {s}
              </div>
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Ziel wählen</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {CAMP_TYPES.map((t) => {
                const extra = typeCounts.find((x) => x.id === t.id);
                const isRec = extra?.recommended;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setCampType(t.id);
                      const templates = MESSAGE_TEMPLATES[t.id] || [];
                      setCampMsg(
                        personalizeMessage(
                          templates[0] || CAMP_TYPE_META[t.id]?.defaultMessage || "",
                          spotName || spot?.name
                        )
                      );
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      textAlign: "left",
                      background: campType === t.id ? C.mintLight : C.white,
                      border: `1.5px solid ${campType === t.id ? C.green : isRec ? C.green + "60" : C.border}`,
                      borderRadius: 14,
                      padding: "12px 14px",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>
                        {t.label}
                        {isRec && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 9,
                              fontWeight: 800,
                              color: C.green,
                              background: C.mintLight,
                              padding: "2px 8px",
                              borderRadius: 99,
                            }}
                          >
                            EMPFOHLEN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>{t.desc}</div>
                    </div>
                    {extra?.badge && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: C.green,
                          background: C.mintLight,
                          padding: "4px 10px",
                          borderRadius: 99,
                        }}
                      >
                        {extra.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {campType === "reactivation" && (
              <Card style={{ marginBottom: 12, padding: 14, background: C.mintLight }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Inaktiv seit</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {REACTIVATION_DAY_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setInactiveDays(d)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 20,
                        border: `1.5px solid ${inactiveDays === d ? C.green : C.border}`,
                        background: inactiveDays === d ? C.green : C.white,
                        color: inactiveDays === d ? "#fff" : C.mid,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {d} Tage
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {campType === "birthday" && (
              <Card style={{ marginBottom: 12, padding: 14, background: "#FFF8E8" }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Zeitraum</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { id: "today", label: "Heute" },
                    { id: "week", label: "Diese Woche" },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setBirthdayScope(o.id)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 12,
                        border: `1.5px solid ${birthdayScope === o.id ? "#D68A0C" : C.border}`,
                        background: birthdayScope === o.id ? "#D68A0C" : C.white,
                        color: birthdayScope === o.id ? "#fff" : C.mid,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {(campType === "reactivation" || campType === "birthday" || campType === "push") && (
              <Card style={{ padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.dark }}>Zielgruppe</div>
                  {audienceLoading && <span style={{ fontSize: 10, color: C.muted }}>lädt…</span>}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: audience.count > 0 ? C.green : C.muted, marginTop: 6 }}>
                  {campType === "push" ? followerCount : audience.count}
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginLeft: 6 }}>Empfänger</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                  {audienceSummary(campType, {
                    ...audience,
                    inactiveDays,
                    birthdayScope,
                    count: campType === "push" ? followerCount : audience.count,
                  })}
                </div>
              </Card>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={!audienceOk && needsAudience}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 14,
                border: "none",
                background: audienceOk || !needsAudience ? C.green : C.border,
                color: audienceOk || !needsAudience ? "#fff" : C.muted,
                fontSize: 14,
                fontWeight: 800,
                cursor: audienceOk || !needsAudience ? "pointer" : "not-allowed",
              }}
            >
              Weiter zur Nachricht
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Nachricht</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {(MESSAGE_TEMPLATES[campType] || []).map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCampMsg(personalizeMessage(tpl, spotName || spot?.name))}
                  style={{
                    fontSize: 11,
                    padding: "6px 10px",
                    borderRadius: 99,
                    border: `1px solid ${C.border}`,
                    background: C.bg,
                    color: C.mid,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Vorlage {i + 1}
                </button>
              ))}
            </div>
            <CampaignImagePicker
              imageUrl={campImage}
              onChange={setCampImage}
              onError={(msg) => onError?.(msg)}
            />
            <textarea
              value={campMsg}
              onChange={(e) => setCampMsg(e.target.value.slice(0, 160))}
              rows={4}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: `1.5px solid ${campMsg ? C.green : C.border}`,
                fontSize: 14,
                fontFamily: "inherit",
                resize: "none",
                boxSizing: "border-box",
                marginBottom: 12,
              }}
            />
            <Card style={{ padding: 14, background: C.bg, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 8 }}>
                VORSCHAU · SO SEHEN GÄSTE ES
              </div>
              {guestPreview.image_url && (
                <img
                  src={guestPreview.image_url}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 140,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 10,
                    display: "block",
                  }}
                />
              )}
              <div style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>{guestPreview.badge}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginTop: 4 }}>{guestPreview.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.45 }}>{guestPreview.body}</div>
            </Card>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!campMsg.trim()}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 14,
                border: "none",
                background: campMsg.trim() ? C.green : C.border,
                color: campMsg.trim() ? "#fff" : C.muted,
                fontSize: 14,
                fontWeight: 800,
                cursor: campMsg.trim() ? "pointer" : "not-allowed",
              }}
            >
              Weiter zum Senden
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <Card style={{ padding: 16, marginBottom: 14, background: C.mintLight, border: `1px solid ${C.green}35` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Zusammenfassung</div>
              <div style={{ fontSize: 13, color: C.mid, lineHeight: 1.6 }}>
                <strong>{CAMP_TYPE_META[campType]?.label}</strong>
                <br />
                An{" "}
                <strong>
                  {campType === "push" ? followerCount : audience.count} Gäste
                </strong>
                <br />
                „{campMsg.slice(0, 100)}
                {campMsg.length > 100 ? "…" : ""}"
                {campImage && (
                  <>
                    <br />
                    <span style={{ color: C.green }}>📷 Mit Bild</span>
                  </>
                )}
              </div>
            </Card>
            {campImage && (
              <img
                src={campImage}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: 160,
                  objectFit: "cover",
                  borderRadius: 14,
                  marginBottom: 14,
                }}
              />
            )}
            {campSent && <Alert type="success">✓ Kampagne gesendet!</Alert>}
            <div
              style={{
                textAlign: "center",
                fontSize: 14,
                fontWeight: 800,
                color: C.dark,
                lineHeight: 1.45,
                marginBottom: 14,
                padding: "0 4px",
              }}
            >
              {CAMPAIGN_SEND_GUARANTEE}
            </div>
            <button
              type="button"
              onClick={sendCampaign}
              disabled={!canSend || campLoading || campSent}
              style={{
                width: "100%",
                background: canSend ? CARD_GRADIENT : C.border,
                color: canSend ? "#fff" : C.muted,
                border: "none",
                borderRadius: 14,
                padding: 16,
                fontSize: 15,
                fontWeight: 800,
                cursor: canSend && !campLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: canSend ? `0 8px 24px ${C.shadowLg}` : "none",
              }}
            >
              <Send size={18} />
              {campLoading
                ? "Wird gesendet…"
                : `An ${campType === "push" ? followerCount : audience.count || "alle"} Gäste senden`}
            </button>
          </>
        )}
    </div>
  );
}
