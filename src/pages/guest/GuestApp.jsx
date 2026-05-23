import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home as HomeIcon, Compass, Wallet, User, ScanLine } from "lucide-react";
import { C } from "../../components/ui";
import BottomNav from "../../components/BottomNav";
import Home from "./Home";
import Discover from "./Discover";
import GuestWalletSimple from "./GuestWalletSimple";
import Profile from "./Profile";
import MySpots from "./MySpots";
import CheckInPage from "./CheckIn";
import SpotDetail from "./SpotDetail";
import { useLocale } from "../../context/LocaleContext";

export default function GuestApp({ onLogout }) {
  const { t } = useLocale();
  const NAV = [
    { id: "home", Icon: HomeIcon, label: t("common.home") },
    { id: "discover", Icon: Compass, label: t("common.discover") },
    { id: "checkin", Icon: ScanLine, label: t("common.scan"), center: true },
    { id: "wallet", Icon: Wallet, label: t("common.wallet") },
    { id: "profile", Icon: User, label: t("common.profile") },
  ];
  const [tab, setTab] = useState("home");
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [spotId, setSpotId] = useState(null);
  const [spotInitialTab, setSpotInitialTab] = useState("overview");
  const [overlay, setOverlay] = useState(null);
  const [mySpotsInitialFilter, setMySpotsInitialFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("checkin");
    if (cid) {
      setSpotId(cid);
      setOverlay("checkin");
    }
  }, []);

  const goToSpot = (id, opts = {}) => {
    setSpotId(id);
    setSpotInitialTab(opts.tab || "overview");
    setOverlay("spot");
  };
  const goToCheckin = (id) => {
    setSpotId(id || null);
    setOverlay("checkin");
  };
  const closeOverlay = () => {
    setOverlay(null);
    setSpotId(null);
    setSpotInitialTab("overview");
  };

  const handleTabClick = (id) => {
    if (id === "checkin") {
      goToCheckin();
      return;
    }
    setOverlay(null);
    setTab(id);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: C.bg,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow:
            !overlay && tab === "discover"
              ? "hidden"
              : overlay === "myspots"
                ? "hidden"
                : "auto",
          position: "relative",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!overlay && (
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              style={{
                flex: tab === "discover" ? 1 : undefined,
                minHeight: tab === "discover" ? 0 : "100%",
                height: tab === "discover" ? "100%" : undefined,
                display: tab === "discover" ? "flex" : "block",
                flexDirection: "column",
              }}
            >
              {tab === "home" && (
                <Home
                  onSpotClick={goToSpot}
                  onCheckin={(id) => goToCheckin(id)}
                  onDiscover={() => {
                    setOverlay(null);
                    setTab("discover");
                  }}
                  onWallet={() => {
                    setOverlay(null);
                    setTab("wallet");
                  }}
                />
              )}
              {tab === "discover" && <Discover onSpotClick={goToSpot} />}
              {tab === "wallet" && (
                <GuestWalletSimple onSpotClick={goToSpot} onScan={() => goToCheckin()} />
              )}
              {tab === "profile" && (
                <Profile
                  onLogout={onLogout}
                  initialPrivacy={openPrivacy}
                  onPrivacyOpened={() => setOpenPrivacy(false)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {overlay === "checkin" && (
          <CheckInPage
            spotId={spotId}
            onBack={closeOverlay}
            onSpotDetected={(id) => setSpotId(id)}
            onComplete={() => {
              closeOverlay();
              setTab("wallet");
            }}
          />
        )}
        {overlay === "spot" && (
          <SpotDetail
            spotId={spotId}
            initialTab={spotInitialTab}
            onBack={closeOverlay}
            onCheckin={() => setOverlay("checkin")}
            onSwitchSpot={(id) => setSpotId(id)}
          />
        )}
        {overlay === "myspots" && (
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <MySpots
              onBack={closeOverlay}
              initialFilter={mySpotsInitialFilter}
              onSpotClick={(id) => {
                setSpotId(id);
                setOverlay("spot");
              }}
              onWallet={() => {
                setOverlay(null);
                setTab("wallet");
              }}
            />
          </div>
        )}
      </div>

      <BottomNav nav={NAV} activeTab={overlay ? null : tab} onTab={handleTabClick} />
    </div>
  );
}
