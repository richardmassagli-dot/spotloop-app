import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isAppAdminAccess } from "../../lib/admin";
import { getPendingSpotsForAdmin, adminApproveSpotRpc } from "../../lib/firestore";
import { supabase } from "../../lib/supabase";
import { IS_LOCAL_MODE } from "../../lib/config";
import { Btn, Alert, C, Spinner } from "../../components/ui";

export default function AdminSpots() {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [loadList, setLoadList] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const triedRefresh = useRef(false);

  const admin = Boolean(user && isAppAdminAccess(user, session));

  const load = () => {
    setLoadList(true);
    setErr("");
    getPendingSpotsForAdmin()
      .then(setSpots)
      .catch((e) => setErr(e.message ?? "Laden fehlgeschlagen"))
      .finally(() => setLoadList(false));
  };

  // Nach is_admin in der DB: altes JWT kennt den Claim oft noch nicht — einmal refreshSession
  useEffect(() => {
    if (loading || IS_LOCAL_MODE || !session?.user || admin) return;
    if (triedRefresh.current) return;
    triedRefresh.current = true;
    let cancelled = false;
    (async () => {
      setRefreshing(true);
      try {
        await supabase.auth.refreshSession();
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session?.user, session?.access_token, admin]);

  useEffect(() => {
    if (loading || !user || !admin) return;
    queueMicrotask(() => load());
  }, [loading, user, admin]);

  const handleRefreshSession = async () => {
    triedRefresh.current = false;
    setRefreshing(true);
    try {
      await supabase.auth.refreshSession();
    } finally {
      setRefreshing(false);
      triedRefresh.current = true;
    }
  };

  const approve = async (id) => {
    setBusyId(id);
    setErr("");
    try {
      await adminApproveSpotRpc(id);
      setSpots((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e.message ?? "Freischaltung fehlgeschlagen. Ist die SQL-Migration ausgeführt und bist du als Admin eingetragen?");
    } finally {
      setBusyId(null);
    }
  };

  if (loading || refreshing) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 400 }}>
        <p>Bitte zuerst anmelden (beliebiger Account).</p>
        <Btn onClick={() => navigate("/")}>Zur Anmeldung</Btn>
      </div>
    );
  }

  if (!admin) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 520 }}>
        <h2 style={{ color: C.dark, marginTop: 0 }}>Kein Zugriff</h2>
        <p style={{ color: C.muted, lineHeight: 1.5 }}>
          Eingeloggt als: <strong>{user.email ?? user.id}</strong>
        </p>
        <p style={{ color: C.muted, lineHeight: 1.5 }}>
          Die Admin-Ansicht braucht <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>is_admin: true</code> in den
          User-Metadaten (Supabase → Authentication → Users). Direkt nach dem Setzen im Dashboard oder per SQL ist oft eine <strong>neue Session</strong> nötig.
        </p>
        {!IS_LOCAL_MODE && (
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Btn onClick={handleRefreshSession} full={false}>Session aktualisieren</Btn>
            <Btn variant="ghost" onClick={() => navigate("/")} full={false}>Zur App</Btn>
          </div>
        )}
        {IS_LOCAL_MODE && (
          <div style={{ marginTop: 16 }}>
            <Btn onClick={() => navigate("/")}>Zur App</Btn>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F8", padding: 20, fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Spot-Freischaltung</h1>
        <p style={{ color: "#64748B", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
          Ausstehende Spots (<strong>pending</strong>). Mit <strong>Freischalten</strong> wird in der Datenbank{" "}
          <strong>verified</strong> gesetzt — der Spot wird für Follower sichtbar (siehe RLS).
        </p>
        <button
          type="button"
          onClick={load}
          style={{ marginBottom: 16, fontSize: 13, fontWeight: 600, color: C.green, background: "none", border: "none", cursor: "pointer" }}
        >
          Liste aktualisieren
        </button>
        {err && (
          <div style={{ marginBottom: 12 }}>
            <Alert type="error">{err}</Alert>
          </div>
        )}
        {loadList ? (
          <Spinner />
        ) : spots.length === 0 ? (
          <p style={{ color: "#64748B" }}>Keine ausstehenden Spots.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {spots.map((s) => (
              <li
                key={s.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: 700 }}>{s.name || "Ohne Namen"}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, wordBreak: "break-all" }}>
                  ID: {s.id}
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{s.address || "—"}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                  Angelegt: {s.created_at ? new Date(s.created_at).toLocaleString("de-DE") : "—"}
                </div>
                <div style={{ marginTop: 12 }}>
                  <Btn onClick={() => approve(s.id)} disabled={busyId === s.id}>
                    {busyId === s.id ? "…" : "Freischalten"}
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontWeight: 600 }}
          >
            ← Zur App
          </button>
        </div>
      </div>
    </div>
  );
}
