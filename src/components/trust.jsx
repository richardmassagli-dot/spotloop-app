/**
 * Trust, Privacy & Security UI components — spotloop design system
 */
import { Shield, Lock, Eye, Check, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const C = {
  green: "#0A1628", fresh: "#1B4FD8", mintLight: "#EFF6FF", mint: "#BAE6FD",
  teal: "#0EA5E9", tealLight: "#E0F2FE",
  orange: "#F97316", orangeLight: "#FFF7ED",
  gold: "#F59E0B", goldLight: "#FFFBEB",
  dark: "#0A1628", muted: "#64748B",
  white: "#FFFFFF", bg: "#F7F9FF", border: "#E2E8F5",
};

// ── Inline trust chip (e.g. below login form) ─────────────────────────────────
export function TrustChip({ text, icon: Icon = ShieldCheck, color = C.fresh }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${color}12`, borderRadius: 99, padding: "4px 10px" }}>
      <Icon size={12} color={color} strokeWidth={2.5} />
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{text}</span>
    </div>
  );
}

// ── Trust badge strip (row of chips) ─────────────────────────────────────────
export function TrustStrip({ items }) {
  const defaults = [
    { text: "DSGVO-konform", icon: Shield },
    { text: "Verschlüsselt", icon: Lock },
    { text: "Datenkontrolle", icon: Eye },
  ];
  const list = items || defaults;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
      {list.map((item, i) => (
        <TrustChip key={i} text={item.text} icon={item.icon || ShieldCheck} color={item.color || C.fresh} />
      ))}
    </div>
  );
}

// ── Privacy info box ──────────────────────────────────────────────────────────
export function PrivacyNote({ children, variant = "info" }) {
  const styles = {
    info:    { bg: C.tealLight, border: `${C.teal}30`, icon: Info, color: C.teal },
    success: { bg: C.mintLight, border: `${C.fresh}30`, icon: ShieldCheck, color: C.fresh },
    warning: { bg: C.orangeLight, border: `${C.orange}30`, icon: AlertTriangle, color: C.orange },
  };
  const s = styles[variant] || styles.info;
  const Icon = s.icon;
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Icon size={15} color={s.color} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12, color: s.color, fontWeight: 600, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

// ── DSGVO consent checkbox ────────────────────────────────────────────────────
export function ConsentRow({ checked, onChange, children }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", width: "100%" }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: `2px solid ${checked ? C.fresh : C.border}`,
        background: checked ? C.fresh : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s", marginTop: 1,
      }}>
        {checked && <Check size={13} color="#fff" strokeWidth={3} />}
      </div>
      <span style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, fontWeight: checked ? 600 : 400 }}>{children}</span>
    </button>
  );
}

// ── Security badge for QR ─────────────────────────────────────────────────────
export function SecureQRBadge() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.mintLight, border: `1px solid ${C.fresh}30`, borderRadius: 99, padding: "4px 12px" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.fresh }} />
      <span style={{ fontSize: 10, fontWeight: 800, color: C.fresh, letterSpacing: 0.5 }}>VERSCHLÜSSELT · EINMALIG</span>
    </div>
  );
}

// ── Merchant trust banner ─────────────────────────────────────────────────────
export function MerchantTrustBanner() {
  return (
    <div style={{ background: C.mintLight, border: `1px solid ${C.fresh}20`, borderRadius: 14, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <ShieldCheck size={16} color={C.fresh} />
        <span style={{ fontSize: 13, fontWeight: 800, color: C.green }}>Deine Follower-Daten sind geschützt</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[
          "Keine Weitergabe an Wettbewerber",
          "Sichere QR- & Reward-Validierung",
          "DSGVO-konforme Datenstruktur",
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Check size={11} color={C.fresh} strokeWidth={3} />
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Guest trust footer ────────────────────────────────────────────────────────
export function GuestTrustFooter() {
  return (
    <div style={{ padding: "16px 20px", textAlign: "center" }}>
      <TrustStrip />
      <div style={{ fontSize: 10, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
        Du kontrollierst deine Daten jederzeit.<br />
        Spots können dich nur mit deiner Erlaubnis kontaktieren.<br />
        Nur verifizierte Spots erscheinen auf spotloop.
      </div>
    </div>
  );
}

// ── Permission toggle row ─────────────────────────────────────────────────────
export function PermissionRow({ icon, label, sub, value, onChange, iconColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0" }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: `${iconColor || C.green}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {typeof icon === "string" ? icon : <icon.type {...icon.props} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{sub}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
export function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
        background: value ? C.fresh : "#D1D9D4",
        position: "relative", flexShrink: 0, transition: "background .2s",
      }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
        style={{ width: 22, height: 22, borderRadius: 11, background: "#fff", position: "absolute", top: 2, boxShadow: "0 1px 4px rgba(0,0,0,.2)" }}
      />
    </button>
  );
}

// ── Scan security indicator ───────────────────────────────────────────────────
export function ScanCooldownBadge({ seconds }) {
  const hot = seconds < 10;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: hot ? C.orangeLight : C.mintLight, borderRadius: 99, padding: "4px 12px", border: `1px solid ${hot ? C.orange : C.fresh}30` }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: hot ? C.orange : C.fresh }} />
      <span style={{ fontSize: 11, fontWeight: 800, color: hot ? C.orange : C.fresh }}>
        {hot ? `Scan läuft ab in ${seconds}s` : `Gültig für ${seconds}s`}
      </span>
    </div>
  );
}
