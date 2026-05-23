import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Bell, MapPin, Eye, Download, Trash2, Lock, Gift,
  ChevronRight, X, Check, AlertTriangle, Info, ShieldCheck,
  ToggleLeft, Users, MessageSquare, Zap,
} from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";
import { PermissionRow, PrivacyNote, MerchantTrustBanner, Toggle, TrustStrip } from "../../components/trust";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isAppAdminAccess } from "../../lib/admin";
import DevBootstrapPanel from "../../components/DevBootstrapPanel";
import { getSocialPrefs, setSocialPrefs } from "../../lib/social";
import { getPrivacyPrefs, savePrivacyPrefs, syncPrivacyPrefsFromCloud, PAYMENT_PRINCIPLES } from "../../lib/privacy";

const SECTION_STYLE = {
  background: "#fff",
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  overflow: "hidden",
  boxShadow: `0 2px 10px rgba(6,13,8,.06)`,
  marginBottom: 16,
};

const DIVIDER = { borderBottom: `1px solid ${C.border}` };

export default function PrivacySettings({ onBack }) {
  const { user, profile, session } = useAuth();
  const [prefs, setPrefs] = useState({
    ...getPrivacyPrefs(),
    ...getSocialPrefs(),
  });
  useEffect(() => {
    if (!user?.uid) return;
    syncPrivacyPrefsFromCloud(user.uid).then((merged) => {
      setPrefs((p) => ({ ...merged, ...getSocialPrefs() }));
    });
  }, [user?.uid]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [exportDone, setExportDone] = useState(false);

  const set = (key) => (val) => {
    setPrefs((p) => {
      const next = { ...p, [key]: val };
      const socialKeys = ["show_activity", "show_visited_spots", "show_on_social_map", "group_rewards", "moments_visibility", "collections_default"];
      if (socialKeys.includes(key)) {
        setSocialPrefs({ [key]: val });
      } else if (user?.uid) {
        savePrivacyPrefs(user.uid, { [key]: val });
      } else {
        savePrivacyPrefs(null, { [key]: val });
      }
      return next;
    });
  };

  const handleExport = () => {
    const data = {
      user_id: user?.uid,
      email: user?.email,
      name: profile?.name,
      preferences: prefs,
      exported_at: new Date().toISOString(),
      note: "Vollständige Datenkopie gemäß Art. 20 DSGVO"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `spotloop-daten-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
    setShowExportConfirm(false);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 92 }}>
      {/* Header */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.03)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 18 }}>
            ‹
          </button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>Datenschutz & Sicherheit</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 1 }}>Du kontrollierst deine Daten</div>
          </div>
        </div>
      </div>

      {exportDone && (
        <div style={{ margin: "12px 16px 0", background: C.mintLight, border: `1px solid ${C.fresh}30`, borderRadius: 12, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          <Check size={15} color={C.fresh} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>Daten wurden heruntergeladen.</span>
        </div>
      )}

      <div style={{ padding: "16px 16px 0" }}>

        {/* Trust summary */}
        <div style={{ background: CARD_GRADIENT, borderRadius: 18, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={20} color="#7BDFAA" />
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Deine Datenkontrolle</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              PAYMENT_PRINCIPLES.merchantVisibility,
              "Keine universellen Punkte — nur Besuche pro Spot",
              "Spots können dich nur kontaktieren, wenn du zustimmst",
              "Du kannst deine Daten jederzeit löschen oder exportieren",
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <Check size={12} color="#7BDFAA" strokeWidth={3} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>BENACHRICHTIGUNGEN</div>
        <div style={SECTION_STYLE}>
          <div style={{ padding: "0 16px" }}>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Bell size={18} />} label="Reward-Erinnerungen" sub="Wenn ein Reward einlösbar ist" value={prefs.push_rewards} onChange={set("push_rewards")} iconColor={C.fresh} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Zap size={18} />} label="Kampagnen & Angebote" sub="Nur Spots mit deiner Treue-Karte (nach Scan)" value={prefs.push_campaigns} onChange={set("push_campaigns")} iconColor={C.gold} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<MessageSquare size={18} />} label="Reaktivierungs-Einladungen" sub="Max. 1× pro Monat pro Spot — persönlich, kein Spam" value={prefs.push_reactivation !== false} onChange={(v) => set("push_reactivation")(v)} iconColor={C.blue} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<MapPin size={18} />} label="Lieblingsspot in der Nähe" sub="Wenn ein Favorit nahe ist" value={prefs.push_nearby} onChange={set("push_nearby")} iconColor={C.teal} /></div>
            <PermissionRow icon={<AlertTriangle size={18} />} label="Ablauf-Warnungen" sub="Bevor Punkte oder Rewards verfallen" value={prefs.push_expiry} onChange={set("push_expiry")} iconColor={C.orange} />
          </div>
        </div>

        {/* Location */}
        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>STANDORT</div>
        <div style={SECTION_STYLE}>
          <div style={{ padding: "0 16px" }}>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<MapPin size={18} />} label="Spots in der Nähe" sub="Zeigt Empfehlungen basierend auf deinem Standort" value={prefs.location_nearby} onChange={set("location_nearby")} iconColor={C.teal} /></div>
            <PermissionRow icon={<Shield size={18} />} label="Check-in Validierung" sub="Bestätigt echte Besuche (empfohlen)" value={prefs.location_checkin} onChange={set("location_checkin")} iconColor={C.fresh} />
          </div>
          <div style={{ padding: "0 16px 12px" }}>
            <PrivacyNote>Standort wird niemals gespeichert — nur zur Echtzeit-Validierung genutzt.</PrivacyNote>
          </div>
        </div>

        {/* Merchant contact */}
        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>HÄNDLER-KOMMUNIKATION</div>
        <div style={SECTION_STYLE}>
          <div style={{ padding: "0 16px" }}>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<MessageSquare size={18} />} label="Kampagnen von allen Spots" sub="Deaktiviert für mehr Kontrolle empfohlen" value={prefs.campaigns_all} onChange={set("campaigns_all")} iconColor={C.orange} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Check size={18} />} label="Folgen ohne Treue-Karte" sub="Interesse speichern — keine Kampagnen bis zum ersten Scan" value={prefs.campaigns_opted} onChange={set("campaigns_opted")} iconColor={C.fresh} /></div>
            <PermissionRow icon={<Users size={18} />} label="Personalisierte Empfehlungen" sub="Relevante Spots basierend auf deiner Aktivität" value={prefs.discovery_personal} onChange={set("discovery_personal")} iconColor={C.purple || "#8B5CF6"} />
          </div>
        </div>

        {/* Social */}
        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>SPOTLOOP SOCIAL</div>
        <div style={SECTION_STYLE}>
          <div style={{ padding: "0 16px" }}>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Users size={18} />} label="Freundes-Aktivität" sub="Dezente Hinweise wie „Anna war bei …“" value={prefs.show_activity} onChange={set("show_activity")} iconColor={C.fresh} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<MapPin size={18} />} label="Besuchte Spots für Freunde" sub="Freunde sehen, wo du warst (wenn du willst)" value={prefs.show_visited_spots} onChange={set("show_visited_spots")} iconColor={C.teal} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Eye size={18} />} label="Auf Social Map erscheinen" sub="Freundeskreis sieht deine Spots auf der Karte" value={prefs.show_on_social_map} onChange={set("show_on_social_map")} iconColor={C.blue} /></div>
            <PermissionRow icon={<Gift size={18} />} label="Gemeinsame Rewards" sub="Gruppenbonus & „Freund mitbringen“" value={prefs.group_rewards} onChange={set("group_rewards")} iconColor={C.gold} />
          </div>
          <div style={{ padding: "0 16px 12px" }}>
            <PrivacyNote>Collections sind standardmäßig privat. Food Moments nur für Freunde — kein öffentlicher Feed.</PrivacyNote>
          </div>
        </div>

        {/* Loyalty & Spot-Sichtbarkeit */}
        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>TREUE & SPOT-SICHTBARKEIT</div>
        <div style={SECTION_STYLE}>
          <div style={{ padding: "0 16px" }}>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Zap size={18} />} label="Loyalitäts-Teilnahme" sub="Besuche pro Spot — keine app-weiten Punkte" value={prefs.loyalty_active} onChange={set("loyalty_active")} iconColor={C.fresh} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Eye size={18} />} label="Smart Member Profile" sub="Spots sehen Besuche, Stufe & Rewards — als Pseudonym" value={prefs.share_loyalty_insights} onChange={set("share_loyalty_insights")} iconColor={C.blue} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Lock size={18} />} label="Ausgaben für Spots teilen" sub="Ø Besuchswert in Insights (keine Zahlungsdaten)" value={prefs.share_spend_with_spots} onChange={set("share_spend_with_spots")} iconColor={C.orange} /></div>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Gift size={18} />} label="Personalisierte Kampagnen" sub="Geburtstag & Reaktivierung nur mit Zustimmung" value={prefs.allow_personalized_campaigns} onChange={set("allow_personalized_campaigns")} iconColor={C.gold} /></div>
            <PermissionRow icon={<Eye size={18} />} label="Personalisierte Angebote" sub="Rewards basierend auf deinen Besuchen" value={prefs.personalized_offers} onChange={set("personalized_offers")} iconColor={C.teal} />
          </div>
          <div style={{ padding: "0 16px 12px" }}>
            <PrivacyNote>Spots sehen dich als z. B. Member #A72X91 — nie deinen echten Namen aus der Wallet.</PrivacyNote>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>COMMUNITY</div>
        <div style={SECTION_STYLE}>
          <div style={{ padding: "0 16px" }}>
            <div style={{ ...DIVIDER }}><PermissionRow icon={<Users size={18} />} label="Community-Einladungen" sub="Spots dürfen dich in Clubs einladen" value={prefs.allow_community_invites} onChange={set("allow_community_invites")} iconColor={C.blue} /></div>
            <PermissionRow icon={<Eye size={18} />} label="In Community sichtbar" sub="Pseudonym in der Member-Liste deines Spots" value={prefs.community_visible_to_spot} onChange={set("community_visible_to_spot")} iconColor={C.teal} />
          </div>
          <div style={{ padding: "0 16px 12px" }}>
            <PrivacyNote>Du entscheidest selbst über Beitritt — keine automatische Aufnahme.</PrivacyNote>
          </div>
        </div>

        {/* Data rights */}
        <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>DEINE DATENRECHTE</div>
        <div style={SECTION_STYLE}>
          <div style={{ padding: "0 16px" }}>
            {/* Data export */}
            <div style={{ ...DIVIDER }}>
              <button
                onClick={() => setShowExportConfirm(true)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", background: "none", border: "none", cursor: "pointer", width: "100%" }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 11, background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Download size={18} color={C.teal} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>Daten exportieren</div>
                  <div style={{ fontSize: 11, color: C.muted }}>JSON-Download · Art. 20 DSGVO</div>
                </div>
                <ChevronRight size={16} color={C.muted} />
              </button>
            </div>
            {/* Privacy policy */}
            <div style={{ ...DIVIDER }}>
              <button style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", background: "none", border: "none", cursor: "pointer", width: "100%" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: C.mintLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Eye size={18} color={C.fresh} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>Datenschutzerklärung</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Wie wir deine Daten verarbeiten</div>
                </div>
                <ChevronRight size={16} color={C.muted} />
              </button>
            </div>
            {/* Delete account */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", background: "none", border: "none", cursor: "pointer", width: "100%" }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${C.orange}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trash2 size={18} color={C.orange} />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.orange }}>Konto löschen</div>
                <div style={{ fontSize: 11, color: C.muted }}>Alle Daten unwiderruflich entfernen</div>
              </div>
              <ChevronRight size={16} color={C.muted} />
            </button>
          </div>
        </div>

        <div style={SECTION_STYLE}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Entwickler / Test</div>
            <DevBootstrapPanel compact onDone={() => window.location.reload()} />
          </div>
        </div>

        {user && isAppAdminAccess(user, session) && (
          <div style={SECTION_STYLE}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Admin</div>
              <Link
                to="/admin/spots"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  textDecoration: "none",
                  color: "inherit",
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${C.green}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ShieldCheck size={18} color={C.green} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>Pending Spots prüfen</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Neue Standorte freigeben</div>
                </div>
                <ChevronRight size={16} color={C.muted} />
              </Link>
            </div>
          </div>
        )}

        {/* Legal info */}
        <div style={SECTION_STYLE}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Datenverarbeitung</div>
            {[
              { icon: "🔐", label: "Verschlüsselung", desc: "Alle Verbindungen sind TLS-verschlüsselt" },
              { icon: "🗓️", label: "Datenspeicherung", desc: "Daten werden max. 24 Monate gespeichert" },
              { icon: "🚫", label: "Keine Drittanbieter", desc: "Kein Tracking durch Google, Meta, etc." },
              { icon: "🇪🇺", label: "EU-Datenhaltung", desc: "Daten verbleiben in europäischen Rechenzentren" },
            ].map((r, i) => (
              <div key={r.label} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <TrustStrip />
          <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>spotloop · Version 1.0 · DSGVO-konform · Made in Germany</div>
        </div>
      </div>

      {/* ── Export confirmation sheet ── */}
      <AnimatePresence>
        {showExportConfirm && (
          <BottomSheet onClose={() => setShowExportConfirm(false)}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Daten exportieren</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
                Du erhältst eine JSON-Datei mit allen deinen gespeicherten Daten gemäß Art. 20 DSGVO.
              </div>
              <button onClick={handleExport} style={{ width: "100%", background: CARD_GRADIENT, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
                <Download size={16} style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
                Daten herunterladen
              </button>
              <button onClick={() => setShowExportConfirm(false)} style={{ width: "100%", background: "none", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px", fontSize: 13, fontWeight: 700, color: C.muted, cursor: "pointer" }}>
                Abbrechen
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* ── Delete confirmation sheet ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <BottomSheet onClose={() => { setShowDeleteConfirm(false); setDeleteStep(0); }}>
            {deleteStep === 0 ? (
              <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Konto wirklich löschen?</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                  Alle deine Daten, Treue-Karten und Rewards werden dauerhaft entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
                </div>
                <PrivacyNote variant="warning">Alle gesammelten Punkte und Rewards gehen verloren.</PrivacyNote>
                <div style={{ height: 16 }} />
                <button onClick={() => setDeleteStep(1)} style={{ width: "100%", background: C.orange, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
                  Ja, Konto löschen
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ width: "100%", background: "none", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px", fontSize: 13, fontWeight: 700, color: C.muted, cursor: "pointer" }}>
                  Abbrechen
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Löschantrag eingereicht</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                  Dein Konto wird innerhalb von 30 Tagen vollständig gelöscht. Du erhältst eine Bestätigung per E-Mail.
                </div>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteStep(0); }} style={{ width: "100%", background: CARD_GRADIENT, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Verstanden
                </button>
              </div>
            )}
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}

function BottomSheet({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 400 }}
        style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 390, margin: "0 auto", padding: "8px 20px 32px" }}
      >
        <div style={{ width: 40, height: 4, background: "#E2EBE4", borderRadius: 2, margin: "6px auto 16px" }} />
        {children}
      </motion.div>
    </motion.div>
  );
}
