import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, TrendingDown, Award, Users, RefreshCw,
  Euro, Gift, Zap, BarChart2, Calendar, Download,
  ChevronRight, Star, ArrowUpRight,
} from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";
import { MERCHANT_DEMO } from "../../data/demo";

const { yearly, kpis } = MERCHANT_DEMO;

const SECTIONS = ["Übersicht", "Wachstum", "Saisonal", "Kampagnen", "Insights"];

const SEASON_COLORS = (v) =>
  v >= 90 ? "#D95B1B" : v >= 75 ? "#D68A0C" : v >= 55 ? "#1A8272" : "#8A8F8C";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 20px rgba(15,61,62,.12)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ fontSize: 12, color: C.dark, fontWeight: 600 }}>
            {p.name}: <strong>{typeof p.value === "number" && p.value > 100 ? p.value.toLocaleString("de") : p.value}{p.unit || ""}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: C.dark, letterSpacing: -0.3 }}>{children}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function YearDelta({ value, prev, unit = "", invert = false }) {
  if (!prev) return null;
  const delta = ((value - prev) / prev * 100).toFixed(1);
  const positive = invert ? delta < 0 : delta > 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, background: positive ? C.mintLight : C.orangeLight, borderRadius: 99, padding: "2px 7px" }}>
      {positive ? <TrendingUp size={10} color={C.fresh} /> : <TrendingDown size={10} color={C.orange} />}
      <span style={{ fontSize: 10, fontWeight: 800, color: positive ? C.fresh : C.orange }}>
        {positive ? "+" : ""}{delta}%
      </span>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, prev, unit = "", color, bg, note }) {
  return (
    <div style={{ background: bg || C.white, borderRadius: 16, padding: "14px 14px", border: `1px solid ${color}18`, flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={color} />
        </div>
        {prev != null && <YearDelta value={value} prev={prev} unit={unit} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: -1, lineHeight: 1 }}>
        {typeof value === "number" && value >= 1000 ? value.toLocaleString("de") : value}
        {unit && <span style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.dark, marginTop: 4 }}>{label}</div>
      {note && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{note}</div>}
    </div>
  );
}

function HealthScore({ score, trend, factors }) {
  const arc = (pct) => {
    const r = 52;
    const circ = 2 * Math.PI * r;
    return { strokeDasharray: circ, strokeDashoffset: circ * (1 - pct / 100) };
  };
  const color = score >= 80 ? C.fresh : score >= 60 ? "#D68A0C" : C.orange;
  const label = score >= 80 ? "Exzellent" : score >= 65 ? "Gut" : "Ausbaufähig";

  return (
    <div style={{ background: CARD_GRADIENT, borderRadius: 20, padding: "20px", overflow: "hidden", position: "relative", marginBottom: 16 }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>JAHRES-HEALTH-SCORE 2025</div>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {/* Gauge */}
        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={10} />
            <motion.circle
              cx={60} cy={60} r={52} fill="none"
              stroke={color}
              strokeWidth={10}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={arc(score)}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: -1.5 }}>{score}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 700 }}>/100</div>
          </div>
        </div>

        {/* Factor breakdown */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{label}</div>
            <div style={{ background: `${color}30`, borderRadius: 99, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={10} color={color} />
              <span style={{ fontSize: 10, fontWeight: 800, color }}> +{trend} Pkt</span>
            </div>
          </div>
          {factors.map((f, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.55)", fontWeight: 600 }}>{f.icon} {f.label}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: f.score >= 80 ? "#7BDFAA" : f.score >= 65 ? "#FBBF24" : "#FC8181" }}>{f.score}</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,.08)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${f.score}%` }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                  style={{ height: 4, background: f.score >= 80 ? "#7BDFAA" : f.score >= 65 ? "#FBBF24" : "#FC8181", borderRadius: 99 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function YearlyIntelligence() {
  const [section, setSection] = useState("Übersicht");
  const [compareMode, setCompareMode] = useState(false);

  const { kpis: yk, monthly, quarterly, seasonal, campaign_history, loyalty_growth, ai_insights, health_score, health_trend, health_factors } = yearly;

  const currentMonths = monthly.filter(m => !m.prev_year);
  const prevMonths    = monthly.filter(m => m.prev_year);

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Section tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 20, paddingBottom: 2 }}>
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            style={{ flexShrink: 0, borderRadius: 99, padding: "7px 14px", fontSize: 12, fontWeight: 700, border: `1.5px solid ${section === s ? C.green : C.border}`, background: section === s ? C.green : C.white, color: section === s ? "#fff" : C.muted, cursor: "pointer", transition: "all .15s" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── ÜBERSICHT ── */}
      {section === "Übersicht" && (
        <>
          <HealthScore score={health_score} trend={health_trend} factors={health_factors} />

          <SectionTitle sub="Jahresvergleich 2024 → 2025">Jahres-KPIs</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <KpiCard icon={Users}     label="Gäste gesamt"      value={yk.total_guests.value}       prev={yk.total_guests.prev}       color={C.teal}   />
            <KpiCard icon={RefreshCw} label="Stammgäste"        value={yk.repeat_guests.value}      prev={yk.repeat_guests.prev}      color={C.fresh}  />
            <KpiCard icon={Euro}      label="spotloop Umsatz"   value={yk.revenue_influenced.value} prev={yk.revenue_influenced.prev} unit="€" color={C.green}  />
            <KpiCard icon={TrendingUp} label="Umsatzwachstum"   value={`+${yk.revenue_growth.value}%`} color={C.purple} note="vs. Vorjahr" />
            <KpiCard icon={Gift}      label="Reward-Einlösungen" value={yk.reward_redemptions.value} prev={yk.reward_redemptions.prev} color={C.orange}  />
            <KpiCard icon={Star}      label="Follower gesamt"   value={yk.followers_total.value}    prev={yk.followers_total.prev}    color={C.gold}   />
            <KpiCard icon={Zap}       label="Reaktivierungen"   value={yk.inactive_recovered.value} prev={yk.inactive_recovered.prev} color="#6355C7"  />
            <KpiCard icon={Award}     label="Ø Lifetime Value"  value={yk.avg_ltv.value}            prev={yk.avg_ltv.prev}            unit="€" color="#1A5C8A" />
          </div>

          {/* Quarterly comparison */}
          <SectionTitle sub="Quartal-für-Quartal Vergleich">Quartalsübersicht</SectionTitle>
          <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16 }}>
            {quarterly.slice(0, 4).map((q, i) => {
              const isCurrentYear = q.q.includes("2025");
              return (
                <div key={i} style={{ padding: "13px 16px", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", background: isCurrentYear ? C.mintLight : C.white }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: isCurrentYear ? C.green : C.dark }}>{q.label}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{q.campaigns} Kampagnen</div>
                    </div>
                    {isCurrentYear && <div style={{ background: C.green, color: "#fff", borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 800 }}>AKTUELL</div>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Gäste",     val: q.guests.toLocaleString("de"),  color: C.teal },
                      { label: "Stammgäste", val: q.repeat.toLocaleString("de"), color: C.fresh },
                      { label: "Umsatz",    val: `${(q.revenue/1000).toFixed(1)}k €`, color: C.green },
                    ].map((m, j) => (
                      <div key={j} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: m.color }}>{m.val}</div>
                        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── WACHSTUM ── */}
      {section === "Wachstum" && (
        <>
          <SectionTitle sub="Monatliche Umsatzentwicklung 2025">Umsatz-Entwicklung</SectionTitle>
          <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "16px 12px 8px", marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={currentMonths} margin={{ left: -20, right: 4 }}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.green} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Umsatz (€)" stroke={C.green} fill="url(#gradRev)" strokeWidth={2.5} dot={{ fill: C.green, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <SectionTitle sub="Follower, Aktive & Stammgäste im Jahresverlauf">Loyalitäts-Wachstum</SectionTitle>
          <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "16px 12px 8px", marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={loyalty_growth} margin={{ left: -20, right: 4 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="followers" name="Follower" stroke={C.teal}   strokeWidth={2} dot={{ fill: C.teal, r: 3 }} />
                <Line type="monotone" dataKey="active"    name="Aktiv"    stroke={C.fresh}  strokeWidth={2} dot={{ fill: C.fresh, r: 3 }} />
                <Line type="monotone" dataKey="returning" name="Stammgäste" stroke={C.orange} strokeWidth={2} dot={{ fill: C.orange, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
              {[["Follower", C.teal], ["Aktiv", C.fresh], ["Stammgäste", C.orange]].map(([l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 3, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <SectionTitle sub="Neue Mitglieder pro Monat">Mitglieder-Wachstum</SectionTitle>
          <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "16px 12px 8px", marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={currentMonths} margin={{ left: -20, right: 4 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="followers" name="Follower" fill={C.fresh} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ── SAISONAL ── */}
      {section === "Saisonal" && (
        <>
          <SectionTitle sub="Gäste-Intensität nach Monat">Saisonales Muster</SectionTitle>

          {/* Heatmap */}
          <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {seasonal.map((s, i) => {
                const c = SEASON_COLORS(s.intensity);
                return (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{
                      height: 52, borderRadius: 10,
                      background: `${c}${Math.round((s.intensity / 100) * 255).toString(16).padStart(2, "0")}`,
                      border: `1px solid ${c}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 4,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: s.intensity > 70 ? "#fff" : C.dark }}>{s.intensity}</span>
                    </div>
                    <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{s.month}</div>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
              {[["Ruhig", "#8A8F8C"], ["Mittel", "#1A8272"], ["Stark", "#D68A0C"], ["Hochsaison", "#D95B1B"]].map(([l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peak summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Stärkster Monat",   val: "Juli",   sub: "98 Intensität",  color: C.orange,  bg: C.orangeLight },
              { label: "Sommerpeak",        val: "Jun–Aug", sub: "+42% Besuche",  color: C.teal,    bg: "#DDF0F5" },
              { label: "Wintertief",        val: "Januar",  sub: "42 Intensität", color: C.muted,   bg: C.bg },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "12px 10px", textAlign: "center", border: `1px solid ${s.color}20` }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.val}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.dark }}>{s.label}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <SectionTitle>Saisonale Empfehlungen</SectionTitle>
          {[
            { month: "Jun–Aug", action: "Terrassen-Kampagne + Doppelpunkte auf Kaltgetränke", icon: "☀️" },
            { month: "Sep–Okt", action: "Herbst-Saisonkarte + Comeback-Reward für Inaktive", icon: "🍂" },
            { month: "Nov–Jan", action: "Weihnachts-Reward + Win-Back für Jahresschwäche",   icon: "❄️" },
            { month: "Feb–Mär", action: "Frühjahrs-Bonus zur Wachstumsphase starten",         icon: "🌸" },
          ].map((r, i) => (
            <div key={i} style={{ background: C.white, borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.green, marginBottom: 2 }}>{r.month}</div>
                <div style={{ fontSize: 12, color: C.dark, lineHeight: 1.5 }}>{r.action}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── KAMPAGNEN ── */}
      {section === "Kampagnen" && (
        <>
          <SectionTitle sub="ROI und Wirkung aller Kampagnen seit Start">Kampagnen-Historie</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {campaign_history.map((c, i) => {
              const roiColor = c.roi === null ? C.muted : c.roi >= 250 ? C.fresh : c.roi >= 150 ? "#D68A0C" : C.orange;
              const typeEmoji = { bonus: "⚡", seasonal: "🌿", win_back: "🔄" }[c.type] || "📢";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 2px 10px ${C.shadow}` }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {typeEmoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{c.period}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: roiColor }}>
                        {c.roi !== null ? `${c.roi}% ROI` : "läuft"}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted }}>{c.visits} Besuche</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: C.bg }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: c.roi !== null ? `${Math.min(c.roi / 4, 100)}%` : "20%" }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.8, ease: "easeOut" }}
                      style={{ height: 4, background: roiColor, borderRadius: "0 4px 4px 0" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Campaign summary stats */}
          <div style={{ background: CARD_GRADIENT, borderRadius: 18, padding: "18px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.4)", letterSpacing: 2, marginBottom: 14 }}>JAHRES-KAMPAGNEN ZUSAMMENFASSUNG</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { val: yk.campaigns_run.value,      label: "Kampagnen gestartet" },
                { val: campaign_history.reduce((a, c) => a + c.visits, 0), label: "Besuche generiert" },
                { val: `Ø ${(campaign_history.filter(c => c.roi).reduce((a, c) => a + c.roi, 0) / campaign_history.filter(c => c.roi).length).toFixed(0)}%`, label: "Ø ROI" },
                { val: `${yk.inactive_recovered.value}`, label: "Inaktive reaktiviert" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.07)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── INSIGHTS ── */}
      {section === "Insights" && (
        <>
          <SectionTitle sub="KI-gestützte Erkenntnisse aus deinen Jahresdaten">Strategische Empfehlungen</SectionTitle>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {ai_insights.map((ins, i) => {
              const typeConfig = {
                win:      { bg: C.mintLight,    border: `${C.fresh}30`,   text: C.green },
                tip:      { bg: C.goldLight,     border: "#D68A0C30",      text: "#B8860B" },
                seasonal: { bg: "#DDF0F5",       border: "#1A5C8A30",      text: "#1A5C8A" },
                insight:  { bg: C.purpleLight,   border: "#6355C730",      text: "#6355C7" },
                warning:  { bg: C.orangeLight,   border: `${C.orange}30`,  text: C.orange },
              }[ins.type] || { bg: C.bg, border: C.border, text: C.dark };

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{ background: typeConfig.bg, border: `1px solid ${typeConfig.border}`, borderRadius: 16, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{ins.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: typeConfig.text, fontWeight: 600, lineHeight: 1.55 }}>{ins.text}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Export section */}
          <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "16px", boxShadow: `0 2px 10px ${C.shadow}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Jahresbericht exportieren</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.55 }}>
              Lade eine vollständige PDF-Zusammenfassung herunter — bereit für Steuerberater, Investoren oder interne Planung.
            </div>
            {[
              { icon: "📄", label: "Jahresbericht 2025 (PDF)",       sub: "KPIs · Kampagnen · Insights · Prognose" },
              { icon: "📊", label: "Kampagnen-ROI Übersicht (CSV)",  sub: "Alle Kampagnen mit Kosten und Ertrag" },
              { icon: "📈", label: "Loyalitätsbericht (PDF)",        sub: "Follower · Stammgäste · Retention" },
            ].map((r, i) => (
              <button
                key={i}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", marginBottom: i < 2 ? 8 : 0 }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{r.sub}</div>
                </div>
                <Download size={16} color={C.muted} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
