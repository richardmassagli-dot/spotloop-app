import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToSpot, subscribeMerchantCheckins, getMerchantStats, createCampaign, getMerchantCampaigns } from "../../lib/firestore";
import { C, Card, Logo, Tag, ProgressBar, Alert, Spinner, CARD_GRADIENT } from "../../components/ui";
import SecureQR from "./SecureQR";
import MerchantSettings from "./MerchantSettings";
import MerchantBrandKit from "./MerchantBrandKit";
import MerchantPosts from "./MerchantPosts";

const CAMP_TYPES = [
  { id: "push",    icon: "🔔", label: "Push-Benachrichtigung", desc: "Direkt an alle Follower" },
  { id: "feed",    icon: "📌", label: "Featured Spot",         desc: "Top-Position im Entdecken" },
  { id: "segment", icon: "🎯", label: "Zielgruppen-Kampagne",  desc: "Treue Gäste ansprechen" },
];

const weekdayLabel = (iso) =>
  new Date(iso).toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "");

export default function MerchantDashboard({ onLogout }) {
  const { user, profile } = useAuth();
  const [spot, setSpot]         = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [stats, setStats]       = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [tab, setTab]           = useState("overview");
  const [loading, setLoading]   = useState(true);
  const [dailyData, setDailyData] = useState([]);
  const [error, setError] = useState("");

  const [campType, setCampType] = useState("push");
  const [campMsg, setCampMsg]   = useState("");
  const [campSent, setCampSent] = useState(false);
  const [campLoading, setCampLoading] = useState(false);

  useEffect(() => {
    const unsubSpot = subscribeToSpot(user.uid, (s) => { setSpot(s); setLoading(false); });
    const unsubCheckins = subscribeMerchantCheckins(user.uid, setCheckins);
    getMerchantStats(user.uid).then(setStats).catch((e) => setError(e.message || "Statistiken konnten nicht geladen werden."));
    getMerchantCampaigns(user.uid).then(setCampaigns).catch((e) => setError(e.message || "Kampagnen konnten nicht geladen werden."));
    return () => { unsubSpot(); unsubCheckins(); };
  }, [user.uid]);

  useEffect(() => {
    const map = new Map();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { day: weekdayLabel(d), val: 0 });
    }
    checkins.forEach((c) => {
      const dt = c.updated_at || c.created_at;
      if (!dt) return;
      const key = new Date(dt).toISOString().slice(0, 10);
      if (map.has(key)) map.get(key).val += 1;
    });
    setDailyData(Array.from(map.values()));
  }, [checkins]);

  const sendCampaign = async () => {
    if (!campMsg.trim()) return;
    setCampLoading(true);
    setError("");
    try {
      await createCampaign(user.uid, { type: campType, message: campMsg, spot_name: spot?.name });
      setCampaigns(await getMerchantCampaigns(user.uid));
      setCampMsg("");
      setCampSent(true);
      setTimeout(() => setCampSent(false), 3000);
    } catch (e) {
      setError(e.message || "Kampagne konnte nicht gesendet werden.");
    } finally {
      setCampLoading(false);
    }
  };

  const maxDaily = Math.max(...dailyData.map(d => d.val), 1);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", background: C.bg }}>
      <Spinner size={40} />
    </div>
  );

  if (tab === "msettings") return <MerchantSettings onBack={() => setTab("overview")} />;
  if (tab === "brandkit")  return <MerchantBrandKit merchantId={user.uid} spot={spot} />;

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 24 }}>
      {/* ── Hero Header ── */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
        <div style={{ position: "absolute", bottom: -30, left: 20, width: 160, height: 160, borderRadius: "50%", background: "rgba(19,176,92,.06)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, position: "relative" }}>
          <Logo size={20} light />
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", borderRadius: 10, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            Abmelden
          </button>
        </div>

        <div style={{ marginBottom: 20, position: "relative" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>HÄNDLER-DASHBOARD</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{spot?.name || profile?.name}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 3 }}>
            {spot?.category}{spot?.area && ` · ${spot.area}`}
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, position: "relative" }}>
          {[
            { val: spot?.total_checkins ?? 0, label: "Check-ins",    icon: "⬛", color: "#fff" },
            { val: spot?.followers ?? 0,      label: "Follower",     icon: "❤️", color: "#fff" },
            { val: stats?.redemptions ?? 0,   label: "Einlösungen",  icon: "🎁", color: C.gold },
          ].map((k, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{k.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: k.color, letterSpacing: -1 }}>{k.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        <div style={{ display: "flex", minWidth: "max-content" }}>
          {[["overview","📊 Übersicht"],["analytics","📈 Intelligence"],["posts","📝 Posts"],["yearly","📅 Jahresbericht"],["qr","⬛ QR-Code"],["campaigns","📢 Kampagne"],["brandkit","🎨 Brand Kit"],["msettings","⚙️ Einstellungen"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: "none", border: "none",
                borderBottom: `2.5px solid ${tab === id ? C.green : "transparent"}`,
                padding: "13px 20px", fontSize: 12, fontWeight: tab === id ? 800 : 500,
                color: tab === id ? C.green : C.muted, cursor: "pointer", flexShrink: 0,
                transition: "all .15s",
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {error && (
          <div style={{ marginBottom: 12 }}>
            <Alert type="error">{error}</Alert>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            {/* Spot summary card */}
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>🎁 Dein Reward</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.green, marginTop: 4, letterSpacing: -0.5 }}>{spot?.reward_text}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>bei {spot?.max_points} Stempeln</div>
                </div>
                <div style={{ background: `${spot?.bg_color || C.green}18`, borderRadius: 14, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                  {spot?.emoji || "🏪"}
                </div>
              </div>
              {spot?.area && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag>📍 {spot.area}</Tag>
                  <Tag>{spot.category}</Tag>
                </div>
              )}
              {spot?.current_action && (
                <div style={{ marginTop: 10, background: C.orangeLight, border: `1px solid ${C.orange}30`, borderRadius: 10, padding: "8px 12px", fontSize: 12, color: C.orange, fontWeight: 700 }}>
                  🔥 Aktion: {spot.current_action}
                </div>
              )}
            </Card>

            {/* Progress bars */}
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 14 }}>📈 Wachstum</div>
              {[
                { label: "Check-ins (Ziel: 100)", val: spot?.total_checkins ?? 0, max: 100, color: C.green },
                { label: "Follower (Ziel: 50)",   val: spot?.followers ?? 0,      max: 50,  color: C.purple },
              ].map(({ label, val, max, color }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 5 }}>
                    <span>{label}</span>
                    <span style={{ fontWeight: 700, color: C.dark }}>{val} / {max}</span>
                  </div>
                  <ProgressBar value={val} max={max} color={color} height={7} />
                </div>
              ))}
            </Card>

            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Monatsüberblick</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div style={{ background: C.mintLight, borderRadius: 10, padding: "10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.green }}>{checkins.length}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Letzte Check-ins</div>
                </div>
                <div style={{ background: C.purpleLight, borderRadius: 10, padding: "10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.purple }}>{campaigns.length}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Kampagnen gesendet</div>
                </div>
                <div style={{ background: C.orangeLight, borderRadius: 10, padding: "10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.orange }}>{stats?.redemptions ?? 0}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>Rewards eingelöst</div>
                </div>
              </div>
            </Card>

            {/* Recent activity */}
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 12 }}>Letzte Aktivität</div>
            {checkins.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Noch keine Check-ins</div>
                <div style={{ fontSize: 12, color: C.muted }}>Teile deinen QR-Code mit deinen Gästen!</div>
              </div>
            ) : (
              checkins.slice(0, 5).map((c, i) => (
                <div key={c.id || i} style={{ background: C.white, borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: (c.reward_triggered || c.reward_ready) ? C.orangeLight : C.mintLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {(c.reward_triggered || c.reward_ready) ? "🎁" : "⭐"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>
                        {(c.reward_triggered || c.reward_ready) ? "Reward eingelöst" : "Check-in"}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>{c.points ?? c.pts ?? "–"} Punkte</div>
                    </div>
                  </div>
                  {(c.reward_triggered || c.reward_ready) && (
                    <span style={{ background: C.orangeLight, color: C.orange, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 800 }}>Reward</span>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <>
            {/* 7-day chart */}
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>Check-ins (7 Tage)</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Simulierte Übersicht</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.green, letterSpacing: -1 }}>{dailyData.reduce((a, d) => a + d.val, 0)}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>diese Woche</div>
                </div>
              </div>
              {/* Bar chart */}
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
                {dailyData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%", background: `${C.green}18`, borderRadius: 6,
                      height: 64, display: "flex", flexDirection: "column", justifyContent: "flex-end",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        background: `linear-gradient(to top, ${C.green}, ${C.fresh})`,
                        height: `${(d.val / maxDaily) * 100}%`,
                        borderRadius: 6,
                        transition: "height .4s",
                      }} />
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.muted }}>{d.day}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Metric cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { icon: "🔄", label: "Kampagnen", val: campaigns.length, sub: "gesamt versendet", color: C.green, bg: C.mintLight },
                { icon: "⏱️", label: "Ø Check-ins / Tag", val: (dailyData.reduce((a, d) => a + d.val, 0) / 7).toFixed(1), sub: "letzte 7 Tage", color: C.purple, bg: C.purpleLight },
                { icon: "🎯", label: "Reward-Einlösungen", val: stats?.redemptions ?? 0, sub: "aus Stempelkarten", color: C.orange, bg: C.orangeLight },
                { icon: "📈", label: "Follower", val: spot?.followers ?? 0, sub: "aktuell", color: C.gold, bg: C.goldLight },
              ].map((m, i) => (
                <div key={i} style={{ background: m.bg, borderRadius: 16, padding: "14px 14px", border: `1px solid ${m.color}18` }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: m.color, letterSpacing: -1 }}>{m.val}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.dark, marginTop: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Guest segments */}
            <Card>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 14 }}>Gäste-Segmente</div>
              {[
                { label: "Stammgäste",  pct: 38, color: C.green,  icon: "⭐" },
                { label: "Regelmäßig",  pct: 29, color: C.purple, icon: "🔄" },
                { label: "Gelegentlich",pct: 22, color: C.gold,   icon: "📍" },
                { label: "Neu",         pct: 11, color: C.muted,  icon: "👋" },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: i < 3 ? 10 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: C.dark }}>{s.icon} {s.label}</span>
                    <span style={{ fontWeight: 800, color: s.color }}>{s.pct}%</span>
                  </div>
                  <ProgressBar value={s.pct} max={100} color={s.color} height={6} bg={`${s.color}18`} />
                </div>
              ))}
            </Card>
          </>
        )}

        {/* ── POSTS & UPDATES ── */}
        {tab === "posts" && (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Posts & Updates</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Teile Neuigkeiten, Specials und Events mit deinen Followern.</div>
            <MerchantPosts />
          </>
        )}

        {/* ── JAHRESBERICHT ── */}
        {tab === "yearly" && (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Jahresbericht 2025</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Live-Zusammenfassung auf Basis deiner echten Spot-Daten.</div>
            <Card style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Live KPIs</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <MetricTile label="Check-ins gesamt" value={spot?.total_checkins ?? 0} />
                <MetricTile label="Follower gesamt" value={spot?.followers ?? 0} />
                <MetricTile label="Reward-Einlösungen" value={stats?.redemptions ?? 0} />
                <MetricTile label="Kampagnen gesamt" value={campaigns.length} />
              </div>
            </Card>
          </>
        )}

        {/* ── QR-CODE (Secure) ── */}
        {tab === "qr" && (
          <SecureQR merchantId={user.uid} spotName={spot?.name || profile?.name} />
        )}

        {/* ── KAMPAGNEN ── */}
        {tab === "campaigns" && (
          <>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Neue Kampagne</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Erreiche deine Gäste direkt in der App.</div>

            {/* Type selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {CAMP_TYPES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setCampType(t.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: campType === t.id ? C.mintLight : C.white,
                    border: `1.5px solid ${campType === t.id ? C.green : C.border}`,
                    borderRadius: 14, padding: "12px 14px", cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: campType === t.id ? C.mint : C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{t.desc}</div>
                  </div>
                  {campType === t.id && (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", flexShrink: 0 }}>✓</div>
                  )}
                </div>
              ))}
            </div>

            {/* Message */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.mid, marginBottom: 6 }}>Nachricht</div>
              <textarea
                value={campMsg}
                onChange={e => setCampMsg(e.target.value.slice(0, 120))}
                placeholder="z.B. Heute 2× Punkte auf alles – nur bis 22 Uhr! 🎉"
                rows={3}
                style={{
                  width: "100%", background: C.bg,
                  border: `1.5px solid ${campMsg.length > 0 ? C.green : C.border}`,
                  borderRadius: 14, padding: "13px 14px", fontSize: 14,
                  color: C.dark, outline: "none", resize: "none", fontFamily: "inherit",
                  transition: "border-color .15s",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 10, color: C.muted, marginTop: 4 }}>
                {campMsg.length}/120
              </div>
            </div>

            {campSent && <Alert type="success">✓ Kampagne wurde gespeichert und gesendet!</Alert>}
            <button
              onClick={sendCampaign}
              disabled={!campMsg.trim() || campLoading}
              style={{
                width: "100%", background: campMsg.trim() ? CARD_GRADIENT : C.border,
                color: campMsg.trim() ? "#fff" : C.muted, border: "none",
                borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700,
                cursor: campMsg.trim() ? "pointer" : "not-allowed",
                boxShadow: campMsg.trim() ? `0 6px 20px ${C.shadowLg}` : "none",
                transition: "all .2s",
              }}
            >
              {campLoading ? "Wird gesendet…" : "📤 Kampagne senden"}
            </button>

            {/* Past campaigns */}
            {campaigns.length > 0 && (
              <>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginTop: 24, marginBottom: 12 }}>Verlauf</div>
                {campaigns.map((c, i) => (
                  <Card key={c.id || i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 3 }}>{c.message}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{CAMP_TYPES.find(t => t.id === c.type)?.label}</div>
                      </div>
                      <div style={{ background: C.mintLight, color: C.green, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{c.status}</div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: C.dark }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
    </div>
  );
}
