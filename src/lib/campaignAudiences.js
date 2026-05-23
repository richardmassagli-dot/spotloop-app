import { demoGuestsForSpot } from "../data/campaignGuestsDemo.js";
import { REACTIVATION_CAMPAIGN_MESSAGE } from "../data/spotloopProductRules.js";
import { ACTIVE_MEMBER_DAYS } from "./memberProtection.js";
import { getMemberPseudonym, buildPrivacySafeRoster } from "./privacy.js";

export const REACTIVATION_DAY_OPTIONS = [14, 30, 60, 90];

export const CAMP_TYPE_META = {
  push: { icon: "🔔", label: "Push-Benachrichtigung", desc: "Nur aktive Stempelkarten (30 Tage)" },
  feed: { icon: "📌", label: "Featured Spot", desc: "Top-Position im Entdecken" },
  segment: { icon: "🎯", label: "Zielgruppen-Kampagne", desc: "Treue Gäste ansprechen" },
  reactivation: {
    icon: "💌",
    label: "Reaktivierung",
    desc: "Gäste, die lange nicht mehr die Stempelkarte genutzt haben",
    defaultMessage: REACTIVATION_CAMPAIGN_MESSAGE,
  },
  birthday: {
    icon: "🎂",
    label: "Geburtstags-Aktion",
    desc: "Glückwunsch & Reward für Gäste mit Geburtstag",
    defaultMessage:
      "Happy Birthday! 🎂 Heute gibt es bei uns dein Lieblings-Reward gratis — wir freuen uns auf dich!",
  },
};

export const CAMP_TYPES = Object.entries(CAMP_TYPE_META).map(([id, m]) => ({ id, ...m }));

/** MM-DD oder YYYY-MM-DD → MM-DD */
export function birthdayToMMDD(birthday) {
  if (!birthday || typeof birthday !== "string") return null;
  const s = birthday.trim();
  if (/^\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysSince(iso) {
  if (!iso) return 9999;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function isBirthdayToday(birthday, ref = new Date()) {
  const mmdd = birthdayToMMDD(birthday);
  if (!mmdd) return false;
  const refMmdd = `${String(ref.getMonth() + 1).padStart(2, "0")}-${String(ref.getDate()).padStart(2, "0")}`;
  return mmdd === refMmdd;
}

export function isBirthdayThisWeek(birthday, ref = new Date()) {
  const mmdd = birthdayToMMDD(birthday);
  if (!mmdd) return false;
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(ref);
    d.setDate(d.getDate() + i);
    const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (key === mmdd) return true;
  }
  return false;
}

function mergeGuests(primary, extra) {
  const byId = new Map();
  for (const g of [...primary, ...extra]) {
    const id = g.user_id || g.id;
    if (!id) continue;
    const prev = byId.get(id);
    byId.set(id, {
      user_id: id,
      name: g.name || g.display_name || prev?.name || "Gast",
      birthday: g.birthday ?? prev?.birthday ?? null,
      last_visit: g.last_visit || g.updated_at || prev?.last_visit || null,
      days_inactive: g.days_inactive ?? daysSince(g.last_visit || g.updated_at),
    });
  }
  return [...byId.values()];
}

export function filterCampaignAudience(guests, type, { inactiveDays = ACTIVE_MEMBER_DAYS, birthdayScope = "today", spotId } = {}) {
  const mask = (list) => (spotId ? buildPrivacySafeRoster(list, spotId) : list);

  if (type === "push") {
    const matched = guests.filter((g) => (g.days_inactive ?? daysSince(g.last_visit)) < inactiveDays);
    return { count: matched.length, guests: mask(matched.slice(0, 8)), activeDays: inactiveDays };
  }
  if (type === "reactivation") {
    const matched = guests.filter((g) => (g.days_inactive ?? daysSince(g.last_visit)) >= inactiveDays);
    return { count: matched.length, guests: mask(matched.slice(0, 8)), inactiveDays };
  }
  if (type === "birthday") {
    const fn = birthdayScope === "week" ? isBirthdayThisWeek : isBirthdayToday;
    const matched = guests.filter((g) => fn(g.birthday));
    return { count: matched.length, guests: mask(matched.slice(0, 8)), birthdayScope };
  }
  return { count: guests.length, guests: mask(guests.slice(0, 8)) };
}

export function buildGuestRosterFromStamps(stamps, usersById = {}, spotId = "") {
  return stamps.map((s) => {
    const u = usersById[s.user_id];
    return {
      user_id: s.user_id,
      name: getMemberPseudonym(s.user_id, spotId || s.spot_id),
      birthday: u?.birthday ?? null,
      last_visit: s.updated_at || s.created_at,
      days_inactive: daysSince(s.updated_at || s.created_at),
    };
  });
}

export function getLocalCampaignGuests(spotId) {
  try {
    const stamps = JSON.parse(localStorage.getItem("local_stamps") || "{}");
    const users = JSON.parse(localStorage.getItem("local_users") || "{}");
    const stampRows = Object.values(stamps).filter((s) => s.spot_id === spotId);
    const fromStamps = buildGuestRosterFromStamps(stampRows, users, spotId);
    return buildPrivacySafeRoster(mergeGuests(fromStamps, demoGuestsForSpot()), spotId);
  } catch {
    return demoGuestsForSpot();
  }
}

export function audienceSummary(type, audience) {
  if (type === "reactivation") {
    return audience.count === 0
      ? `Keine Gäste inaktiv seit ${audience.inactiveDays ?? 30}+ Tagen`
      : `${audience.count} Gäste · inaktiv ≥ ${audience.inactiveDays ?? 30} Tage`;
  }
  if (type === "birthday") {
    const when = audience.birthdayScope === "week" ? "diese Woche" : "heute";
    return audience.count === 0
      ? `Keine Geburtstage ${when}`
      : `${audience.count} Geburtstage ${when}`;
  }
  return null;
}
