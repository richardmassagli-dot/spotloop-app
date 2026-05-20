import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { storeSignIn, storeRegister, authErrorMessage } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import { IS_LOCAL_MODE } from "../../lib/config";
import { Screen, Btn, Input, Logo, Alert, C, CARD_GRADIENT } from "../../components/ui";
import { TrustStrip, ConsentRow, PrivacyNote } from "../../components/trust";
import { Shield, Gift, Star, MapPin } from "lucide-react";

const STEP_VARIANTS = {
  enter:  (dir) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? -280 : 280, opacity: 0 }),
};

export default function Login() {
  const [mode, setMode]       = useState("login");
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [name, setName]       = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [regStep, setRegStep] = useState(0);
  const [dir, setDir]         = useState(1);
  const [forgotSent, setForgotSent] = useState(false);

  const reset = (newMode) => {
    setMode(newMode); setError(""); setRegStep(0); setForgotSent(false);
    setEmail(""); setPw(""); setPwConfirm(""); setName(""); setBirthday(""); setConsent(false);
  };

  const passwordsMatch = () => pw === pwConfirm;

  const validatePasswords = () => {
    if (pw.length < 6) { setError("Passwort mindestens 6 Zeichen."); return false; }
    if (!passwordsMatch()) { setError("Passwörter stimmen nicht überein."); return false; }
    return true;
  };

  const handleLogin = async () => {
    if (!email || !pw) { setError("Bitte alle Felder ausfüllen."); return; }
    setLoading(true); setError("");
    try { await storeSignIn(email, pw); }
    catch (e) { setError(authErrorMessage(e, "login")); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email?.trim()) { setError("Bitte deine E-Mail-Adresse eingeben."); return; }
    if (IS_LOCAL_MODE) { setError("Passwort-Reset ist nur mit Supabase möglich (kein Demo-Modus)."); return; }
    setLoading(true); setError(""); setForgotSent(false);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (e) throw e;
      setForgotSent(true);
    } catch (e) {
      setError(authErrorMessage(e, "login"));
    } finally {
      setLoading(false);
    }
  };

  const isBirthdayValid = () => {
    if (!birthday) return false;
    const d = new Date(birthday);
    const age = (Date.now() - d) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 14 && age <= 120;
  };

  const handleRegister = async (role) => {
    if (!email || !pw || !pwConfirm || !name) { setError("Bitte alle Felder ausfüllen."); return; }
    if (!validatePasswords()) return;
    if (role === "guest" && !isBirthdayValid()) { setError("Bitte ein gültiges Geburtsdatum eingeben."); return; }
    if (!consent) { setError("Bitte stimme der Datenschutzerklärung zu."); return; }
    setLoading(true); setError("");
    try { await storeRegister(email, pw, name, role, role === "guest" ? birthday : null); }
    catch (e) { setError(authErrorMessage(e, "register")); } finally { setLoading(false); }
  };

  const nextRegStep = () => {
    if (regStep === 0 && !name) { setError("Bitte deinen Namen eingeben."); return; }
    if (regStep === 1 && !isBirthdayValid()) { setError("Bitte ein gültiges Geburtsdatum eingeben."); return; }
    if (regStep === 2) {
      if (!email) { setError("Bitte E-Mail eingeben."); return; }
      if (!validatePasswords()) return;
    }
    setError("");
    setDir(1);
    setRegStep(s => s + 1);
  };

  const isGuest = mode === "register-guest";
  const isMerchant = mode === "register-merchant";
  const isRegister = isGuest || isMerchant;
  const isForgot = mode === "forgot-password";

  return (
    <Screen bg={C.darkGreen} pad={false}>
      {/* Hero */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 24px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.03)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(19,176,92,.05)", pointerEvents: "none" }} />
        <div style={{ textAlign: "center", position: "relative" }}>
          <Logo size={32} light />
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginTop: 20, lineHeight: 1.15, letterSpacing: -0.8 }}>
            Dein Besuch.<br />
            <span style={{ color: "#7BDFAA" }}>Deine Vorteile.</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", marginTop: 10, lineHeight: 1.5 }}>
            Die smarte Loyalty-App für deine Lieblingsorte.
          </div>

          {/* Value props */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
            {[
              { Icon: Star,  text: "Punkte sammeln" },
              { Icon: Gift,  text: "Rewards" },
              { Icon: MapPin, text: "Spots entdecken" },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ background: "rgba(255,255,255,.08)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                <Icon size={12} color="rgba(255,255,255,.7)" />
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", flex: 1, padding: "24px 24px 0", overflowY: "auto" }}>
        {/* Mode Tabs */}
        {!isForgot && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20, background: C.bg, borderRadius: 12, padding: 4 }}>
          {[["login","Anmelden"],["register-guest","Als Follower"],["register-merchant","Als Spot"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => reset(id)}
              style={{
                flex: 1, background: mode === id ? C.green : "transparent",
                color: mode === id ? "#fff" : C.muted,
                border: "none", borderRadius: 9, padding: "8px 4px",
                fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all .2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        )}

        {error && <Alert type="error">{error}</Alert>}
        {forgotSent && <Alert type="success">Wenn diese E-Mail bei uns registriert ist, erhältst du gleich einen Link zum Zurücksetzen. Bitte auch den Spam-Ordner prüfen.</Alert>}

        {/* ── PASSWORT VERGESSEN ── */}
        {isForgot && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Passwort zurücksetzen</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
              Wir senden dir einen Link per E-Mail. Der Login erfolgt immer mit deiner E-Mail-Adresse (kein separater Benutzername).
            </div>
            <Input label="E-Mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@beispiel.de" />
            <Btn onClick={handleForgotPassword} disabled={loading}>
              {loading ? "Senden…" : "Link senden"}
            </Btn>
            <button
              type="button"
              onClick={() => reset("login")}
              style={{ marginTop: 16, width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", fontWeight: 600 }}
            >
              ← Zur Anmeldung
            </button>
          </div>
        )}

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <div>
            <Input label="E-Mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@beispiel.de" />
            <div style={{ fontSize: 11, color: C.muted, margin: "-8px 0 10px", lineHeight: 1.4 }}>
              Die Anmeldung läuft immer über diese E-Mail-Adresse — es gibt keinen separaten Benutzernamen.
            </div>
            <Input label="Passwort" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
            <button
              type="button"
              onClick={() => {
                const emailKeep = email;
                reset("forgot-password");
                setEmail(emailKeep);
              }}
              style={{
                display: "block", width: "100%", textAlign: "right", background: "none", border: "none",
                color: C.green, fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 14, padding: 0,
              }}
            >
              Passwort vergessen?
            </button>
            <Btn onClick={handleLogin} disabled={loading}>
              {loading ? "Anmelden…" : "Anmelden →"}
            </Btn>
          </div>
        )}

        {/* ── GUEST REGISTRATION ── */}
        {isGuest && (
          <div style={{ overflow: "hidden" }}>
            {/* Step indicator */}
            <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
              {["Name","Geburtstag","Konto","Zustimmung"].map((label, i) => (
                <div key={label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: 4, borderRadius: 2, background: i <= regStep ? C.green : C.border, transition: "background .3s", marginBottom: 4 }} />
                  <div style={{ fontSize: 9, fontWeight: 700, color: i <= regStep ? C.green : C.muted, transition: "color .3s" }}>{label}</div>
                </div>
              ))}
            </div>

            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={regStep}
                custom={dir}
                variants={STEP_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", damping: 26, stiffness: 360 }}
              >
                {/* Step 0: Name */}
                {regStep === 0 && (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Wie heißt du?</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Dein Name erscheint auf deiner Wallet-Karte.</div>
                    <Input label="Dein Name" value={name} onChange={e => setName(e.target.value)} placeholder="Lisa Müller" />
                    <Btn onClick={nextRegStep}>Weiter →</Btn>
                  </div>
                )}

                {/* Step 1: Birthday */}
                {regStep === 1 && (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Wann hast du Geburtstag?</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
                      Spots können dir exklusive Geburtstagsrewards schicken. 🎂
                    </div>
                    <PrivacyNote variant="success">
                      Dein Geburtsdatum wird nur für Geburtstags-Rewards genutzt und ist für Spots nicht sichtbar.
                    </PrivacyNote>
                    <div style={{ height: 12 }} />
                    <Input
                      label="Geburtsdatum"
                      type="date"
                      value={birthday}
                      onChange={e => setBirthday(e.target.value)}
                      max={new Date(Date.now() - 14 * 365.25 * 86400000).toISOString().slice(0,10)}
                    />
                    {/* Birthday reward preview */}
                    <div style={{ background: `${C.orange}10`, border: `1px solid ${C.orange}25`, borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 24 }}>🎂</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: C.orange }}>Geburtstags-Reward</div>
                        <div style={{ fontSize: 11, color: C.muted }}>Erhalte an deinem Geburtstag exklusive Angebote.</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setDir(-1); setRegStep(0); }} style={{ flex: 0.4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 700, color: C.muted, cursor: "pointer" }}>← Zurück</button>
                      <button onClick={nextRegStep} style={{ flex: 1, background: C.green, border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Weiter →</button>
                    </div>
                  </div>
                )}

                {/* Step 2: Email + Password */}
                {regStep === 2 && (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Dein Konto</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Damit du dich von jedem Gerät anmelden kannst.</div>
                    <Input label="E-Mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@beispiel.de" />
                    <Input label="Passwort" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min. 6 Zeichen" />
                    <Input label="Passwort bestätigen" type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="Passwort wiederholen" error={pwConfirm && !passwordsMatch() ? "Passwörter stimmen nicht überein." : undefined} />
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button onClick={() => { setDir(-1); setRegStep(1); }} style={{ flex: 0.4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 700, color: C.muted, cursor: "pointer" }}>← Zurück</button>
                      <button onClick={nextRegStep} style={{ flex: 1, background: C.green, border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Weiter →</button>
                    </div>
                  </div>
                )}

                {/* Step 3: Consent */}
                {regStep === 3 && (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Fast geschafft! 🎉</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Bitte bestätige kurz die Datenschutzvereinbarung.</div>

                    <div style={{ background: C.mintLight, borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
                      {[
                        { icon: "🔒", text: "Daten werden verschlüsselt gespeichert" },
                        { icon: "🚫", text: "Keine Weitergabe an Wettbewerber" },
                        { icon: "🗑️", text: "Jederzeit löschbar — Art. 17 DSGVO" },
                        { icon: "🎂", text: "Geburtsdatum nur für Geburtstags-Rewards" },
                      ].map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 3 ? 8 : 0 }}>
                          <span style={{ flexShrink: 0 }}>{r.icon}</span>
                          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>{r.text}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                      <ConsentRow checked={consent} onChange={setConsent}>
                        Ich stimme der <span style={{ color: C.green, fontWeight: 700 }}>Datenschutzerklärung</span> und der Verarbeitung meiner Daten für das spotloop Loyalty-Programm zu. Ich kann diese Einwilligung jederzeit widerrufen.
                      </ConsentRow>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setDir(-1); setRegStep(2); }} style={{ flex: 0.4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 700, color: C.muted, cursor: "pointer" }}>← Zurück</button>
                      <button
                        onClick={() => handleRegister("guest")}
                        disabled={!consent || loading}
                        style={{ flex: 1, background: consent ? C.green : C.border, border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, color: "#fff", cursor: consent ? "pointer" : "not-allowed", transition: "background .2s" }}
                      >
                        {loading ? "Wird erstellt…" : "Konto erstellen ✓"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ── MERCHANT REGISTRATION ── */}
        {isMerchant && (
          <div>
            <div style={{ background: "#FFF7ED", border: `1px solid ${C.orange}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10 }}>
              <span>🏪</span>
              <div style={{ fontSize: 12, color: C.orange, fontWeight: 600 }}>
                Als Spot: nach Registrierung prüfen wir deinen Betrieb (Verifizierung).
                Erst danach bist du in der Spot-Suche sichtbar und kannst Stempel ausgeben.
              </div>
            </div>
            <Input label="Name deines Spots" value={name} onChange={e => setName(e.target.value)} placeholder="Café Central" />
            <Input label="E-Mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@beispiel.de" />
            <Input label="Passwort" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min. 6 Zeichen" />
            <Input label="Passwort bestätigen" type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="Passwort wiederholen" error={pwConfirm && !passwordsMatch() ? "Passwörter stimmen nicht überein." : undefined} />
            <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
              <ConsentRow checked={consent} onChange={setConsent}>
                Ich stimme den <span style={{ color: C.green, fontWeight: 700 }}>Spot-AGB</span> und der <span style={{ color: C.green, fontWeight: 700 }}>Datenschutzerklärung</span> zu. Ich versichere, dass mein Betrieb real und aktiv ist.
              </ConsentRow>
            </div>
            <Btn onClick={() => handleRegister("merchant")} disabled={!consent || loading} variant="dark">
              {loading ? "Registrieren…" : "Spot-Konto erstellen →"}
            </Btn>
          </div>
        )}

        <div style={{ marginTop: 20, paddingBottom: 32 }}>
          <TrustStrip />
          <div style={{ textAlign: "center", fontSize: 10, color: C.muted, marginTop: 8 }}>
            DSGVO-konform · Daten in der EU · Keine Weitergabe an Dritte
          </div>
        </div>
      </div>
    </Screen>
  );
}
