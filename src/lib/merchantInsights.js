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

/**
 * Kennzahlen für Hub-Kachel & Detail-Sheet (echte Daten + sinnvolle Defaults).
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

  const activeStamm =
    dash.regular?.length ?? (dash.guests || []).filter((g) => !g.inactive).length ?? 0;
  const sleepers = dash.inactive?.length ?? 0;
  const atRisk = (dash.atRisk?.length ?? 0) + (dash.critical?.length ?? 0);

  const totalMonthVisits = (checkins || []).filter((c) => {
    const d = new Date(c.updated_at || c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const repeatRate =
    totalMonthVisits > 0
      ? Math.min(99, Math.round((returningRevenue / (totalMonthVisits * AVG_TICKET_EUR || 1)) * 100))
      : 0;

  const stammRevenue = dash.topRevenueEstimate || Math.round(activeStamm * AVG_TICKET_EUR * 1.4);
  const totalEst = Math.max(stammRevenue + 200, returningRevenue + 180);
  const stammPct = totalEst > 0 ? Math.round((stammRevenue / totalEst) * 100) : 0;

  const sleeperPotential = sleepers * AVG_TICKET_EUR * 1.2;
  const returnScore = Math.min(100, Math.max(0, Math.round(repeatRate * 1.75)));

  const chart7 = last7DayCheckins(checkins);
  const maxBar = Math.max(1, ...chart7.map((d) => d.count));

  const topGuests = [...(dash.guests || [])]
    .sort((a, b) => (b.revenueMonthEstimate ?? 0) - (a.revenueMonthEstimate ?? 0))
    .slice(0, 4);

  return {
    kpis: {
      checkinsToday,
      guests: followerCount,
      redemptions,
    },
    hub: {
      returningRevenue: returningRevenue || 1248,
      repeatRate: repeatRate || 42,
      activeStammgaeste: activeStamm || 12,
      sleepers: sleepers || atRisk || 3,
      returnScore: returnScore || 73,
    },
    detail: {
      returningRevenue: returningRevenue || 1248,
      returningRevenueDelta: 18,
      repeatRate: repeatRate || 42,
      repeatRateDelta: 6,
      activeStammgaeste: activeStamm || 12,
      chart7,
      maxBar,
      segments: {
        stamm: { revenue: stammRevenue || 820, pct: stammPct || 66 },
        active: { revenue: Math.round((returningRevenue || 368) * 0.45) || 368 },
        sleepers: { revenue: 0, potential: Math.round(sleeperPotential) || 180, count: sleepers || 3 },
        newGuests: { revenue: 60 },
      },
      topGuests,
      reactivation: {
        count: sleepers || 3,
        days: STAMMGAST_INACTIVE_DAYS,
        potential: Math.round(sleeperPotential) || 180,
      },
    },
    dash,
  };
}

export { formatEuro };
