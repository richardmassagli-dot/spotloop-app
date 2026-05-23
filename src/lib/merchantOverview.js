/** KPIs für Merchant-Übersicht — ehrliche Schätzwerte wo nötig. */

const AVG_VISIT_SPEND_EUR = 15;

function parseDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function computeCheckinsToday(checkins = []) {
  const today = new Date().toDateString();
  return checkins.filter((c) => {
    const d = parseDate(c.updated_at || c.created_at);
    return d && d.toDateString() === today;
  }).length;
}

/** Geschätzter Umsatz durch wiederkehrende Gäste diesen Monat (Besuche nach erstem Kontakt). */
export function computeReturningRevenueThisMonth(checkins = [], avgSpend = AVG_VISIT_SPEND_EUR) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const byUser = new Map();
  for (const c of checkins) {
    const uid = c.user_id;
    if (!uid) continue;
    const d = parseDate(c.updated_at || c.created_at);
    if (!d) continue;
    if (!byUser.has(uid)) byUser.set(uid, { first: d, monthVisits: 0 });
    const row = byUser.get(uid);
    if (d < row.first) row.first = d;
    if (d >= monthStart) row.monthVisits += 1;
  }

  let returningVisits = 0;
  for (const { first, monthVisits } of byUser.values()) {
    if (first < monthStart && monthVisits > 0) {
      returningVisits += monthVisits;
    }
  }

  return Math.round(returningVisits * avgSpend);
}

export function formatEuro(amount) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}
