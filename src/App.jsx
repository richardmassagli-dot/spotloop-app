import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { getSpot } from "./lib/firestore";
import Login from "./pages/auth/Login";
import MerchantSetup from "./pages/merchant/MerchantSetup";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantVerificationPending from "./pages/merchant/MerchantVerificationPending";
import { isMerchantVerified } from "./lib/merchantVerification";
import GuestApp from "./pages/guest/GuestApp";
import Onboarding from "./pages/Onboarding";
import { C, Spinner } from "./components/ui";
import { IS_LOCAL_MODE } from "./lib/config";

const ONBOARDING_KEY = "myspot_onboarding_done";

function App() {
  const { user, profile, logout, loading } = useAuth();
  const [merchantSpot, setMerchantSpot] = useState(undefined);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && profile?.role !== "merchant") {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) setShowOnboarding(true);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user && profile?.role === "merchant") {
      getSpot(user.uid).then(spot => setMerchantSpot(spot ?? null));
    }
  }, [user, profile]);

  const handleOnboardingDone = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", background: "#0F3D3E" }}>
      <Spinner size={48} color="#fff" />
    </div>
  );

  const localBanner = IS_LOCAL_MODE ? (
    <div style={{
      background: "#FEF3C7", color: "#92400E", padding: "8px 14px", fontSize: 12, fontWeight: 600,
      textAlign: "center", borderBottom: "1px solid #FDE68A",
    }}>
      Demo-Modus (localStorage) — für echte Daten: Supabase in .env.local einrichten → siehe PRODUCTION.md
    </div>
  ) : null;

  if (!user) return (
    <>
      {localBanner}
      <Login />
    </>
  );

  if (profile?.role === "merchant") {
    if (merchantSpot === undefined) return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Spinner size={40} />
      </div>
    );
    if (!merchantSpot) {
      return (
        <>
          {localBanner}
          <MerchantSetup onDone={() => getSpot(user.uid).then(s => setMerchantSpot(s ?? null))} />
        </>
      );
    }
    if (!isMerchantVerified(merchantSpot)) {
      return (
        <>
          {localBanner}
          <MerchantVerificationPending
            spot={merchantSpot}
            onRefresh={setMerchantSpot}
            onLogout={logout}
          />
        </>
      );
    }
    return <>{localBanner}<MerchantDashboard onLogout={logout} /></>;
  }

  if (showOnboarding) return <>{localBanner}<Onboarding onDone={handleOnboardingDone} /></>;

  return <>{localBanner}<GuestApp onLogout={logout} /></>;
}

export default App;
