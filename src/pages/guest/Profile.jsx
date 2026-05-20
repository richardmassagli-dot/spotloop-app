import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserStamps, getAllSpots } from "../../lib/firestore";
import { C, CARD_GRADIENT, Spinner } from "../../components/ui";
import { GuestTrustFooter, TrustChip } from "../../components/trust";
import PrivacySettings from "./PrivacySettings";
import SupportCenter from "./SupportCenter";
import { ShieldCheck } from "lucide-react";

export default function Profile({ onLogout }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  if (showPrivacy) return <PrivacySettings onBack={() => setShowPrivacy(false)} />;
  if (showSupport) return <SupportCenter onClose={() => setShowSupport(false)} />;
  const { user, profile } = useAuth();
  const [stamps, setStamps] = useState([]);
  const [spots, setSpots]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserStamps(user.uid), getAllSpots()])
      .then(([s, sp]) => {
        setStamps(s ?? []);
        setSpots(sp ?? []);
        setLoading(false);
      })
      .catch(() => {
        setStamps([]);
        setSpots([]);
        setLoading(false);
      });
  }, [user.uid]);

  const totalPoints  = stamps.reduce((a, s) => a + s.points, 0);
  const totalVisits  = stamps.reduce((a, s) => a + s.points, 0);
  const readyRewards = stamps.filter(s => s.reward_ready).length;
  const memberSince  = new Date(user.created_at || Date.now()).toLocaleDateString("de-DE", { month: "long", year: "numeric" });

  const SETTINGS = [
    { icon: "🔔", label: "Benachrichtigungen", sub: "Push & E-Mail", action: null },
    { icon: "🔒", label: "Datenschutz & Sicherheit", sub: "Daten, Kontrolle, DSGVO", action: () => setShowPrivacy(true), highlight: true },
    { icon: "💳", label: "Zahlungsmethoden", sub: "Karte hinzufügen", action: null },
    { icon: "🎁", label: "Einladungen", sub: "Freunde werben", action: null },
    { icon: "❓", label: "Hilfe & Support", sub: "FAQ, Tickets, Kontakt", action: () => setShowSupport(true) },
    { icon: "⚙️", label: "Einstellungen", sub: "App-Einstellungen", action: null },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 92 }}>
      {/* ── Hero ── */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(19,176,92,.07)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, position: "relative" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "rgba(255,255,255,.12)",
            border: "2px solid rgba(255,255,255,.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "#fff",
          }}>
            {profile?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>{profile?.name}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 2 }}>{user.email}</div>
            <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.1)", borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.7)", letterSpacing: 1 }}>MEMBER</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>seit {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, position: "relative" }}>
          {[
            { val: totalVisits,       label: "Besuche",   icon: "⬛" },
            { val: stamps.length,     label: "Karten",    icon: "💳" },
            { val: readyRewards,      label: "Rewards",   icon: "🎁" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Favorite spots */}
        {stamps.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 12 }}>Meine Spots</div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", margin: "0 -20px", padding: "0 20px 4px" }}>
              {stamps.map(stamp => {
                const bg = stamp.spot?.bg_color || C.green;
                return (
                  <div key={stamp.id} style={{ minWidth: 88, textAlign: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 18, margin: "0 auto 6px",
                      background: `${bg}18`, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 30, border: `2px solid ${bg}28`,
                    }}>
                      {stamp.spot?.emoji || "🏪"}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stamp.spot?.name}</div>
                    <div style={{ fontSize: 10, color: stamp.reward_ready ? C.orange : C.muted, fontWeight: 600 }}>
                      {stamp.reward_ready ? "🎁 Bereit" : `${stamp.points}/${stamp.max_points}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Membership card */}
        <div style={{ background: C.white, borderRadius: 18, padding: "16px", marginBottom: 16, border: `1px solid ${C.border}`, boxShadow: `0 2px 10px ${C.shadow}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Mitgliedschaft</div>
            <div style={{ background: C.mintLight, color: C.green, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>Kostenlos</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Gesammelte Punkte", val: totalPoints },
              { label: "Stempelkarten",     val: stamps.length },
            ].map((r, i) => (
              <div key={i} style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.dark, letterSpacing: -0.5 }}>{r.val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings list */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 2px 10px ${C.shadow}` }}>
          {SETTINGS.map((s, i) => (
            <div
              key={i}
              onClick={s.action || undefined}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                borderBottom: i < SETTINGS.length - 1 ? `1px solid ${C.border}` : "none",
                cursor: s.action ? "pointer" : "default",
                background: s.highlight ? C.mintLight : "transparent",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.highlight ? C.mint : C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: s.highlight ? C.green : C.dark }}>{s.label}</div>
                <div style={{ fontSize: 11, color: s.highlight ? C.fresh : C.muted }}>{s.sub}</div>
              </div>
              <div style={{ color: C.muted, fontSize: 16 }}>›</div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            width: "100%", marginTop: 16,
            background: "transparent", border: `1.5px solid ${C.border}`,
            borderRadius: 14, padding: "14px", fontSize: 14,
            fontWeight: 700, color: C.red, cursor: "pointer",
          }}
        >
          Abmelden
        </button>

        <GuestTrustFooter />
      </div>
    </div>
  );
}
