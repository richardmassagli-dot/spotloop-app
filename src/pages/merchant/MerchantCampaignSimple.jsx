import { useState, useEffect, useMemo } from "react";
import { Send } from "lucide-react";
import { C, Alert } from "../../components/ui";
import { createCampaign, getMerchantCampaigns, getCampaignAudience } from "../../lib/firestore";
import { CAMPAIGN_SEND_GUARANTEE } from "../../data/spotloopMessaging";
import {
  canSendNormalCampaign,
  countNormalCampaignsThisWeek,
  getWeeklyCampaignLimit,
} from "../../lib/memberProtection";
import MemberProtectionCard from "../../components/product/MemberProtectionCard";
import ExtraPushCreditsCard from "../../components/merchant/ExtraPushCreditsCard";

export default function MerchantCampaignSimple({
  spotId,
  spotName,
  followerCount = 0,
  merchantPlanId = "growth",
  setCampaigns,
  onError,
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [campaigns, setLocalCampaigns] = useState([]);
  const [audienceCount, setAudienceCount] = useState(0);
  const [loadingAudience, setLoadingAudience] = useState(true);

  useEffect(() => {
    if (!spotId) return;
    getMerchantCampaigns(spotId).then(setLocalCampaigns).catch(() => setLocalCampaigns([]));
  }, [spotId, sent]);

  useEffect(() => {
    if (!spotId) return;
    setLoadingAudience(true);
    getCampaignAudience(spotId, "push", { inactiveDays: 30 })
      .then((a) => setAudienceCount(a.count ?? 0))
      .catch(() => setAudienceCount(0))
      .finally(() => setLoadingAudience(false));
  }, [spotId, sent]);

  const weekly = useMemo(
    () => canSendNormalCampaign({ campaigns: campaigns, planId: merchantPlanId }),
    [campaigns, merchantPlanId],
  );

  const limit = getWeeklyCampaignLimit(merchantPlanId);
  const usedWeek = countNormalCampaignsThisWeek(campaigns);

  const canSend =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    audienceCount > 0 &&
    weekly.ok;

  const titleLeft = 50 - title.length;
  const msgLeft = 100 - message.length;

  const send = async () => {
    if (!canSend) return;
    setLoading(true);
    setError("");
    onError?.("");
    try {
      const fullMessage = `${title.trim()}\n\n${message.trim()}`;
      await createCampaign(spotId, {
        type: "push",
        message: fullMessage,
        spot_name: spotName,
        audience: "active_stamps",
        recipient_count: audienceCount,
      });
      if (setCampaigns) {
        setCampaigns(await getMerchantCampaigns(spotId));
      }
      window.dispatchEvent(new Event("spotloop:campaign"));
      setSent(true);
      setTitle("");
      setMessage("");
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      const msg = e.message || "Senden fehlgeschlagen";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: `1.5px solid ${C.border}`,
    fontSize: 15,
    fontFamily: "inherit",
    color: C.dark,
    boxSizing: "border-box",
    marginBottom: 14,
  };

  return (
    <div>
      <MemberProtectionCard />

      {error && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {sent && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="success">Kampagne an aktive Treue-Karten gesendet</Alert>
        </div>
      )}
      {!weekly.ok && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="warning">{weekly.reason}</Alert>
        </div>
      )}
      {!weekly.ok && limit > 0 && (
        <ExtraPushCreditsCard
          spotId={spotId}
          spotName={spotName}
          merchantPlanId={merchantPlanId}
          quotaExhausted
        />
      )}

      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, marginBottom: 14 }}>
        {CAMPAIGN_SEND_GUARANTEE}
        <br />
        <span style={{ color: C.dark, fontWeight: 700 }}>
          {followerCount} folgen · {loadingAudience ? "…" : audienceCount} sammeln aktiv
        </span>
        {limit < 99 && (
          <>
            {" "}
            · diese Woche {usedWeek}/{limit} Kampagnen
          </>
        )}
      </div>

      <label style={{ display: "block", fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        Titel
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, 50))}
        placeholder="z. B. Diese Woche bei uns"
        maxLength={50}
        style={fieldStyle}
      />
      <div style={{ fontSize: 11, color: C.muted, marginTop: -10, marginBottom: 14, textAlign: "right" }}>
        {titleLeft} Zeichen übrig
      </div>

      <label style={{ display: "block", fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        Nachricht
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 100))}
        placeholder="Deine Nachricht an Gäste mit aktiver Treue-Karte…"
        rows={4}
        maxLength={100}
        style={{ ...fieldStyle, resize: "vertical", minHeight: 100 }}
      />
      <div style={{ fontSize: 11, color: C.muted, marginTop: -10, marginBottom: 14, textAlign: "right" }}>
        {msgLeft} Zeichen übrig
      </div>

      {(title.trim() || message.trim()) && (
        <div
          style={{
            background: C.white,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            padding: "14px 16px",
            marginBottom: 14,
            boxShadow: "0 4px 16px rgba(0,0,0,.06)",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>PUSH-VORSCHAU</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{spotName || "Dein Spot"}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginTop: 4 }}>{title.trim() || "Titel"}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.45 }}>{message.trim() || "Nachricht"}</div>
        </div>
      )}

      <div
        style={{
          padding: "14px 16px",
          borderRadius: 14,
          background: C.mintLight,
          border: `1px solid ${C.fresh}30`,
          marginBottom: 16,
          fontSize: 14,
          fontWeight: 700,
          color: C.dark,
          textAlign: "center",
        }}
      >
        Erreicht:{" "}
        <span style={{ color: C.green, fontWeight: 900 }}>
          {loadingAudience ? "…" : audienceCount}
        </span>{" "}
        aktive Treue-Karten
      </div>

      <button
        type="button"
        onClick={send}
        disabled={!canSend || loading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "15px 18px",
          borderRadius: 14,
          border: "none",
          background: canSend && !loading ? C.green : C.border,
          color: canSend && !loading ? "#fff" : C.muted,
          fontSize: 15,
          fontWeight: 800,
          cursor: canSend && !loading ? "pointer" : "not-allowed",
          fontFamily: "inherit",
        }}
      >
        <Send size={18} />
        {loading
          ? "Wird gesendet…"
          : `Senden an ${loadingAudience ? "…" : audienceCount} aktive Gäste`}
      </button>

      {audienceCount === 0 && !loadingAudience && (
        <p style={{ fontSize: 12, color: C.muted, marginTop: 12, textAlign: "center", lineHeight: 1.5 }}>
          Noch keine aktiven Treue-Karten — Gäste müssen scannen und in den letzten 30 Tagen wieder kommen.
          Folgen allein reicht nicht.
        </p>
      )}
    </div>
  );
}
