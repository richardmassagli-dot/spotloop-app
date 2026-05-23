import { useState, useEffect } from "react";
import {
  Save,
  Eye,
  Plus,
  Trash2,
  CalendarDays,
  ChevronRight,
  MapPin,
  Clock,
  Phone,
  ClipboardList,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { C, Btn, Card, Alert } from "../../components/ui";
import { saveSpotPageConfig, getStoredPageConfig, DEFAULT_PAGE_CONFIG } from "../../lib/spotPage";
import { parseSpotDescription } from "../../lib/spotGuestFeed";
import { updateSpot } from "../../lib/firestore";
import { spotCategoryLine } from "../../lib/spotDisplay";
import ReservationLinkEditor from "../../components/merchant/ReservationLinkEditor";
import SpotloopPricing from "../../components/merchant/SpotloopPricing";
import NavTileGrid from "../../components/merchant/NavTileGrid";
import MerchantSubBack from "../../components/merchant/MerchantSubBack";

const SECTIONS = [
  { id: "profile", icon: ClipboardList, label: "Profil", hint: "Adresse" },
  { id: "content", icon: Sparkles, label: "Inhalte", hint: "Events" },
  { id: "pricing", icon: CreditCard, label: "Abo", hint: "Pläne" },
  { id: "preview", icon: Eye, label: "Vorschau", hint: "Gäste" },
];

export default function MerchantSpotPage({ spotId, spot }) {
  const [section, setSection] = useState(null);
  const [cfg, setCfg] = useState(() => getStoredPageConfig(spotId));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const activeSection = SECTIONS.find((s) => s.id === section);

  useEffect(() => {
    const local = getStoredPageConfig(spotId);
    const fromDesc = spot?.description ? parseSpotDescription(spot.description) : { welcome: "", page: {} };
    const page = fromDesc.page || {};
    setCfg({
      ...local,
      ...page,
      welcome: local.welcome || fromDesc.welcome || "",
      address: local.address || page.address || spot?.address || "",
      hours: local.hours || page.hours || spot?.hours || spot?.opening_hours || "",
      phone: local.phone || page.phone || spot?.phone || "",
      website: local.website || page.website || spot?.website || "",
      reservation_url: local.reservation_url || page.reservation_url || spot?.reservation_url || "",
    });
  }, [spotId, spot?.id, spot?.description, spot?.address, spot?.hours, spot?.opening_hours]);

  const set = (key) => (e) => setCfg((p) => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await saveSpotPageConfig(spotId, cfg);
      await updateSpot(spotId, {
        description: cfg.welcome || "",
        address: cfg.address?.trim() || "",
        opening_hours: cfg.hours?.trim() || "",
        phone: cfg.phone?.trim() || undefined,
        website: cfg.website?.trim() || undefined,
        emoji: spot?.emoji,
        bg_color: spot?.bg_color,
        current_action: spot?.current_action,
      }).catch(() => {});
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.message || "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const addEvent = () => {
    setCfg((p) => ({
      ...p,
      events: [...(p.events || []), { id: `e-${Date.now()}`, title: "Neues Event", date: "Bald", desc: "", emoji: "🎉" }],
    }));
  };

  const addGallery = () => {
    setCfg((p) => ({
      ...p,
      gallery: [...(p.gallery || []), { type: "Ambiente", caption: "Neues Foto", emoji: "📸" }],
    }));
  };

  if (!section) {
    return (
      <div>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.dark, letterSpacing: -0.4, marginBottom: 14 }}>
          Spotseite
        </div>
        <NavTileGrid items={SECTIONS} active={null} onSelect={setSection} columns={2} />
      </div>
    );
  }

  return (
    <div>
      <MerchantSubBack
        title={activeSection?.label || "Spotseite"}
        subtitle={activeSection?.hint}
        onBack={() => setSection(null)}
      />

      {error && <Alert type="error">{error}</Alert>}
      {saved && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="success">Spotseite gespeichert ✓</Alert>
        </div>
      )}

      {section === "profile" && (
        <>
          <Card
            style={{
              padding: 16,
              marginBottom: 12,
              border: `1.5px solid ${C.mint}`,
              background: `linear-gradient(180deg, ${C.mintLight} 0%, ${C.white} 100%)`,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 4 }}>
              Wichtige Infos für Gäste
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 14, lineHeight: 1.45 }}>
              Diese Angaben erscheinen prominent im Spot-Profil unter „Informationen“.
            </div>

            <Field
              label="Adresse"
              value={cfg.address}
              onChange={set("address")}
              placeholder="Königsstr. 42, 70173 Stuttgart"
              icon={<MapPin size={14} color={C.green} />}
              hint="Straße, PLZ und Ort — für Route & Karte."
            />
            <Field
              label="Öffnungszeiten"
              value={cfg.hours}
              onChange={set("hours")}
              placeholder="Mo–Fr 8:00–18:00 · Sa 9:00–14:00"
              icon={<Clock size={14} color={C.green} />}
            />
            <Field
              label="Telefon (optional)"
              value={cfg.phone}
              onChange={set("phone")}
              placeholder="+49 711 …"
              icon={<Phone size={14} color={C.green} />}
              type="tel"
            />
          </Card>

          <ReservationLinkEditor
            spotId={spotId}
            spot={spot}
            onSaved={(reservation_url) => setCfg((p) => ({ ...p, reservation_url }))}
          />

          <Card style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 12 }}>
              Profil & Texte
            </div>
            <Field
              label="Tagline"
              value={cfg.tagline}
              onChange={set("tagline")}
              placeholder="z.B. Specialty Coffee & hausgemachte Kuchen"
            />
            <Field
              label="Willkommenstext"
              value={cfg.welcome}
              onChange={set("welcome")}
              placeholder="Erzähle Gästen kurz, was dich besonders macht…"
              multiline
            />
            <Field label="Website (optional)" value={cfg.website} onChange={set("website")} placeholder="https://…" type="url" />
            <Field
              label="Community-Botschaft"
              value={cfg.community_message}
              onChange={set("community_message")}
              placeholder={DEFAULT_PAGE_CONFIG.community_message}
              multiline
            />
          </Card>
        </>
      )}

      {section === "content" && (
        <>
          <Card style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>Events</div>
              <button
                type="button"
                onClick={addEvent}
                style={{
                  background: C.mintLight,
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.green,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Plus size={14} /> Event
              </button>
            </div>
            {(cfg.events || []).map((ev, i) => (
              <div
                key={ev.id || i}
                style={{
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: i < cfg.events.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                <input
                  value={ev.title}
                  onChange={(e) => {
                    const events = [...cfg.events];
                    events[i] = { ...ev, title: e.target.value };
                    setCfg((p) => ({ ...p, events }));
                  }}
                  style={inputStyle}
                  placeholder="Titel"
                />
                <input
                  value={ev.date}
                  onChange={(e) => {
                    const events = [...cfg.events];
                    events[i] = { ...ev, date: e.target.value };
                    setCfg((p) => ({ ...p, events }));
                  }}
                  style={{ ...inputStyle, marginTop: 6 }}
                  placeholder="Datum"
                />
              </div>
            ))}
            {!cfg.events?.length && (
              <div style={{ fontSize: 12, color: C.muted }}>
                Noch keine Events — Gäste sehen den Tab, sobald du welche hinzufügst.
              </div>
            )}
          </Card>

          <Card style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>Galerie (Emoji-Vorschau)</div>
              <button
                type="button"
                onClick={addGallery}
                style={{
                  background: C.mintLight,
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.green,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Plus size={14} /> Foto
              </button>
            </div>
            {(cfg.gallery || []).map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  value={g.emoji || "📸"}
                  onChange={(e) => {
                    const gallery = [...cfg.gallery];
                    gallery[i] = { ...g, emoji: e.target.value };
                    setCfg((p) => ({ ...p, gallery }));
                  }}
                  style={{ ...inputStyle, width: 56, textAlign: "center" }}
                />
                <input
                  value={g.caption}
                  onChange={(e) => {
                    const gallery = [...cfg.gallery];
                    gallery[i] = { ...g, caption: e.target.value };
                    setCfg((p) => ({ ...p, gallery }));
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Beschreibung"
                />
                <button
                  type="button"
                  onClick={() => setCfg((p) => ({ ...p, gallery: p.gallery.filter((_, j) => j !== i) }))}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={16} color={C.muted} />
                </button>
              </div>
            ))}
          </Card>
        </>
      )}

      {section === "pricing" && <SpotloopPricing spotName={spot?.name} />}

      {section === "preview" && (
        <Card
          style={{
            padding: 16,
            marginBottom: 12,
            background: `linear-gradient(160deg, ${spot?.bg_color || C.green}18, ${C.bg})`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.muted,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Eye size={14} /> So sehen Gäste deinen Spot
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.dark, marginBottom: 4 }}>{spot?.name}</div>
          <div style={{ fontSize: 14, color: C.muted }}>{spotCategoryLine(spot)}</div>
          {cfg.tagline && <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{cfg.tagline}</div>}

          <div
            style={{
              marginTop: 14,
              padding: 14,
              background: C.white,
              borderRadius: 14,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Informationen</div>
            <PreviewRow icon={<MapPin size={14} color={C.green} />} label={cfg.address || "— Adresse fehlt —"} missing={!cfg.address?.trim()} />
            <PreviewRow icon={<Clock size={14} color={C.green} />} label={cfg.hours || "— Öffnungszeiten fehlen —"} missing={!cfg.hours?.trim()} />
            {cfg.phone?.trim() && <PreviewRow icon={<Phone size={14} color={C.green} />} label={cfg.phone} />}
          </div>

          {cfg.reservation_url?.trim() ? (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 14px",
                borderRadius: 14,
                background: `linear-gradient(135deg, ${spot?.bg_color || C.green}, ${spot?.bg_color || C.green}cc)`,
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                boxShadow: `0 6px 18px ${spot?.bg_color || C.green}35`,
              }}
            >
              <CalendarDays size={16} />
              Tisch reservieren
              <ChevronRight size={14} style={{ opacity: 0.85 }} />
            </div>
          ) : (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 12, fontStyle: "italic" }}>
              Optional: Link zur Tischreservierung hinzufügen.
            </div>
          )}

          {cfg.welcome && (
            <div style={{ fontSize: 13, color: C.dark, marginTop: 14, lineHeight: 1.55 }}>{cfg.welcome}</div>
          )}

          <div style={{ marginTop: 14, padding: 12, background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green }}>Community</div>
            <div style={{ fontSize: 12, color: C.dark, marginTop: 4, lineHeight: 1.45 }}>
              {cfg.community_message || DEFAULT_PAGE_CONFIG.community_message}
            </div>
          </div>
        </Card>
      )}

      {section !== "preview" && section !== "pricing" && (
        <Btn onClick={save} disabled={saving} variant="dark" style={{ width: "100%" }}>
          <Save size={16} /> {saving ? "Speichern…" : "Spotseite speichern"}
        </Btn>
      )}
    </div>
  );
}

function PreviewRow({ icon, label, missing }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
      <span style={{ marginTop: 2 }}>{icon}</span>
      <span style={{ fontSize: 13, color: missing ? C.muted : C.dark, fontStyle: missing ? "italic" : "normal", lineHeight: 1.45 }}>
        {label}
      </span>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1.5px solid ${C.border}`,
  fontSize: 13,
  fontFamily: "inherit",
};

function Field({ label, value, onChange, placeholder, multiline, type = "text", hint, icon }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {icon}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{label}</div>
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          inputMode={type === "url" ? "url" : undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
      {hint && <div style={{ fontSize: 10, color: C.muted, marginTop: 6, lineHeight: 1.45 }}>{hint}</div>}
    </div>
  );
}
