import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { storeSignIn, storeRegister, authErrorMessage } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import { IS_LOCAL_MODE } from "../../lib/config";
import { Alert, C } from "../../components/ui";
import { TrustStrip, ConsentRow, PrivacyNote } from "../../components/trust";
import {
  AuthShell,
  AuthHero,
  AuthFormPanel,
  AuthTabBar,
  AuthField,
  AuthPrimaryBtn,
  AuthSecondaryBtn,
  AuthStepIndicator,
  AuthSectionTitle,
  AuthInfoCard,
} from "../../components/auth/AuthChrome";
import { Shield, Gift, Star, MapPin, Store } from "lucide-react";

const STEP_VARIANTS = {
  enter: (dir) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -280 : 280, opacity: 0 }),
};

const AUTH_TABS = [
  { id: "login", label: "Anmelden" },
  { id: "register-guest", label: "Gast" },
  { id: "register-merchant", label: "Spot" },
];

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [regStep, setRegStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [forgotSent, setForgotSent] = useState(false);

  const reset = (newMode) => {
    setMode(newMode);
    setError("");
    setInfo("");
    setRegStep(0);
    setForgotSent(false);
    setEmail("");
    setPw("");
    setPwConfirm("");
    setName("");
    setBirthday("");
    setConsent(false);
  };

  const passwordsMatch = () => pw === pwConfirm;

  const validatePasswords = () => {
    if (pw.length < 6) {
      setError("Passwort mindestens 6 Zeichen.");
      return false;
    }
    if (!passwordsMatch()) {
      setError("Passwörter stimmen nicht überein.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!email || !pw) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const result = await storeSignIn(email, pw);
      if (!result?.session && !IS_LOCAL_MODE) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError(authErrorMessage({ code: "no_session" }, "login"));
        }
      }
    } catch (e) {
      setError(authErrorMessage(e, "login"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email?.trim()) {
      setError("Bitte deine E-Mail-Adresse eingeben.");
      return;
    }
    if (IS_LOCAL_MODE) {
      setError("Passwort-Reset ist nur mit Supabase möglich (kein Demo-Modus).");
      return;
    }
    setLoading(true);
    setError("");
    setForgotSent(false);
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
    if (!email || !pw || !pwConfirm || !name) {
      setError("Bitte alle Felder ausfüllen.");
      return;
    }
    if (!validatePasswords()) return;
    if (role === "guest" && !isBirthdayValid()) {
      setError("Bitte ein gültiges Geburtsdatum eingeben.");
      return;
    }
    if (!consent) {
      setError("Bitte stimme der Datenschutzerklärung zu.");
      return;
    }
    setLoading(true);
    setError("");
    setInfo("");
    try {
      await storeRegister(email, pw, name, role, role === "guest" ? birthday : null);
    } catch (e) {
      if (e?.code === "email_confirmation_required") {
        setInfo(authErrorMessage(e, "register"));
      } else {
        setError(authErrorMessage(e, "register"));
      }
    } finally {
      setLoading(false);
    }
  };

  const nextRegStep = () => {
    if (regStep === 0 && !name) {
      setError("Bitte deinen Namen eingeben.");
      return;
    }
    if (regStep === 1 && !isBirthdayValid()) {
      setError("Bitte ein gültiges Geburtsdatum eingeben.");
      return;
    }
    if (regStep === 2) {
      if (!email) {
        setError("Bitte E-Mail eingeben.");
        return;
      }
      if (!validatePasswords()) return;
    }
    setError("");
    setDir(1);
    setRegStep((s) => s + 1);
  };

  const isGuest = mode === "register-guest";
  const isMerchant = mode === "register-merchant";
  const isForgot = mode === "forgot-password";

  return (
    <AuthShell>
      <AuthHero
        variant={isMerchant ? "merchant" : "guest"}
        chips={
          isMerchant
            ? [
                { Icon: Store, text: "Direkt zu Gästen" },
                { Icon: Shield, text: "Kein Algorithmus" },
              ]
            : [
                { Icon: Star, text: "Stempel sammeln" },
                { Icon: Gift, text: "Rewards" },
                { Icon: MapPin, text: "Spots entdecken" },
              ]
        }
      />

      <AuthFormPanel>
        {!isForgot && <AuthTabBar tabs={AUTH_TABS} active={mode} onChange={reset} />}

        {error && <Alert type="error">{error}</Alert>}
        {info && <Alert type="success">{info}</Alert>}
        {forgotSent && (
          <Alert type="success">
            Wenn diese E-Mail bei uns registriert ist, erhältst du gleich einen Link zum Zurücksetzen.
            Bitte auch den Spam-Ordner prüfen.
          </Alert>
        )}
        {isMerchant && !IS_LOCAL_MODE && !info && (
          <Alert type="info">
            Nach der Registrierung ggf. zuerst den Bestätigungslink in der E-Mail öffnen.
          </Alert>
        )}

        {isForgot && (
          <div>
            <AuthSectionTitle
              title="Passwort zurücksetzen"
              subtitle="Wir senden dir einen Link per E-Mail. Die Anmeldung läuft immer über deine E-Mail-Adresse."
            />
            <AuthField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
            />
            <AuthPrimaryBtn onClick={handleForgotPassword} disabled={loading} loading={loading}>
              {loading ? "Senden…" : "Link senden"}
            </AuthPrimaryBtn>
            <button
              type="button"
              onClick={() => reset("login")}
              style={{
                marginTop: 18,
                width: "100%",
                background: "none",
                border: "none",
                color: C.blue,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ← Zur Anmeldung
            </button>
          </div>
        )}

        {mode === "login" && (
          <div>
            <AuthSectionTitle title="Willkommen zurück" subtitle="Melde dich mit deiner E-Mail an." />
            <AuthField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              hint="Kein separater Benutzername — nur deine E-Mail."
            />
            <AuthField
              label="Passwort"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => {
                const emailKeep = email;
                reset("forgot-password");
                setEmail(emailKeep);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "right",
                background: "none",
                border: "none",
                color: C.blue,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 16,
                padding: 0,
              }}
            >
              Passwort vergessen?
            </button>
            <AuthPrimaryBtn onClick={handleLogin} disabled={loading} loading={loading}>
              {loading ? "Anmelden…" : "Anmelden →"}
            </AuthPrimaryBtn>

            <div
              style={{
                marginTop: 20,
                padding: "14px 16px",
                borderRadius: 16,
                background: "linear-gradient(165deg, #EFF6FF 0%, #FFFFFF 100%)",
                border: `1px solid ${C.border}`,
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <Shield size={20} color={C.blue} />
              <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, fontWeight: 600 }}>
                Privacy-first · DSGVO · Deine Daten bleiben unter deiner Kontrolle
              </span>
            </div>
          </div>
        )}

        {isGuest && (
          <div style={{ overflow: "hidden" }}>
            <AuthStepIndicator steps={["Name", "Geburtstag", "Konto", "Zustimmung"]} current={regStep} />

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
                {regStep === 0 && (
                  <div>
                    <AuthSectionTitle
                      title="Wie heißt du?"
                      subtitle="Dein Name erscheint in deiner Wallet."
                    />
                    <AuthField
                      label="Dein Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Lisa Müller"
                    />
                    <AuthPrimaryBtn onClick={nextRegStep}>Weiter →</AuthPrimaryBtn>
                  </div>
                )}

                {regStep === 1 && (
                  <div>
                    <AuthSectionTitle
                      title="Wann hast du Geburtstag?"
                      subtitle="Spots können dir exklusive Geburtstags-Rewards schicken."
                    />
                    <PrivacyNote variant="success">
                      Dein Geburtsdatum ist für Spots nicht sichtbar — nur für Rewards.
                    </PrivacyNote>
                    <div style={{ height: 12 }} />
                    <AuthField
                      label="Geburtsdatum"
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      max={new Date(Date.now() - 14 * 365.25 * 86400000).toISOString().slice(0, 10)}
                    />
                    <AuthInfoCard
                      emoji="🎂"
                      title="Geburtstags-Reward"
                      text="An deinem Tag exklusive Angebote von deinen Lieblingsspots."
                      accent={C.orange}
                    />
                    <div style={{ display: "flex", gap: 10 }}>
                      <AuthSecondaryBtn onClick={() => { setDir(-1); setRegStep(0); }}>
                        ← Zurück
                      </AuthSecondaryBtn>
                      <div style={{ flex: 1 }}>
                        <AuthPrimaryBtn onClick={nextRegStep}>Weiter →</AuthPrimaryBtn>
                      </div>
                    </div>
                  </div>
                )}

                {regStep === 2 && (
                  <div>
                    <AuthSectionTitle
                      title="Dein Konto"
                      subtitle="Damit du dich von jedem Gerät anmelden kannst."
                    />
                    <AuthField
                      label="E-Mail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@beispiel.de"
                    />
                    <AuthField
                      label="Passwort"
                      type="password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="Min. 6 Zeichen"
                    />
                    <AuthField
                      label="Passwort bestätigen"
                      type="password"
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      placeholder="Passwort wiederholen"
                      error={pwConfirm && !passwordsMatch() ? "Passwörter stimmen nicht überein." : undefined}
                    />
                    <div style={{ display: "flex", gap: 10 }}>
                      <AuthSecondaryBtn onClick={() => { setDir(-1); setRegStep(1); }}>
                        ← Zurück
                      </AuthSecondaryBtn>
                      <div style={{ flex: 1 }}>
                        <AuthPrimaryBtn onClick={nextRegStep}>Weiter →</AuthPrimaryBtn>
                      </div>
                    </div>
                  </div>
                )}

                {regStep === 3 && (
                  <div>
                    <AuthSectionTitle title="Fast geschafft" subtitle="Bitte bestätige die Datenschutzvereinbarung." />
                    <div
                      style={{
                        borderRadius: 18,
                        padding: "14px 16px",
                        marginBottom: 16,
                        background: "linear-gradient(165deg, #ECFEFF 0%, #FFFFFF 100%)",
                        border: `1px solid ${C.fresh}30`,
                      }}
                    >
                      {[
                        { icon: "🔒", text: "Verschlüsselte Speicherung" },
                        { icon: "🚫", text: "Keine Weitergabe an Wettbewerber" },
                        { icon: "🗑️", text: "Jederzeit löschbar (DSGVO)" },
                        { icon: "🎂", text: "Geburtstag nur für Rewards" },
                      ].map((r, i) => (
                        <div
                          key={r.text}
                          style={{
                            display: "flex",
                            gap: 10,
                            marginBottom: i < 3 ? 10 : 0,
                            alignItems: "center",
                          }}
                        >
                          <span>{r.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{r.text}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        background: C.white,
                        borderRadius: 16,
                        padding: "14px 16px",
                        marginBottom: 16,
                        border: `1px solid ${C.border}`,
                        boxShadow: "0 2px 10px rgba(10,22,40,.04)",
                      }}
                    >
                      <ConsentRow checked={consent} onChange={setConsent}>
                        Ich stimme der{" "}
                        <span style={{ color: C.blue, fontWeight: 800 }}>Datenschutzerklärung</span> und der
                        Verarbeitung für das spotloop Loyalty-Programm zu.
                      </ConsentRow>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <AuthSecondaryBtn onClick={() => { setDir(-1); setRegStep(2); }}>
                        ← Zurück
                      </AuthSecondaryBtn>
                      <div style={{ flex: 1 }}>
                        <AuthPrimaryBtn
                          onClick={() => handleRegister("guest")}
                          disabled={!consent || loading}
                          loading={loading}
                        >
                          {loading ? "Wird erstellt…" : "Konto erstellen ✓"}
                        </AuthPrimaryBtn>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {isMerchant && (
          <div>
            <AuthSectionTitle
              title="Spot-Konto erstellen"
              subtitle="Direkter Kanal zu deinen Stammkunden — ohne Algorithmus, ohne Aufwand."
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Store size={18} color={C.blue} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Für Cafés, Restaurants & lokale Spots</span>
            </div>
            <AuthField
              label="Name deines Spots"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Café Central"
            />
            <AuthField
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kontakt@cafe.de"
            />
            <AuthField
              label="Passwort"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Min. 6 Zeichen"
            />
            <AuthField
              label="Passwort bestätigen"
              type="password"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              placeholder="Passwort wiederholen"
              error={pwConfirm && !passwordsMatch() ? "Passwörter stimmen nicht überein." : undefined}
            />
            <div
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "14px 16px",
                marginBottom: 16,
                border: `1px solid ${C.border}`,
              }}
            >
              <ConsentRow checked={consent} onChange={setConsent}>
                Ich stimme den <span style={{ color: C.blue, fontWeight: 800 }}>AGB</span> und der{" "}
                <span style={{ color: C.blue, fontWeight: 800 }}>Datenschutzerklärung</span> zu.
              </ConsentRow>
            </div>
            <AuthPrimaryBtn
              onClick={() => handleRegister("merchant")}
              disabled={!consent || loading}
              loading={loading}
              variant="dark"
            >
              {loading ? "Registrieren…" : "Spot-Konto erstellen →"}
            </AuthPrimaryBtn>
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 8 }}>
          <TrustStrip />
          <div style={{ textAlign: "center", fontSize: 10, color: C.muted, marginTop: 10, fontWeight: 600 }}>
            DSGVO-konform · EU-Datenhaltung · Privacy-first
          </div>
        </div>
      </AuthFormPanel>
    </AuthShell>
  );
}
