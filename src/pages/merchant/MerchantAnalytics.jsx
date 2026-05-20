import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Star, Zap, Euro, Target,
  Gift, BarChart2, Calendar, ChevronRight, ChevronDown,
  ArrowUpRight, ArrowDownRight, Plus, Play, Pause, X,
  Award, Clock, RefreshCw, UserCheck, UserX, Flame, Sparkles,
} from "lucide-react";
import { MERCHANT_DEMO } from "../../data/demo";

const { kpis, weekly_visits, monthly_revenue, guest_segments, top_rewards, campaigns, insights, hourly_heatmap } = MERCHANT_DEMO;

const C = {
  bg: "#F7F9FF",
  white: "#FFFFFF",
  dark: "#0A1628",
  green: "#0A1628",
  fresh: "#1B4FD8",
  mint: "#BAE6FD",
  mintLight: "#EFF6FF",
  teal: "#0EA5E9",
  tealLight: "#E0F2FE",
  orange: "#F97316",
  orangeLight: "#FFF7ED",
  gold: "#F59E0B",
  goldLight: "#FFFBEB",
  purple: "#6366F1",
  purpleLight: "#EEF2FF",
  muted: "#64748B",
  border: "#E2E8F5",
  shadow: "rgba(10,22,40,.06)",
  shadowMd: "rgba(10,22,40,.10)",
};

const TABS = ["Übersicht", "Gäste", "Kampagnen", "Einblicke"];

const GRADIENT = "linear-gradient(145deg, #0A1628 0%, #1B4FD8 55%, #0EA5E9 100%)";

function fmt(v, unit = "") {
  if (unit === "€") return `${v.toLocaleString("de")} €`;
  if (unit === "%") return `${v}%`;
  return v.toLocaleString("de");
}

function Trend({ change, pct, small }) {
  if (change === 0) return null;
  const up = change > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const color = up ? C.fresh : C.orange;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, color }}>
      <Icon size={small ? 12 : 14} strokeWidth={2.5} />
      <span style={{ fontSize: small ? 10 : 11, fontWeight: 700 }}>
        {pct !== undefined ? `${Math.abs(pct)}%` : (up ? "+" : "") + change}
      </span>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, unit, change, change_pct, color = C.teal, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: C.white, borderRadius: 18, padding: "16px",
        border: `1px solid ${C.border}`,
        boxShadow: `0 2px 12px ${C.shadow}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} strokeWidth={2} />
        </div>
        <Trend change={change} pct={change_pct} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: C.dark, letterSpacing: -1, lineHeight: 1.1 }}>
        {unit === "€" ? `${value.toLocaleString("de")} €` : unit === "%" ? `${value}%` : value.toLocaleString("de")}
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 2, opacity: 0.7 }}>{sub}</div>}
    </motion.div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>{children}</div>
      {action && <div style={{ fontSize: 12, color: C.teal, fontWeight: 700, cursor: "pointer" }}>{action}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", boxShadow: `0 8px 24px ${C.shadowMd}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, fontWeight: 600, color: p.color, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div>
      {/* KPI Grid */}
      <SectionTitle action="Details">Wichtigste Kennzahlen</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <KpiCard icon={Users} label="Stammgäste" value={kpis.repeat_customers.value} change={kpis.repeat_customers.change} change_pct={kpis.repeat_customers.change_pct} color={C.teal} />
        <KpiCard icon={UserCheck} label="Neue Gäste" value={kpis.new_guests.value} change={kpis.new_guests.change} change_pct={kpis.new_guests.change_pct} color={C.fresh} />
        <KpiCard icon={RefreshCw} label="Wiederkehrquote" value={kpis.repeat_visit_rate.value} unit="%" change={kpis.repeat_visit_rate.change} color={C.purple} />
        <KpiCard icon={Star} label="Wallet-Follower" value={kpis.wallet_followers.value} change={kpis.wallet_followers.change} change_pct={kpis.wallet_followers.change_pct} color={C.gold} />
        <KpiCard icon={Euro} label="Umsatz durch spotloop" value={kpis.revenue_from_myspot.value} unit="€" change={kpis.revenue_from_myspot.change} change_pct={kpis.revenue_from_myspot.change_pct} color={C.green} />
        <KpiCard icon={Zap} label="Aktivierte Besuche" value={kpis.activated_visits.value} change={kpis.activated_visits.change} change_pct={kpis.activated_visits.change_pct} color={C.orange} />
      </div>

      {/* Weekly visits chart */}
      <SectionTitle>Besuche diese Woche</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekly_visits} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${C.teal}08` }} />
            <Bar dataKey="organic" name="Organisch" stackId="a" fill={C.teal} radius={[0,0,0,0]} />
            <Bar dataKey="activated" name="Aktiviert" stackId="a" fill={C.fresh} radius={[0,0,0,0]} />
            <Bar dataKey="new" name="Neu" stackId="a" fill={`${C.gold}`} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
          {[["Organisch", C.teal], ["Aktiviert", C.fresh], ["Neu", C.gold]].map(([label, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Revenue trend */}
      <SectionTitle>Umsatz-Entwicklung</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthly_revenue}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.teal} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMyspot" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.fresh} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.fresh} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" name="Gesamt (€)" stroke={C.teal} fill="url(#gradTotal)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="myspot" name="spotloop (€)" stroke={C.fresh} fill="url(#gradMyspot)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Organic vs Activated */}
      <SectionTitle>Organisch vs. Aktiviert</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: C.tealLight, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.teal, letterSpacing: -0.5 }}>169</div>
            <div style={{ fontSize: 10, color: C.teal, fontWeight: 700, marginTop: 2, opacity: 0.8 }}>Organisch</div>
          </div>
          <div style={{ flex: 1, background: C.mintLight, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.green, letterSpacing: -0.5 }}>143</div>
            <div style={{ fontSize: 10, color: C.fresh, fontWeight: 700, marginTop: 2, opacity: 0.8 }}>Aktiviert</div>
          </div>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: "54%", background: C.teal, borderRadius: "99px 0 0 99px" }} />
            <div style={{ width: "46%", background: C.fresh, borderRadius: "0 99px 99px 0" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: C.muted }}>54% organisch</span>
          <span style={{ fontSize: 10, color: C.muted }}>46% aktiviert</span>
        </div>
      </div>

      {/* Retention cards */}
      <SectionTitle>Kundenbindung</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "30-Tage", val: kpis.retention_30d.value, color: C.fresh },
          { label: "60-Tage", val: kpis.retention_60d.value, color: C.teal },
          { label: "90-Tage", val: kpis.retention_90d.value, color: C.purple },
        ].map(r => (
          <div key={r.label} style={{ background: C.white, borderRadius: 14, padding: "14px 10px", border: `1px solid ${C.border}`, textAlign: "center", boxShadow: `0 2px 8px ${C.shadow}` }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: r.color, letterSpacing: -1 }}>{r.val}%</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>Retention</div>
            <div style={{ fontSize: 10, color: C.muted, opacity: 0.7 }}>{r.label}</div>
          </div>
        ))}
      </div>

      {/* Avg spend comparison */}
      <SectionTitle>Ø Ausgabe pro Besuch</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        {[
          { label: "Stammgäste", val: 8.40, color: C.green, width: "100%" },
          { label: "Neugäste", val: 5.90, color: C.teal, width: "70%" },
          { label: "Ø Gesamt", val: 7.20, color: C.muted, width: "86%" },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: s.color }}>{s.val.toFixed(2)} €</span>
            </div>
            <div style={{ height: 6, background: C.border, borderRadius: 99 }}>
              <div style={{ height: "100%", width: s.width, background: s.color, borderRadius: 99, transition: "width .6s ease" }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 10, background: C.mintLight, borderRadius: 10, padding: "10px 12px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>💡 Stammgäste geben 42% mehr aus als Neugäste.</span>
        </div>
      </div>

      {/* Win-back */}
      <SectionTitle>Rückgewinnungspotenzial</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: `${C.orange}10`, borderRadius: 12, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.orange }}>45</div>
            <div style={{ fontSize: 10, color: C.orange, fontWeight: 700 }}>Inaktiv 30d</div>
          </div>
          <div style={{ flex: 1, background: `${C.gold}10`, borderRadius: 12, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.gold }}>28</div>
            <div style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>Inaktiv 60d</div>
          </div>
          <div style={{ flex: 1, background: C.tealLight, borderRadius: 12, padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.teal }}>73</div>
            <div style={{ fontSize: 10, color: C.teal, fontWeight: 700 }}>Erreichbar</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GUESTS TAB ────────────────────────────────────────────────────────────────
function GuestsTab() {
  const [activeSegment, setActiveSegment] = useState(null);

  return (
    <div>
      <SectionTitle>Gästesegmente</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={guest_segments} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" paddingAngle={3}>
              {guest_segments.map((seg, i) => (
                <Cell key={seg.name} fill={seg.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip formatter={(val, name) => [val, name]} contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}` }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {guest_segments.map(seg => (
            <div key={seg.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.dark, flex: 1 }}>{seg.name}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{seg.count}</span>
              <span style={{ fontSize: 11, color: C.muted, width: 30, textAlign: "right" }}>{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet connection */}
      <SectionTitle>Wallet-Verbindung</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        {[
          { label: "Aktive Karten", val: 187, icon: "💳", color: C.teal },
          { label: "Follower", val: 234, icon: "⭐", color: C.gold },
          { label: "Eingelöste Rewards", val: 67, icon: "🎁", color: C.orange },
          { label: "Loyalitätsmitglieder", val: 187, icon: "👑", color: C.purple },
        ].map((r, i) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${r.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{r.icon}</div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.dark }}>{r.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: r.color }}>{r.val}</div>
          </div>
        ))}
      </div>

      {/* Busy hours heatmap */}
      <SectionTitle>Stoßzeiten-Analyse</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "3px" }}>
            <thead>
              <tr>
                <th style={{ fontSize: 10, color: C.muted, fontWeight: 600, textAlign: "left", paddingBottom: 6, width: 36 }}>Zeit</th>
                {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
                  <th key={d} style={{ fontSize: 10, color: C.muted, fontWeight: 600, textAlign: "center", paddingBottom: 6 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hourly_heatmap.map(row => (
                <tr key={row.hour}>
                  <td style={{ fontSize: 10, color: C.muted, fontWeight: 600, paddingRight: 4 }}>{row.hour}</td>
                  {["mo","di","mi","do","fr","sa","so"].map(d => {
                    const val = row[d];
                    const intensity = Math.min(val / 44, 1);
                    const bg = `rgba(27, 108, 168, ${0.08 + intensity * 0.85})`;
                    return (
                      <td key={d} style={{ width: 28, height: 22, borderRadius: 5, background: bg, textAlign: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: intensity > 0.5 ? "#fff" : C.teal }}>{val}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: C.muted, textAlign: "center" }}>Besuche pro Stunde · dunkler = mehr Besuche</div>
      </div>

      {/* Reward performance */}
      <SectionTitle>Reward-Profitabilität</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        {top_rewards.map((r, i) => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < top_rewards.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: r.profitable ? C.mintLight : `${C.orange}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {r.profitable ? "✅" : "⚠️"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{r.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{r.redeemed}× eingelöst</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: r.revenue_impact > 0 ? C.fresh : C.orange }}>
                {r.revenue_impact > 0 ? "+" : ""}{r.revenue_impact} €
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>Umsatzimpact</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CAMPAIGNS TAB ─────────────────────────────────────────────────────────────
const CAMPAIGN_TYPES = [
  { id: "bonus_points", icon: "⚡", label: "Bonuspunkte", desc: "Doppelte Punkte in einem Zeitraum", color: C.gold },
  { id: "win_back", icon: "💌", label: "Win-Back", desc: "Inaktive Gäste zurückgewinnen", color: C.orange },
  { id: "discount", icon: "🏷️", label: "Rabatt", desc: "Prozentualer Nachlass für Segmente", color: C.purple },
  { id: "happy_hour", icon: "🕐", label: "Happy Hour", desc: "Sonderaktionen zu bestimmten Zeiten", color: C.teal },
  { id: "loyalty_bonus", icon: "👑", label: "Treuebonus", desc: "Extra-Rewards für Stammgäste", color: C.fresh },
];

const TARGET_OPTIONS = [
  { id: "all", label: "Alle Gäste", count: 312 },
  { id: "inactive_30d", label: "Inaktiv 30 Tage", count: 45 },
  { id: "inactive_60d", label: "Inaktiv 60 Tage", count: 28 },
  { id: "stammgaeste", label: "Stammgäste", count: 142 },
  { id: "new", label: "Neue Gäste", count: 89 },
];

function CampaignsTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ type: null, title: "", target: "all", reward: "", estimate: null });

  const selectedType = CAMPAIGN_TYPES.find(t => t.id === form.type);
  const selectedTarget = TARGET_OPTIONS.find(t => t.id === form.target);
  const estimatedReach = selectedTarget?.count || 0;
  const estimatedVisits = Math.round(estimatedReach * 0.38);
  const estimatedRevenue = estimatedVisits * 7.2;

  const statusColor = (s) => ({ active: C.fresh, completed: C.teal, draft: C.muted }[s] || C.muted);
  const statusLabel = (s) => ({ active: "Aktiv", completed: "Abgeschlossen", draft: "Entwurf" }[s] || s);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>Kampagnen</div>
        <button
          onClick={() => { setShowCreate(true); setStep(0); }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: GRADIENT, color: "#fff", border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          <Plus size={14} /> Neue Kampagne
        </button>
      </div>

      {/* Active campaigns */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {campaigns.map(c => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: C.white, borderRadius: 18, border: `1.5px solid ${c.status === "active" ? `${C.fresh}40` : C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, overflow: "hidden" }}
          >
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {c.start} – {c.end} · {TARGET_OPTIONS.find(t => t.id === c.target)?.label}
                  </div>
                </div>
                <div style={{ background: `${statusColor(c.status)}15`, color: statusColor(c.status), borderRadius: 99, padding: "3px 10px", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                  {statusLabel(c.status)}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div style={{ background: C.bg, borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.dark }}>{c.reach}</div>
                  <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Erreicht</div>
                </div>
                <div style={{ background: C.bg, borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.fresh }}>{c.visits_generated}</div>
                  <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Besuche</div>
                </div>
                <div style={{ background: C.bg, borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.green }}>{c.revenue} €</div>
                  <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Umsatz</div>
                </div>
              </div>
              {c.roi && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, background: C.mintLight, borderRadius: 10, padding: "8px 12px" }}>
                  <TrendingUp size={14} color={C.fresh} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>ROI: {c.roi}% · Nettogewinn: {c.revenue - c.cost} €</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Campaign creation modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              style={{ background: C.white, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 390, maxHeight: "85vh", overflowY: "auto", padding: "8px 0 0" }}
            >
              {/* Handle */}
              <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: "0 auto 16px" }} />
              <div style={{ padding: "0 20px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>
                    {step === 0 ? "Kampagnentyp" : step === 1 ? "Einstellungen" : "Vorschau & Start"}
                  </div>
                  <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Step indicator */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? GRADIENT : C.border, transition: "background .3s" }} />
                  ))}
                </div>

                {step === 0 && (
                  <div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Welche Art von Kampagne möchtest du starten?</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {CAMPAIGN_TYPES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setForm(f => ({ ...f, type: t.id })); setStep(1); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            background: form.type === t.id ? `${t.color}10` : C.bg,
                            border: `1.5px solid ${form.type === t.id ? t.color : C.border}`,
                            borderRadius: 14, padding: "14px", cursor: "pointer", textAlign: "left",
                          }}
                        >
                          <div style={{ fontSize: 24, width: 44, height: 44, borderRadius: 12, background: `${t.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {t.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{t.label}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{t.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>KAMPAGNENTITEL</label>
                      <input
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder={selectedType ? `z.B. "${selectedType.label} – ${MERCHANT_DEMO.spot.name}"` : "Kampagnentitel"}
                        style={{ width: "100%", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 14, color: C.dark, outline: "none", fontFamily: "inherit" }}
                      />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>REWARD / ANGEBOT</label>
                      <input
                        value={form.reward}
                        onChange={e => setForm(f => ({ ...f, reward: e.target.value }))}
                        placeholder='z.B. "Gratis Espresso" oder "Doppelte Punkte"'
                        style={{ width: "100%", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 14, color: C.dark, outline: "none", fontFamily: "inherit" }}
                      />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8 }}>ZIELGRUPPE</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {TARGET_OPTIONS.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setForm(f => ({ ...f, target: t.id }))}
                            style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              background: form.target === t.id ? C.mintLight : C.bg,
                              border: `1.5px solid ${form.target === t.id ? C.fresh : C.border}`,
                              borderRadius: 12, padding: "10px 14px", cursor: "pointer",
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{t.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 800, color: form.target === t.id ? C.fresh : C.muted }}>{t.count} Gäste</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!form.title || !form.reward}
                      style={{ width: "100%", background: form.title && form.reward ? GRADIENT : C.border, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, cursor: form.title && form.reward ? "pointer" : "not-allowed" }}
                    >
                      Weiter →
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <div style={{ background: C.bg, borderRadius: 16, padding: "16px", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ fontSize: 28 }}>{selectedType?.icon}</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{form.title || "Neue Kampagne"}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{selectedType?.label} · {selectedTarget?.label}</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        <div style={{ background: C.white, borderRadius: 10, padding: "10px", textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: C.teal }}>{estimatedReach}</div>
                          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Erreichbar</div>
                        </div>
                        <div style={{ background: C.white, borderRadius: 10, padding: "10px", textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: C.fresh }}>~{estimatedVisits}</div>
                          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Est. Besuche</div>
                        </div>
                        <div style={{ background: C.white, borderRadius: 10, padding: "10px", textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: C.green }}>~{Math.round(estimatedRevenue)} €</div>
                          <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Est. Umsatz</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: C.mintLight, borderRadius: 12, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 10 }}>
                      <Sparkles size={16} color={C.fresh} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: C.green, fontWeight: 600, lineHeight: 1.5 }}>
                        Ähnliche Kampagnen erzielen bei {MERCHANT_DEMO.spot.name} durchschnittlich {Math.round(estimatedVisits * 0.7)} Besuche in den ersten 7 Tagen.
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCreate(false)}
                      style={{ width: "100%", background: GRADIENT, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      <Play size={16} /> Kampagne starten
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      style={{ width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 10, padding: 8 }}
                    >
                      ← Zurück
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── INSIGHTS TAB ──────────────────────────────────────────────────────────────
function InsightsTab() {
  const typeStyle = {
    positive: { bg: C.mintLight, border: `${C.fresh}30`, icon: "✅" },
    tip: { bg: C.tealLight, border: `${C.teal}30`, icon: "💡" },
    warning: { bg: C.orangeLight, border: `${C.orange}30`, icon: "⚠️" },
    neutral: { bg: C.bg, border: C.border, icon: "ℹ️" },
  };

  return (
    <div>
      <SectionTitle>KI-gestützte Einblicke</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {insights.map((ins, i) => {
          const style = typeStyle[ins.type] || typeStyle.neutral;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}
            >
              <div style={{ fontSize: 20, flexShrink: 0 }}>{ins.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, lineHeight: 1.5 }}>{ins.text}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Best campaign times */}
      <SectionTitle>Beste Kampagnenzeiten</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 24 }}>
        {[
          { label: "Stärkster Tag", value: "Freitag", sub: "68% mehr Aktivierungen", icon: "🔥", color: C.orange },
          { label: "Beste Zeit", value: "14 – 16 Uhr", sub: "Happy Hour Peak", icon: "⏰", color: C.teal },
          { label: "Ruhigste Zeit", value: "Di, 11 – 12 Uhr", sub: "Win-Back ideal", icon: "💤", color: C.purple },
        ].map((r, i) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${r.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{r.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{r.value}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{r.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CLV */}
      <SectionTitle>Customer Lifetime Value</SectionTitle>
      <div style={{ background: GRADIENT, borderRadius: 18, padding: "20px", marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>DURCHSCHNITTLICHER CUSTOMER LIFETIME VALUE</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: -2, marginBottom: 4 }}>142 €</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Loyalitätsmitglieder · +18 € seit letztem Monat</div>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          {[["Neugäste", "38 €"], ["Rückkehrer", "89 €"], ["Stammgäste", "142 €"]].map(([label, val]) => (
            <div key={label} style={{ flex: 1, background: "rgba(255,255,255,.08)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{val}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.5)", fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff impact */}
      <SectionTitle>Betriebliche Effizienz</SectionTitle>
      <div style={{ background: C.white, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 12px ${C.shadow}`, marginBottom: 16 }}>
        {[
          { label: "Ø QR-Scan Zeit", value: "4.2 Sek", good: true },
          { label: "Reward-Einlöserate", value: "89%", good: true },
          { label: "Manuelle Stempel", value: "11%", good: false },
          { label: "Auto-Zahlung Nutzung", value: "34%", good: true },
        ].map((s, i) => (
          <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ fontSize: 13, color: C.dark, fontWeight: 500 }}>{s.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: s.good ? C.fresh : C.orange }}>{s.value}</span>
              <span style={{ fontSize: 14 }}>{s.good ? "✅" : "⚠️"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MerchantAnalytics({ onBack }) {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState("7d");

  return (
    <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: GRADIENT, padding: "52px 20px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(19,176,92,.06)", pointerEvents: "none" }} />

        {/* Back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, position: "relative" }}>
          {onBack && (
            <button onClick={onBack} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
              ‹
            </button>
          )}
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>Analytics</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{MERCHANT_DEMO.spot.name}</div>
          </div>
          {/* Date range selector */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {["7d","30d","90d"].map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                style={{
                  background: dateRange === r ? "rgba(255,255,255,.15)" : "transparent",
                  border: `1px solid ${dateRange === r ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.1)"}`,
                  color: dateRange === r ? "#fff" : "rgba(255,255,255,.5)",
                  borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Quick KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16, position: "relative" }}>
          {[
            { val: `${kpis.revenue_from_myspot.value.toLocaleString("de")} €`, label: "spotloop Umsatz", change: `+${kpis.revenue_from_myspot.change_pct}%` },
            { val: kpis.repeat_customers.value, label: "Stammgäste", change: `+${kpis.repeat_customers.change_pct}%` },
            { val: `${kpis.repeat_visit_rate.value}%`, label: "Wiederkehrquote", change: `+${kpis.repeat_visit_rate.change}%p` },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "#7BDFAA", fontWeight: 700, marginTop: 2 }}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,.08)", position: "relative" }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                flex: 1, background: "none", border: "none", cursor: "pointer",
                padding: "10px 4px 12px",
                fontSize: 12, fontWeight: activeTab === i ? 800 : 500,
                color: activeTab === i ? "#fff" : "rgba(255,255,255,.4)",
                position: "relative",
              }}
            >
              {tab}
              {activeTab === i && (
                <motion.div
                  layoutId="tab-indicator"
                  style={{ position: "absolute", bottom: 0, left: "10%", width: "80%", height: 2, background: C.fresh, borderRadius: 1 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 92px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 0 && <OverviewTab />}
            {activeTab === 1 && <GuestsTab />}
            {activeTab === 2 && <CampaignsTab />}
            {activeTab === 3 && <InsightsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
