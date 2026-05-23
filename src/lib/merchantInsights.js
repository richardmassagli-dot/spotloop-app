import { computeCheckinsToday, computeReturningRevenueThisMonth, formatEuro } from "./merchantOverview";
import { buildStammgaesteDashboard, AVG_TICKET_EUR, STAMMGAST_INACTIVE_DAYS } from "./merchantStammgaeste";

function last7DayCheckins(checkins = []) {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toDateString();
    const count = checkins.filter((c) => {
      const t = new Date(c.updated_at || c.created_at);
      return !Number.isNaN(t.getTime()) && t.toDateString() === key;
    }).length;
    days.push({ label: d.toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2), count });
  }
  return days;
}

/** Anteil der Monats-Check-ins von Gästen, die schon vor diesem Monat da waren. */
function computeRepeatRate(checkins = []) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstVisit = new Map();

  for (const c of checkins) {
    const uid = c.user_id;
    if (!uid) continue;
    const d = new Date(c.updated_at || c.created_at);
    if (Number.isNaN(d.getTime())) continue;
    if (!firstVisit.has(uid) || d < firstVisit.get(uid)) firstVisit.set(uid, d);
  }

  let total = 0;
  let returning = 0;
  for (const c of checkins) {
    const uid = c.user_id;
    if (!uid) continue;
    const d = new Date(c.updated_at || c.created_at);
    if (Number.isNaN(d.getTime()) || d < monthStart) continue;
    total += 1;
    if (firstVisit.get(uid) < monthStart) returning += 1;
  }

  return total > 0 ? Math.min(99, Math.round((returning / total) * 100)) : 0;
}

/**
 * Kennzahlen für Hub-Kachel & Detail-Sheet — nur echte Daten, keine Demo-Zahlen.
 */
export function buildMerchantInsights({
  checkins = [],
  stampMembers = [],
  spotId,
  followerCount = 0,
  campaigns = [],
  redemptions = 0,
}) {
  const dash = buildStammgaesteDashboard(stampMembers, spotId, { checkins, campaigns, followerCount });
  const returningRevenue = computeReturningRevenueThisMonth(checkins);
  const checkinsToday = computeCheckinsToday(checkins);
  const repeatRate = computeRepeatRate(checkins);

  const activeStamm = dash.regular?.length ?? 0;
  const sleepersAtRisk = (dash.atRisk?.length ?? 0) + (dash.critical?.length ?? 0);
  const sleepersInactive = dash.inactive?.length ?? 0;

  const totalMonthVisits = (checkins || []).filter((c) => {
    const d = new Date(c.updated_at || c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const hasMonthData = totalMonthVisits > 0 || activeStamm > 0 || returningRevenue > 0;

  const stammRevenue = dash.topRevenueEstimate ?? 0;
  const totalEst = Math.max(stammRevenue + returningRevenue, returningRevenue, 1);
  const stammPct = totalEst > 0 ? Math.round((stammRevenue / totalEst) * 100) : 0;

  const sleeperPotential = Math.round(sleepersInactive * AVG_TICKET_EUR * 1.2);
  const returnScore = hasMonthData
    ? Math.min(100, Math.max(0, Math.round(repeatRate * 0.7 + activeStamm * 8)))
    : 0;

  const chart7 = last7DayCheckins(checkins);
  const maxBar = Math.max(1, ...chart7.map((d) => d.count));

  const topGuests = [...(dash.guests || [])]
    .sort((a, b) => (b.revenueMonthEstimate ?? 0) - (a.revenueMonthEstimate ?? 0))
    .slice(0, 4);

  const hub = {
    returningRevenue,
    repeatRate,
    activeStammgaeste: activeStamm,
    sleepers: sleepersAtRisk,
    sleepersInactive,
    returnScore,
  };

  return {
    kpis: {
      checkinsToday,
      guests: followerCount,
      redemptions,
    },
    hub,
    detail: {
      ...hub,
      returningRevenueDelta: null,
      repeatRateDelta: null,
      chart7,
      maxBar,
      hasMonthData,
      segments: {
        stamm: { revenue: stammRevenue, pct: stammPct },
        active: { revenue: Math.max(0, returningRevenue - stammRevenue) },
        sleepers: {
          revenue: 0,
          potential: sleeperPotential,
          count: sleepersInactive,
        },
        newGuests: { revenue: Math.max(0, Math.round(totalMonthVisits * AVG_TICKET_EUR) - returningRevenue) },
      },
      topGuests,
      reactivation: {
        count: sleepersInactive,
        days: STAMMGAST_INACTIVE_DAYS,
        potential: sleeperPotential,
      },
    },
    dash,
  };
}

export { formatEuro };
