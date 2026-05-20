import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createSpot } from "../../lib/firestore";
import { Screen, Btn, Input, Logo, C, Card, Alert } from "../../components/ui";

const CATEGORIES = ["☕ Café", "🍹 Bar", "🍕 Restaurant", "🥐 Bäckerei", "🍔 Imbiss", "🍵 Teehaus"];
const REWARDS    = ["Gratis Kaffee", "Gratis Drink", "Gratis Dessert", "10% Rabatt", "Gratis Brezel", "Gratis Snack"];
const BG_COLORS  = ["#0B7A3E", "#1E3A5F", "#7B2D8B", "#C75B00", "#1A1A2E", "#2D6A4F"];

export default function MerchantSetup({ onDone }) {
  const { user, profile } = useAuth();
  const [step, setStep]   = useState(0);
  const [cat, setCat]     = useState("");
  const [reward, setReward] = useState("");
  const [pts, setPts]     = useState("10");
  const [area, setArea]   = useState("");
  const [address, setAddress] = useState("");
  const [desc, setDesc]   = useState("");
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const spotName = profile?.name || "Mein Spot";

  const finish = async () => {
    setLoading(true);
    setError("");
    try {
      await createSpot(user.uid, {
        name:        spotName,
        category:    cat,
        area,
        address,
        description: desc,
        reward_text: reward,
        max_points:  parseInt(pts),
        emoji:       cat.split(" ")[0],
        bg_color:    bgColor,
        isActive:    true,
      });
      onDone();
    } catch (e) {
      setError(e?.message || "Spot konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Profil", "Reward", "Fertig!"];

  return (
    <Screen bg={C.bg} pad={false}>
      {/* Header */}
      <div style={{ background: C.darkGreen, padding: "20px 24px 20px" }}>
        <Logo size={22} light />
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 12 }}>Spot-Setup</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Schritt {step + 1} von {steps.length}</div>
        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 99, background: i <= step ? C.fresh : "rgba(255,255,255,.2)" }} />
              <div style={{ fontSize: 9, color: i <= step ? C.fresh : "rgba(255,255,255,.3)", marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 24px" }}>
        {error && <Alert type="error">{error}</Alert>}
        {/* Step 0 – Profil */}
        {step === 0 && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Profil anlegen</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Wie ist dein Spot?</div>

            <div style={{ fontSize: 12, fontWeight: 700, color: C.mid, marginBottom: 8 }}>Kategorie</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    background: cat === c ? C.green : C.white,
                    color: cat === c ? "#fff" : C.mid,
                    border: `1.5px solid ${cat === c ? C.green : C.border}`,
                    borderRadius: 10, padding: "8px 14px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >{c}</button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: C.mid, marginBottom: 8 }}>Karten-Farbe</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {BG_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setBgColor(color)}
                  style={{
                    width: 36, height: 36, borderRadius: 10, background: color, border: "none", cursor: "pointer",
                    boxShadow: bgColor === color ? `0 0 0 3px #fff, 0 0 0 5px ${color}` : "none",
                  }}
                />
              ))}
            </div>

            <Input label="Stadtteil / Viertel" value={area} onChange={e => setArea(e.target.value)} placeholder="z.B. Mitte, Schwabing, Altstadt" />
            <Input label="Adresse" value={address} onChange={e => setAddress(e.target.value)} placeholder="Hauptstr. 12, 70173 Stuttgart" />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.mid, marginBottom: 5 }}>Kurzbeschreibung (optional)</div>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Unser Café in Stuttgart-Mitte..."
                rows={3}
                style={{ width: "100%", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: C.dark, outline: "none", resize: "none", fontFamily: "inherit" }}
              />
            </div>
            <Btn onClick={() => cat && setStep(1)} disabled={!cat}>Weiter →</Btn>
          </>
        )}

        {/* Step 1 – Reward */}
        {step === 1 && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Reward festlegen</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Was bekommen treue Gäste?</div>

            <div style={{ fontSize: 12, fontWeight: 700, color: C.mid, marginBottom: 8 }}>Dein Reward</div>
            {REWARDS.map(r => (
              <div
                key={r}
                onClick={() => setReward(r)}
                style={{
                  background: reward === r ? C.mint : C.white,
                  border: `1.5px solid ${reward === r ? C.green : C.border}`,
                  borderRadius: 12, padding: "11px 14px", marginBottom: 6,
                  cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{r}</span>
                {reward === r && <span style={{ color: C.green }}>✓</span>}
              </div>
            ))}

            <div style={{ fontSize: 12, fontWeight: 700, color: C.mid, marginTop: 16, marginBottom: 8 }}>Punkte bis zum Reward</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["5", "8", "10", "12"].map(p => (
                <button
                  key={p}
                  onClick={() => setPts(p)}
                  style={{
                    flex: 1, padding: "11px",
                    background: pts === p ? C.green : C.white,
                    color: pts === p ? "#fff" : C.dark,
                    border: `1.5px solid ${pts === p ? C.green : C.border}`,
                    borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                  }}
                >{p}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setStep(0)} style={{ flex: 1 }}>← Zurück</Btn>
              <Btn onClick={() => reward && setStep(2)} disabled={!reward} style={{ flex: 2 }}>Weiter →</Btn>
            </div>
          </>
        )}

        {/* Step 2 – Done */}
        {step === 2 && (
          <>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Fast fertig!</div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>
                {spotName} wird nach manueller Prüfung auf spotloop sichtbar.<br />
                Dein Dashboard und QR-Code stehen nach der Freischaltung bereit.
              </div>
            </div>
            <Card style={{ marginBottom: 16 }}>
              {[
                ["🏪 Spot",      spotName],
                ["📂 Kategorie", cat],
                ["📍 Stadtteil", area || "–"],
                ["🎁 Reward",    reward],
                ["⭐ Punkte",    `${pts} Stempel`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{v}</span>
                </div>
              ))}
            </Card>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Zurück</Btn>
              <Btn onClick={finish} disabled={loading} style={{ flex: 2 }}>
                {loading ? "Wird erstellt…" : "Zur Verifizierung einreichen →"}
              </Btn>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
