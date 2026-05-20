import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { IS_LOCAL_MODE } from "../../lib/config";
import { emitAuthFromSession } from "../../lib/store";
import { Screen, Btn, Input, Logo, Alert, C, CARD_GRADIENT } from "../../components/ui";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (IS_LOCAL_MODE) return undefined;

    let cancelled = false;

    const armRecoverySession = (session) => {
      if (cancelled || !session?.user) return;
      setReady(true);
      emitAuthFromSession(session);
    };

    const looksLikeRecoveryUrl = () => {
      if (typeof window === "undefined") return false;
      const hash = window.location.hash ?? "";
      return (
        hash.includes("type=recovery") ||
        hash.includes("recovery") ||
        hash.includes("access_token")
      );
    };

    const init = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        const { data: before } = await supabase.auth.getSession();
        if (cancelled) return;
        if (before.session?.user && looksLikeRecoveryUrl()) {
          armRecoverySession(before.session);
          return;
        }

        // PKCE / E-Mail-Link mit ?code= (wenn noch keine Session in localStorage)
        if (code && !before.session?.user) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (!error && data.session?.user) {
            armRecoverySession(data.session);
            url.searchParams.delete("code");
            window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
            return;
          }
        }

        const { data: after } = await supabase.auth.getSession();
        if (cancelled) return;
        if (after.session?.user && looksLikeRecoveryUrl()) {
          armRecoverySession(after.session);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "Recovery-Link konnte nicht verarbeitet werden.");
      }
    };

    void init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" && session?.user) armRecoverySession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSave = async () => {
    setError("");
    if (pw.length < 6) { setError("Passwort mindestens 6 Zeichen."); return; }
    if (pw !== pw2) { setError("Passwörter stimmen nicht überein."); return; }
    setLoading(true);
    try {
      if (IS_LOCAL_MODE) throw new Error("Nur mit Supabase-Konto möglich.");
      const { error: e } = await supabase.auth.updateUser({ password: pw });
      if (e) throw e;
      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => navigate("/", { replace: true }), 1800);
    } catch (e) {
      setError(e?.message ?? "Speichern fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  if (IS_LOCAL_MODE) {
    return (
      <Screen bg={C.darkGreen}>
        <Alert type="error">Passwort-Reset gibt es nur mit Supabase (kein Demo-Modus).</Alert>
        <Btn onClick={() => navigate("/")}>Zur Anmeldung</Btn>
      </Screen>
    );
  }

  if (!ready) {
    return (
      <Screen bg={C.darkGreen} pad={false}>
        <div style={{ background: CARD_GRADIENT, padding: "40px 24px", textAlign: "center" }}>
          <Logo size={32} light />
          <p style={{ color: "rgba(255,255,255,.85)", marginTop: 16, fontSize: 14, lineHeight: 1.5 }}>
            Öffne den Link aus der Passwort-E-Mail. Wenn du schon geklickt hast, warte einen Moment — oder kehre zur Anmeldung zurück und fordere eine neue E-Mail an.
          </p>
        </div>
        <div style={{ padding: 24 }}>
          <Btn variant="ghost" onClick={() => navigate("/")}>← Zur Anmeldung</Btn>
        </div>
      </Screen>
    );
  }

  return (
    <Screen bg={C.darkGreen} pad={false}>
      <div style={{ background: CARD_GRADIENT, padding: "40px 24px", textAlign: "center" }}>
        <Logo size={32} light />
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginTop: 16 }}>Neues Passwort</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 8 }}>Wähle ein sicheres Passwort.</div>
      </div>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", flex: 1, padding: 24 }}>
        {success && <Alert type="success">Passwort gespeichert. Du wirst weitergeleitet…</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        {!success && (
          <>
            <Input label="Neues Passwort" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min. 6 Zeichen" />
            <Input label="Passwort bestätigen" type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Wiederholen" />
            <Btn onClick={handleSave} disabled={loading}>
              {loading ? "Speichern…" : "Passwort speichern"}
            </Btn>
          </>
        )}
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{ marginTop: 16, width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer" }}
        >
          Zur Anmeldung
        </button>
      </div>
    </Screen>
  );
}
