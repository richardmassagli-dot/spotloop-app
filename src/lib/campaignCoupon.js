/**
 * Premium-Coupon-Ansicht für Kampagnen-Push & In-App-Reveal.
 */

const TIME_RANGE_RE = /(\d{1,2})\s*[–\-]\s*(\d{1,2})\s*Uhr/i;
const VALID_UNTIL_RE = /bis\s+(\d{1,2}(?::\d{2})?)\s*Uhr/i;
const TODAY_RE = /\b(heute|nur heute|diese woche)\b/i;

function stripLeadingEmoji(text) {
  return (text || "").replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, "").trim();
}

function firstSentence(text) {
  const t = stripLeadingEmoji(text);
  const parts = t.split(/[.!?—]\s+/);
  return (parts[0] || t).trim();
}

function extractOfferWindow(text) {
  const t = stripLeadingEmoji(text);
  const range = t.match(TIME_RANGE_RE);
  if (range) {
    const today = TODAY_RE.test(t) ? "heute, " : "";
    return `${today}${range[1]}–${range[2]} Uhr`;
  }
  if (TODAY_RE.test(t)) return "Heute";
  if (/happy hour/i.test(t)) return "Heute, Happy Hour";
  if (/geburtstag|birthday/i.test(t)) return "Heute";
  return null;
}

function extractValidUntil(text) {
  const t = stripLeadingEmoji(text);
  const m = t.match(VALID_UNTIL_RE);
  if (m) {
    const raw = m[1];
    return raw.includes(":") ? `Gültig bis ${raw} Uhr` : `Gültig bis ${raw}:00 Uhr`;
  }
  const range = t.match(TIME_RANGE_RE);
  if (range) return `Gültig bis ${range[2]}:00 Uhr`;
  if (TODAY_RE.test(t)) return "Gültig bis heute Abend";
  return "Beim Personal vorzeigen";
}

function urgencyMeta(text, campaignType) {
  const t = stripLeadingEmoji(text);
  if (VALID_UNTIL_RE.test(t) || TIME_RANGE_RE.test(t) || TODAY_RE.test(t)) {
    return "Nur heute gültig · Jetzt öffnen";
  }
  if (campaignType === "birthday") return "Nur heute · Jetzt öffnen";
  if (campaignType === "push" || campaignType === "reactivation") {
    return "Exklusiv für Gäste · Jetzt öffnen";
  }
  return "Jetzt öffnen";
}

/** Farben & Verläufe für Coupon-UI — an Spot-Design (bg_color) angepasst */
export function couponThemeFromSpot(bg = "#1B4FD8") {
  const base = bg && /^#[0-9A-Fa-f]{6}$/.test(bg) ? bg : "#1B4FD8";
  return {
    bg: base,
    gradient: `linear-gradient(155deg, ${base} 0%, ${base}E6 42%, ${base}B3 100%)`,
    gradientSoft: `linear-gradient(180deg, ${base}14 0%, #FFFFFF 38%, #F8FAFF 100%)`,
    ring: `${base}40`,
    glow: `${base}28`,
    accent: base,
    labelOnDark: "rgba(255,255,255,0.72)",
  };
}

export function isCampaignCouponItem(item) {
  const t = item?.campaign_type || "";
  if (!t || t.startsWith("post_")) return false;
  return ["push", "reactivation", "birthday", "segment", "stammgast", "feed"].includes(t);
}

/** Coupon-View-Model aus Feed- oder Kampagnen-Zeile. */
export function buildCouponViewModel(item) {
  const spotName = item?.spot_name || "Dein Spot";
  const spotEmoji = item?.spot_emoji || "🏪";
  const message = item?.description || item?.title || item?.message || "";
  const clean = stripLeadingEmoji(message);
  const campaignType = item?.campaign_type || "push";
  const campaignId = String(item?.id || item?.campaign_id || "camp").replace(/^live-/, "");
  const spotId = item?.spot_id || "";

  const offerTitle = firstSentence(clean) || "Exklusives Angebot";
  const offerWindow = extractOfferWindow(clean) || (campaignType === "birthday" ? "Heute" : "Für kurze Zeit");
  const validUntil = extractValidUntil(clean);
  const redeemCode = `SL-${spotId.slice(0, 6).toUpperCase()}-${campaignId.slice(-6).toUpperCase()}`;

  return {
    spotName,
    spotEmoji,
    spotBg: item?.spot_bg || "#1B4FD8",
    offerTitle,
    offerWindow,
    validUntil,
    redeemCode,
    finePrint: "Beim Personal vorzeigen",
    push: {
      merchantLine: `${spotEmoji} ${spotName}`,
      headline: "Dein exklusiver Vorteil wartet",
      meta: urgencyMeta(clean, campaignType),
    },
    rawMessage: clean,
    campaignType,
    spotId,
    campaignId: item?.id,
  };
}
