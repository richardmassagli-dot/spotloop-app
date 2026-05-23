import { useState, useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { getSpot } from "./lib/firestore";
import Login from "./pages/auth/Login";
import MerchantSetup from "./pages/merchant/MerchantSetup";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantVerificationPending from "./pages/merchant/MerchantVerificationPending";
import { isMerchantVerified } from "./lib/merchantVerification";
import GuestApp from "./pages/guest/GuestApp";
import Onboarding from "./pages/Onboarding";
import AppShell from "./components/AppShell";
import { C, Spinner } from "./components/ui";
import { IS_LOCAL_MODE } from "./lib/config";

const ONBOARDING_KEY = "myspot_onboarding_done";

function signalAppReady() {
  if (typeof window === "undefined") return;
  window.__spotloopAppReady = true;
  document.getElementById("spotloop-boot")?.remove();
  window.dispatchEvent(new Event("spotloop-app-ready"));
}

function App() {
  const { user, profile, logout, loading } = useAuth();
  const [merchantSpot, setMerchantSpot] = useState(undefined);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [merchantLoadSlow, setMerchantLoadSlow] = useState(false);
  const readySignaled = useRef(false);

  useEffect(() => {
    if (user && profile?.role !== "merchant") {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) setShowOnboarding(true);
    }
  }, [user, profile]);

  const merchantUid = user?.uid;
  const isMerchant = profile?.role === "merchant";

  useEffect(() => {
    if (!loading) {
      if (!readySignaled.current) {
        readySignaled.current = true;
        signalAppReady();
      }
    }
  }, [loading]);

  useEffect(() => {
    if (!merchantUid || !isMerchant) {
      setMerchantSpot(undefined);
      setMerchantLoadSlow(false);
      return undefined;
    }

    setMerchantLoadSlow(false);
    const slowHint = setTimeout(() => setMerchantLoadSlow(true), 5000);

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setMerchantSpot((prev) => (prev === undefined ? null : prev));
      }
    }, 10000);

    getSpot(merchantUid)
      .then((spot) => {
        if (!cancelled) setMerchantSpot(spot ?? null);
      })
      .catch(() => {
        if (!cancelled) setMerchantSpot(null);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearTimeout(slowHint);
    };
  }, [merchantUid, isMerchant]);

  const handleOnboardingDone = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          minHeight: "100dvh",
          gap: 16,
          background: C.bg,
        }}
      >
        <Spinner size={40} color={C.blue} />
        <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>Spotloop wird geladen…</div>
      </div>
    );
  }

  const localBanner = IS_LOCAL_MODE ? (
    <div style={{
      background: "#FEF3C7", color: "#92400E", padding: "8px 14px", fontSize: 12, fontWeight: 600,
      textAlign: "center", borderBottom: "1px solid #FDE68A",
    }}>
      Demo-Modus (localStorage) — für echte Daten: Supabase in .env.local einrichten → siehe PRODUCTION.md
    </div>
  ) : null;

  if (!user) {
    return (
      <AppShell banner={localBanner}>
        <Login />
      </AppShell>
    );
  }

  if (profile?.role === "merchant") {
    if (merchantSpot === undefined) {
      return (
        <AppShell banner={localBanner}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              minHeight: "100dvh",
              gap: 12,
              background: C.bg,
            }}
          >
            <Spinner size={40} color={C.blue} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>Dashboard wird geladen…</span>
            {merchantLoadSlow && (
              <div style={{ marginTop: 8, textAlign: "center", maxWidth: 280 }}>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.45, margin: "0 0 12px" }}>
                  Verbindung dauert länger als üblich. Du kannst abmelden und es erneut versuchen.
                </p>
                <button
                  type="button"
                  onClick={() => logout()}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.dark,
                    cursor: "pointer",
                  }}
                >
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </AppShell>
      );
    }
    if (!merchantSpot) {
      return (
        <AppShell banner={localBanner}>
          <MerchantSetup onDone={() => getSpot(user.uid).then((s) => setMerchantSpot(s ?? null))} />
        </AppShell>
      );
    }
    if (!isMerchantVerified(merchantSpot)) {
      return (
        <AppShell banner={localBanner}>
          <MerchantVerificationPending
            spot={merchantSpot}
            onRefresh={setMerchantSpot}
            onLogout={logout}
          />
        </AppShell>
      );
    }
    return (
      <AppShell banner={localBanner}>
        <MerchantDashboard onLogout={logout} />
      </AppShell>
    );
  }

  if (showOnboarding) {
    return (
      <AppShell banner={localBanner}>
        <Onboarding onDone={handleOnboardingDone} />
      </AppShell>
    );
  }

  return (
    <AppShell banner={localBanner}>
      <GuestApp onLogout={logout} />
    </AppShell>
  );
}

export default App;
