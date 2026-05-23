import { useState, useEffect } from "react";
import { C, Btn, Alert } from "../../components/ui";
import { saveStampCardDesign } from "../../lib/stampDesign";
import StampCard from "../../components/stamp/StampCard";
import { formatDbError } from "../../lib/firestore";

const STAMP_OPTIONS = ["5", "8", "10", "12", "15"];

export default function MerchantRewardSimple({ spotId, spot }) {
  const [stamps, setStamps] = useState(String(spot?.max_points ?? 10));
  const [reward, setReward] = useState(spot?.reward_text || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStamps(String(spot?.max_points ?? 10));
    setReward(spot?.reward_text || "");
  }, [spot?.max_points, spot?.reward_text]);

  const save = async () => {
    if (!spotId) return;
    if (!reward.trim()) {
      setError("Bitte einen Reward eingeben.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveStampCardDesign(spotId, {
        emoji: spot?.emoji || "☕",
        bg_color: spot?.bg_color || "#1B4FD8",
        reward_text: reward.trim(),
        max_points: Math.max(1, parseInt(stamps, 10) || 10),
        current_action: null,
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

  const fieldStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: `1.5px solid ${C.border}`,
    fontSize: 16,
    fontFamily: "inherit",
    color: C.dark,
    boxSizing: "border-box",
    marginBottom: 16,
  };

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {saved && (
        <div style={{ marginBottom: 12 }}>
          <Alert type="success">Gespeichert</Alert>
        </div>
      )}

      <label style={{ display: "block", fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        Wie viele Besuche?
      </label>
      <select value={stamps} onChange={(e) => setStamps(e.target.value)} style={fieldStyle}>
        {STAMP_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n} Besuche
          </option>
        ))}
      </select>

      <label style={{ display: "block", fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        Was ist der Reward?
      </label>
      <input
        type="text"
        value={reward}
        onChange={(e) => setReward(e.target.value)}
        placeholder="z. B. Gratis Kaffee"
        style={fieldStyle}
      />

      <Btn onClick={save} disabled={saving} style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 800, marginBottom: 20 }}>
        {saving ? "Speichern…" : "Speichern"}
      </Btn>

      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Vorschau (Member-Ansicht)</div>
      <StampCard
        stamp={{
          points: Math.max(0, parseInt(stamps, 10) - 2),
          max_points: parseInt(stamps, 10) || 10,
          reward_ready: false,
          reward_text: reward.trim() || "Reward",
        }}
        spot={{
          name: spot?.name || "Dein Spot",
          emoji: spot?.emoji || "☕",
          bg_color: spot?.bg_color || "#1B4FD8",
          reward_text: reward.trim() || "Reward",
        }}
        variant="full"
        showCta={false}
      />
    </div>
  );
}
