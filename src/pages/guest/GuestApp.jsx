import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home as HomeIcon, Compass, Wallet, Gift, User, ScanLine } from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";
import Home from "./Home";
import Discover from "./Discover";
import WalletScreen from "./WalletScreen";
import RewardsMarket from "./RewardsMarket";
import Profile from "./Profile";
import CheckInPage from "./CheckIn";
import SpotDetail from "./SpotDetail";

const NAV = [
  { id: "home",     Icon: HomeIcon, label: "Home" },
  { id: "discover", Icon: Compass,  label: "Entdecken" },
  { id: "checkin",  Icon: ScanLine, label: "Scan", center: true },
  { id: "wallet",   Icon: Wallet,   label: "Wallet" },
  { id: "profile",  Icon: User,     label: "Profil" },
];

export default function GuestApp({ onLogout }) {
  const [tab, setTab]         = useState("home");
  const [spotId, setSpotId]   = useState(null);
  const [overlay, setOverlay] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("checkin");
    if (cid) { setSpotId(cid); setOverlay("checkin"); }
  }, []);

  const goToSpot    = (id) => { setSpotId(id); setOverlay("spot"); };
  const goToCheckin = (id) => { setSpotId(id || null); setOverlay("checkin"); };
  const closeOverlay = () => { setOverlay(null); setSpotId(null); };

  const handleTabClick = (id) => {
    if (id === "checkin") { goToCheckin(); return; }
    setOverlay(null);
    setTab(id);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", background: C.bg }}>
      {/* ── Screens ── */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative", overflowX: "hidden" }}>
        <AnimatePresence mode="wait" initial={false}>
          {!overlay && (
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              style={{ height: "100%" }}
            >
              {tab === "home"     && <Home     onSpotClick={goToSpot} onCheckin={() => goToCheckin()} />}
              {tab === "discover" && <Discover onSpotClick={goToSpot} />}
              {tab === "wallet"   && <WalletScreen onSpotClick={goToSpot} />}
              {tab === "rewards"  && <RewardsMarket onSpotClick={goToSpot} />}
              {tab === "profile"  && <Profile  onLogout={onLogout} />}
            </motion.div>
          )}
        </AnimatePresence>

        {overlay === "checkin" && <CheckInPage spotId={spotId} onBack={closeOverlay} />}
        {overlay === "spot"    && <SpotDetail  spotId={spotId} onBack={closeOverlay} onCheckin={() => setOverlay("checkin")} />}
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNav activeTab={overlay ? null : tab} onTab={handleTabClick} />
    </div>
  );
}

function BottomNav({ activeTab, onTab }) {
  return (
    <div style={{
      background: "rgba(247,249,255,.96)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderTop: `1px solid ${C.border}`,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "8px 4px 20px",
      flexShrink: 0,
      zIndex: 100,
      boxShadow: "0 -1px 0 rgba(226,232,245,.8)",
    }}>
      {NAV.map(({ id, Icon, label, center }) => {
        const isActive = activeTab === id;

        if (center) {
          return (
            <button
              key={id}
              onClick={() => onTab(id)}
              style={{
                width: 52, height: 52, borderRadius: 16,
                background: CARD_GRADIENT,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 6px 20px rgba(27,79,216,.35)`,
                marginTop: -10, flexShrink: 0,
              }}
            >
              <Icon size={22} color="#fff" strokeWidth={2} />
            </button>
          );
        }

        return (
          <button
            key={id}
            onClick={() => onTab(id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "4px 10px", flex: 1,
            }}
          >
            <motion.div
              animate={{ background: isActive ? "#EFF6FF" : "transparent" }}
              transition={{ duration: 0.18 }}
              style={{ width: 44, height: 30, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Icon size={20} color={isActive ? C.green : C.muted} strokeWidth={isActive ? 2.5 : 1.8} />
            </motion.div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 500, color: isActive ? C.green : C.muted, transition: "color .15s" }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
