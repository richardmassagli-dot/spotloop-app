import { useState, useEffect } from "react";
import { CalendarDays, ExternalLink } from "lucide-react";
import { C, Card, Btn, Alert } from "../ui";
import { getStoredPageConfig, saveSpotPageConfig } from "../../lib/spotPage";
import { parseSpotDescription } from "../../lib/spotGuestFeed";

/** Link zur Tischreservierung — sichtbar auf Übersicht & Spotseite */
export default function ReservationLinkEditor({ spotId, spot, onOpenSpotPage, onSaved }) {
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const local = getStoredPageConfig(spotId);
    const page = spot?.description ? parseSpotDescription(spot.description).page : {};
    setUrl(local.reservation_url || page?.reservation_url || spot?.reservation_url || "");
  }, [spotId, spot?.description, spot?.reservation_url]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const cfg = getStoredPageConfig(spotId);
      const trimmed = url.trim();
      await saveSpotPageConfig(spotId, { ...cfg, reservation_url: trimmed });
      onSaved?.(trimmed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.message || "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const preview = url.trim()
    ? /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`
    : null;

  return (
    <Card style={{ marginBottom: 16, padding: 16, border: `1.5px solid ${C.mint}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: C.mintLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CalendarDays size={22} color={C.green} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Link zur Tischreservierung</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.45 }}>
            Gäste sehen in deinem Spot-Profil einen Button „Tisch reservieren“.
          </div>
        </div>
      </div>

      <input
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://booking.com/… · OpenTable · Resmio …"
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: `1.5px solid ${C.border}`,
          fontSize: 14,
          fontFamily: "inherit",
          marginBottom: 10,
        }}
      />

      {error && (
        <div style={{ marginBottom: 10 }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {saved && (
        <div style={{ marginBottom: 10 }}>
          <Alert type="success">Reservierungs-Link gespeichert ✓</Alert>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn onClick={save} disabled={saving} variant="dark" full={false} style={{ flex: 1, minWidth: 140 }}>
          {saving ? "Speichern…" : "Link speichern"}
        </Btn>
        {onOpenSpotPage && (
          <button
            type="button"
            onClick={onOpenSpotPage}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              background: C.white,
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              cursor: "pointer",
            }}
          >
            Spotseite →
          </button>
        )}
      </div>

      {preview && (
        <a
          href={preview}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            fontSize: 12,
            fontWeight: 700,
            color: C.green,
            textDecoration: "none",
          }}
        >
          <ExternalLink size={14} />
          Link testen
        </a>
      )}
    </Card>
  );
}
