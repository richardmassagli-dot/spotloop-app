import { useState } from "react";
import { runDevBootstrap } from "../lib/bootstrap";
import { ENABLE_DEV_BOOTSTRAP, IS_LOCAL_MODE } from "../lib/config";
import { Btn, Alert, C } from "./ui";

export default function DevBootstrapPanel({ onDone, compact = false }) {
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!ENABLE_DEV_BOOTSTRAP && !IS_LOCAL_MODE) return null;

  const run = async () => {
    setLoading(true);
    setMsg("");
    setOk(null);
    try {
      const result = await runDevBootstrap();
      setOk(result.ok);
      setMsg(result.message);
      if (result.ok) onDone?.();
    } catch (e) {
      setOk(false);
      setMsg(e?.message || "Bootstrap fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      marginTop: compact ? 10 : 14,
      padding: compact ? "12px 14px" : "16px",
      background: "#EFF6FF",
      border: `1px solid ${C.blue}30`,
      borderRadius: 14,
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
        Test-Zugang (Admin + Spot-Freigabe)
      </div>
      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: "0 0 12px" }}>
        Ein Klick: Admin-Rechte + eigener Spot verifiziert — damit du als Follower und als Spot ohne Wartezeit testen kannst.
        Voraussetzung: deine E-Mail steht in Supabase <code style={{ fontSize: 11 }}>app_bootstrap_emails</code> (Migration 004).
      </p>
      <Btn onClick={run} disabled={loading} small={compact} variant="secondary">
        {loading ? "Wird eingerichtet…" : "Admin & Verifizierung aktivieren"}
      </Btn>
      {msg && (
        <div style={{ marginTop: 10 }}>
          <Alert type={ok ? "success" : "error"}>{msg}</Alert>
        </div>
      )}
    </div>
  );
}
