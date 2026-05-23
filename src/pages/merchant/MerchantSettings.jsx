import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp, Euro, Users, Gift, Shield, Settings,
  AlertTriangle, Check, ChevronRight, Plus, Minus, Info, LogOut,
} from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";
import {
  HeaderShell,
  HeaderBackButton,
  HeaderEyebrow,
  HeaderTitle,
  HeaderSubtitle,
} from "../../components/merchant/merchantHeader";
import { MerchantTrustBanner, PrivacyNote, Toggle } from "../../components/trust";
import SpotloopPricing from "../../components/merchant/SpotloopPricing";
import { useAuth } from "../../context/AuthContext";
import { isAppAdminAccess } from "../../lib/admin";
import { MERCHANT_DEMO } from "../../data/demo";

const { kpis } = MERCHANT_DEMO;

// ── Monthly Value Summary ─────────────────────────────────────────────────────
export function MonthlyValueSummary() {
  const items = [
    { icon: "🔄", label: "Wiederkehrende Gäste", value: "—", sub: "nach Scan, Reward oder Kampagne", color: C.fresh },
    { icon: "🎁", label: "Reward-Rückkehr", value: "—", sub: "Gäste mit eingelöstem Reward", color: C.orange },
    { icon: "📣", label: "Kampagnen-Rückkehr", value: "—", sub: "nach Push-Nachricht", color: C.blue },
  ];

  return (
    <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 2px 10px rgba(6,13,8,.06)`, marginBottom: 16 }}>
      <div style={{ background: CARD_GRADIENT, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", letterSpacing: 2, fontWeight: 700, marginBottom: 3 }}>WIEDERKEHR</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Sichtbare Kundenbindung</div>
      </div>
      <div style={{ padding: "0 16px" }}>
        {items.map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${item.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{item.label}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "12px 16px", background: C.mintLight, borderTop: `1px solid ${C.fresh}20` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.green, lineHeight: 1.5 }}>
          Spotloop zeigt sichtbare Wiederkehr und Kundenbindung — keine garantierten Umsätze.
        </span>
      </div>
    </div>
  );
}

// ── Reward Cost Controls ──────────────────────────────────────────────────────
export function RewardCostControls() {
  const [limits, setLimits] = useState({
    max_redemptions_day: 20,
    max_redemptions_week: 80,
    campaign_budget: 200,
    min_visit_gap_hours: 2,
    new_guest_only: false,
    low_traffic_only: false,
    happy_hour_only: false,
  });

  const adj = (key, delta, min = 0, max = 9999) =>
    setLimits(l => ({ ...l, [key]: Math.max(min, Math.min(max, l[key] + delta)) }));

  return (
    <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 2px 10px rgba(6,13,8,.06)`, marginBottom: 16 }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <Settings size={16} color={C.green} />
        <span style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Reward-Budgetkontrolle</span>
      </div>
      <div style={{ padding: "0 16px" }}>
        <NumberRow
          label="Max. Einlösungen / Tag"
          sub="Tages-Reward-Cap"
          value={limits.max_redemptions_day}
          onMinus={() => adj("max_redemptions_day", -5, 1)}
          onPlus={() => adj("max_redemptions_day", 5, 1, 200)}
        />
        <NumberRow
          label="Max. Einlösungen / Woche"
          sub="Wochen-Cap"
          value={limits.max_redemptions_week}
          onMinus={() => adj("max_redemptions_week", -10, 1)}
          onPlus={() => adj("max_redemptions_week", 10, 1, 500)}
        />
        <NumberRow
          label="Kampagnen-Budget"
          sub="Euro pro Monat"
          value={`${limits.campaign_budget} €`}
          onMinus={() => adj("campaign_budget", -25, 25)}
          onPlus={() => adj("campaign_budget", 25, 25, 2000)}
        />
        <NumberRow
          label="Check-in Mindestabstand"
          sub="Stunden zwischen Scans"
          value={`${limits.min_visit_gap_hours}h`}
          onMinus={() => adj("min_visit_gap_hours", -1, 1)}
          onPlus={() => adj("min_visit_gap_hours", 1, 1, 24)}
          last
        />
      </div>
      <div style={{ padding: "0 16px 4px", borderTop: `1px solid ${C.border}` }}>
        <ToggleRow
          label="Nur Neugäste"
          sub="Reward nur für erste Besuche"
          value={limits.new_guest_only}
          onChange={(v) => setLimits(l => ({ ...l, new_guest_only: v }))}
        />
        <ToggleRow
          label="Nur Schwachlastzeiten"
          sub="Aktiv Di–Do 14–17 Uhr"
          value={limits.low_traffic_only}
          onChange={(v) => setLimits(l => ({ ...l, low_traffic_only: v }))}
        />
        <ToggleRow
          label="Nur Happy Hour"
          sub="Aktivierbar zu definierten Zeiten"
          value={limits.happy_hour_only}
          onChange={(v) => setLimits(l => ({ ...l, happy_hour_only: v }))}
          last
        />
      </div>
      {/* Profitability preview */}
      <div style={{ padding: "12px 16px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, marginBottom: 8 }}>GESCHÄTZTE MONATLICHE KOSTEN</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: C.white, borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.orange }}>{limits.max_redemptions_week * 4 * 2.5} €</div>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Reward-Kosten</div>
          </div>
          <div style={{ flex: 1, background: C.white, borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.fresh }}>{limits.max_redemptions_week * 4 * 7.2} €</div>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Umsatz-Impact</div>
          </div>
          <div style={{ flex: 1, background: C.mintLight, borderRadius: 10, padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.green }}>
              {Math.round((limits.max_redemptions_week * 4 * 7.2 - limits.max_redemptions_week * 4 * 2.5) / (limits.max_redemptions_week * 4 * 2.5) * 100)}%
            </div>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>Est. ROI</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Staff Roles ───────────────────────────────────────────────────────────────
const ROLES = [
  { id: "owner",   label: "Inhaber",     perms: ["Übersicht", "Kampagnen", "QR", "Einlösungen", "Einstellungen"], color: C.green },
  { id: "manager", label: "Manager",     perms: ["Übersicht", "Kampagnen", "QR", "Einlösungen"], color: C.teal },
  { id: "staff",   label: "Mitarbeiter", perms: ["QR", "Einlösungen"], color: C.gold },
  { id: "cashier", label: "Kassierer",   perms: ["Einlösungen"], color: C.muted },
];

export function StaffRoles() {
  const [activeRole, setActiveRole] = useState(null);

  return (
    <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 2px 10px rgba(6,13,8,.06)`, marginBottom: 16 }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <Users size={16} color={C.teal} />
        <span style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Rollen & Berechtigungen</span>
      </div>
      <div style={{ padding: "8px 16px 12px" }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
          Kontrolliere, welche Teammitglieder auf welche Funktionen zugreifen können.
        </div>
        {ROLES.map((role, i) => (
          <div key={role.id}>
            <button
              onClick={() => setActiveRole(activeRole === role.id ? null : role.id)}
              style={{
                width: "100%", background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: i < ROLES.length - 1 ? `1px solid ${C.border}` : "none",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${role.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {role.id === "owner" ? "👑" : role.id === "manager" ? "🎯" : role.id === "staff" ? "👤" : "💳"}
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{role.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{role.perms.length} Berechtigungen</div>
              </div>
              <ChevronRight size={14} color={C.muted} style={{ transform: activeRole === role.id ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
            </button>
            <AnimatePresence>
              {activeRole === role.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ background: C.bg, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {["Übersicht", "Kampagnen", "QR", "Einlösungen", "Einstellungen"].map(p => {
                        const has = role.perms.includes(p);
                        return (
                          <div key={p} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: has ? `${role.color}15` : `${C.border}`,
                            border: `1px solid ${has ? `${role.color}30` : "transparent"}`,
                            borderRadius: 99, padding: "4px 10px",
                          }}>
                            {has ? <Check size={10} color={role.color} strokeWidth={3} /> : <span style={{ fontSize: 10 }}>−</span>}
                            <span style={{ fontSize: 11, fontWeight: 700, color: has ? role.color : C.muted }}>{p}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Full Merchant Settings Page ───────────────────────────────────────────────
export default function MerchantSettings({ onBack, onLogout, embedded = false, spotName }) {
  const { user, session } = useAuth();
  const [activeSection, setActiveSection] = useState("value");

  const SECTIONS = [
    { id: "value", label: "Wiederkehr", icon: "🔄" },
    { id: "pricing", label: "Abo-Pläne", icon: "💳" },
    { id: "trust", label: "Sicherheit", icon: "🛡️" },
  ];

  const body = (
    <>
      <div
        className={embedded ? "flex gap-2.5 overflow-x-auto pb-2 scrollbar-none" : "flex gap-2 overflow-x-auto px-4 py-3"}
        style={embedded ? { marginBottom: 20 } : undefined}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={
              embedded
                ? `min-h-[44px] shrink-0 rounded-2xl px-5 py-2.5 text-[14px] font-bold transition ${
                    activeSection === s.id
                      ? "bg-[#0B1F3A] text-white shadow-sm"
                      : "border border-[#E8E8E4] bg-white text-[#64748b]"
                  }`
                : undefined
            }
            style={
              embedded
                ? undefined
                : {
                    flexShrink: 0, borderRadius: 12, padding: "8px 14px",
                    background: activeSection === s.id ? C.green : C.white,
                    border: `1.5px solid ${activeSection === s.id ? C.green : C.border}`,
                    color: activeSection === s.id ? "#fff" : C.muted,
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }
            }
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      <div style={embedded ? undefined : { padding: "12px 16px" }}>
        {activeSection === "value"   && <MonthlyValueSummary />}
        {activeSection === "pricing" && <SpotloopPricing spotName={spotName} />}
        {activeSection === "rewards" && <RewardCostControls />}
        {activeSection === "staff"   && <StaffRoles />}
        {activeSection === "trust"   && (
          <>
            <MerchantTrustBanner />
            <div style={{ height: 12 }} />
            <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "14px 16px", boxShadow: `0 2px 10px rgba(6,13,8,.06)` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 12 }}>🔐 Sicherheits-Checkliste</div>
              {[
                { label: "Dynamische QR-Codes", done: true },
                { label: "Rollen-basierte Zugriffssteuerung", done: true },
                { label: "Scan-Velocity Analyse", done: true },
                { label: "DSGVO-konforme Datenspeicherung", done: true },
                { label: "Anti-Farming Schutz", done: true },
                { label: "Zwei-Faktor-Authentifizierung (demnächst)", done: false },
                { label: "Biometrische Reward-Bestätigung (demnächst)", done: false },
              ].map((item, i) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 6 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: item.done ? C.fresh : C.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.done ? <Check size={12} color="#fff" strokeWidth={3} /> : <span style={{ fontSize: 10, color: C.muted }}>–</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: item.done ? 600 : 400, color: item.done ? C.dark : C.muted }}>{item.label}</span>
                </div>
              ))}
            </div>
            {user && isAppAdminAccess(user, session) && (
              <Link
                to="/admin/spots"
                style={{
                  display: "block",
                  marginTop: 14,
                  padding: "14px 16px",
                  background: C.mintLight,
                  border: `1px solid ${C.fresh}35`,
                  borderRadius: 14,
                  textDecoration: "none",
                  color: C.green,
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Spot-Freischaltung (Admin) →
              </Link>
            )}
          </>
        )}
      </div>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          style={{
            width: "100%",
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 16px",
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            color: C.muted,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <LogOut size={18} strokeWidth={2.25} />
          Abmelden
        </button>
      )}
    </>
  );

  if (embedded) {
    return (
      <div
        className="scroll-y min-w-0"
        style={{
          flex: 1,
          minHeight: 0,
          paddingTop: "max(20px, calc(env(safe-area-inset-top) + 16px))",
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 32,
        }}
      >
        <header style={{ marginBottom: 28 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: -0.4,
              color: "#0B1F3A",
              lineHeight: 1.2,
            }}
          >
            Einstellungen
          </h2>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 15,
              lineHeight: 1.5,
              color: "#64748b",
            }}
          >
            Betrieb, Team und Sicherheit — alles an einem Ort.
          </p>
        </header>
        {body}
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <HeaderShell
        paddingBottom={20}
        style={{ paddingTop: "max(48px, calc(env(safe-area-inset-top) + 12px))", flexShrink: 0 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {onBack && <HeaderBackButton onClick={onBack} />}
          <div>
            <HeaderEyebrow>Merchant</HeaderEyebrow>
            <HeaderTitle size={24}>Einstellungen</HeaderTitle>
            <HeaderSubtitle>Betrieb & Sicherheit</HeaderSubtitle>
          </div>
        </div>
      </HeaderShell>
      <div className="scroll-y" style={{ paddingBottom: 32 }}>
        {body}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function NumberRow({ label, sub, value, onMinus, onPlus, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onMinus} style={{ width: 28, height: 28, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.dark }}>
          <Minus size={12} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.dark, minWidth: 48, textAlign: "center" }}>{value}</span>
        <button onClick={onPlus} style={{ width: 28, height: 28, borderRadius: 8, background: C.green, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: last ? "none" : `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}
