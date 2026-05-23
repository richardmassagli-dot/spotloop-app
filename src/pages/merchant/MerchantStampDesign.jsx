import { useState, useEffect, useMemo } from "react";
import { Save, Palette } from "lucide-react";
import { C, Btn, Card, Alert } from "../../components/ui";
import StampCard from "../../components/stamp/StampCard";
import { formatDbError } from "../../lib/firestore";
import { saveStampCardDesign, getStoredStampDesign } from "../../lib/stampDesign";

const BG_COLORS = ["#0B7A3E", "#1E3A5F", "#7B2D8B", "#C75B00", "#1A1A2E", "#2D6A4F", "#1B4FD8", "#B91C1C"];
const REWARDS = ["Gratis Kaffee", "Gratis Drink", "Gratis Dessert", "10% Rabatt", "Gratis Brezel", "Gratis Snack"];
const EMOJIS = ["☕", "🍹", "🍕", "🥐", "🍔", "🍵", "🍷", "🥗", "🍰", "🍺"];
const POINT_OPTIONS = ["5", "8", "10", "12", "15"];

export default function MerchantStampDesign({ spotId, spot }) {
  const [emoji, setEmoji] = useState(spot?.emoji || "☕");
  const [bgColor, setBgColor] = useState(spot?.bg_color || BG_COLORS[0]);
  const [reward, setReward] = useState(spot?.reward_text || "");
  const [customReward, setCustomReward] = useState("");
  const [pts, setPts] = useState(String(spot?.max_points ?? 10));
  const [action, setAction] = useState(spot?.current_action || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = spot?.id ? getStoredStampDesign(spot.id) : null;
    const src = stored || spot?.page_config?.stamp_design || spot;
    setEmoji(src?.emoji || spot?.emoji || "☕");
    setBgColor(src?.bg_color || spot?.bg_color || BG_COLORS[0]);
    const rt = src?.reward_text || spot?.reward_text || "";
    setReward(REWARDS.includes(rt) ? rt : "");
    setCustomReward(REWARDS.includes(rt) ? "" : rt);
    setPts(String(src?.max_points ?? spot?.max_points ?? 10));
    setAction((src?.current_action ?? spot?.current_action) || "");
  }, [spot?.id, spot?.emoji, spot?.bg_color, spot?.reward_text, spot?.max_points, spot?.current_action, spot?.page_config]);

  const rewardText = customReward.trim() || reward || "Gratis Kaffee";
  const maxPoints = Math.max(1, parseInt(pts, 10) || 10);

  const previewSpot = useMemo(
    () => ({
      ...spot,
      emoji,
      bg_color: bgColor,
      reward_text: rewardText,
      max_points: maxPoints,
      current_action: action.trim() || null,
    }),
    [spot, emoji, bgColor, rewardText, maxPoints, action]
  );

  const previewStamp = useMemo(
    () => ({
      points: Math.min(maxPoints - 1, Math.max(1, Math.floor(maxPoints / 3))),
      max_points: maxPoints,
      reward_text: rewardText,
      reward_ready: false,
      spot: previewSpot,
    }),
    [maxPoints, rewardText, previewSpot]
  );

  const save = async () => {
    if (!spotId) {
      setError("Kein Spot geladen — bitte Seite neu laden.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveStampCardDesign(spotId, {
        emoji,
        bg_color: bgColor,
        reward_text: rewardText,
        max_points: maxPoints,
        current_action: action.trim() || null,
      });
      window.dispatchEvent(new Event("spotloop:spot-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(formatDbError(e) || e?.message || "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Treue-Karte designen</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.45 }}>
        Farbe, Emoji, Reward und Besuchsanzahl — so sehen Gäste deine Karte in Wallet & Check-in.
      </div>

      {error && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {saved && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="success">Treue-Karte gespeichert ✓</Alert>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <StampCard stamp={previewStamp} spot={previewSpot} variant="full" showCta={false} />
      </div>

      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Palette size={14} color={C.green} /> Karten-Farbe
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {BG_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setBgColor(color)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: color,
                border: "none",
                cursor: "pointer",
                boxShadow: bgColor === color ? `0 0 0 3px #fff, 0 0 0 5px ${color}` : `0 2px 8px ${C.shadow}`,
              }}
              aria-label={`Farbe ${color}`}
            />
          ))}
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Spot-Emoji</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              style={{
                fontSize: 24,
                width: 44,
                height: 44,
                borderRadius: 12,
                background: emoji === e ? C.mintLight : C.bg,
                border: `1.5px solid ${emoji === e ? C.green : C.border}`,
                cursor: "pointer",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Reward bei voller Karte</div>
        {REWARDS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setReward(r);
              setCustomReward("");
            }}
            style={{
              width: "100%",
              textAlign: "left",
              background: reward === r && !customReward ? C.mintLight : C.white,
              border: `1.5px solid ${reward === r && !customReward ? C.green : C.border}`,
              borderRadius: 12,
              padding: "10px 12px",
              marginBottom: 6,
              fontSize: 13,
              fontWeight: 600,
              color: C.dark,
              cursor: "pointer",
            }}
          >
            {r}
          </button>
        ))}
        <input
          value={customReward}
          onChange={(e) => {
            setCustomReward(e.target.value);
            setReward("");
          }}
          placeholder="Eigener Reward, z.B. Gratis Vorspeise"
          style={{
            width: "100%",
            marginTop: 8,
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${customReward ? C.green : C.border}`,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
      </Card>

      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Besuche bis Reward</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {POINT_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPts(p)}
              style={{
                flex: "1 1 56px",
                minWidth: 56,
                padding: "11px 8px",
                background: pts === p ? C.green : C.white,
                color: pts === p ? "#fff" : C.dark,
                border: `1.5px solid ${pts === p ? C.green : C.border}`,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Aktuelle Aktion (optional)</div>
        <input
          value={action}
          onChange={(e) => setAction(e.target.value.slice(0, 80))}
          placeholder="z.B. Doppelte Besuche am Mittwoch"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${C.border}`,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Erscheint auf der Treue-Karte und in My Spots.</div>
      </Card>

      <Btn onClick={save} disabled={saving} variant="dark" style={{ width: "100%" }}>
        <Save size={16} /> {saving ? "Speichern…" : "Treue-Karte speichern"}
      </Btn>
    </div>
  );
}
