/** Demo-Gäste für Kampagnen-Zielgruppen (lokal / ohne Supabase-RPC). */

const todayMMDD = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const TD = todayMMDD();

export const CAMPAIGN_GUEST_DEMO = [
  { id: "g1", name: "Lisa M.", last_visit_days_ago: 52, birthday: TD },
  { id: "g2", name: "Tom K.", last_visit_days_ago: 38, birthday: "03-14" },
  { id: "g3", name: "Anna S.", last_visit_days_ago: 67, birthday: "11-02" },
  { id: "g4", name: "Marco B.", last_visit_days_ago: 14, birthday: "07-08" },
  { id: "g5", name: "Julia W.", last_visit_days_ago: 91, birthday: "01-22" },
  { id: "g6", name: "Felix R.", last_visit_days_ago: 41, birthday: TD },
  { id: "g7", name: "Sara H.", last_visit_days_ago: 22, birthday: "09-30" },
  { id: "g8", name: "Noah P.", last_visit_days_ago: 120, birthday: "05-03" },
];

export function demoGuestsForSpot() {
  return CAMPAIGN_GUEST_DEMO.map((g) => {
    const last = new Date();
    last.setDate(last.getDate() - g.last_visit_days_ago);
    return {
      user_id: g.id,
      name: g.name,
      birthday: g.birthday,
      last_visit: last.toISOString(),
      days_inactive: g.last_visit_days_ago,
    };
  });
}
