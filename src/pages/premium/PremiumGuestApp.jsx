import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PremiumAppProvider } from "../../context/PremiumAppContext";
import BottomNav from "../../components/premium/BottomNav";
import PremiumHome from "./PremiumHome";
import PremiumWallet from "./PremiumWallet";
import PremiumMap from "./PremiumMap";
import PremiumFeed from "./PremiumFeed";
import PremiumQRScanner from "./PremiumQRScanner";
import PremiumSpotDetail from "./PremiumSpotDetail";

function PremiumShell({ onLogout }) {
  const [tab, setTab] = useState("home");
  const [overlay, setOverlay] = useState(null); // scan | spot
  const [spotId, setSpotId] = useState(null);

  const openSpot = (id) => {
    setSpotId(id);
    setOverlay("spot");
  };

  const openScan = () => setOverlay("scan");

  const handleTab = (id) => {
    if (id === "scan") {
      openScan();
      return;
    }
    setOverlay(null);
    setSpotId(null);
    setTab(id);
  };

  const handleScanSuccess = (id) => {
    setSpotId(id);
    setOverlay("spot");
  };

  return (
    <div className="flex h-full flex-col bg-[#FAFAF8]">
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!overlay && (
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {tab === "home" && (
                <PremiumHome onSpotClick={openSpot} onSeeMap={() => setTab("map")} onLogout={onLogout} />
              )}
              {tab === "map" && <PremiumMap onSpotClick={openSpot} />}
              {tab === "wallet" && <PremiumWallet onSpotClick={openSpot} />}
              {tab === "feed" && <PremiumFeed onSpotClick={openSpot} />}
            </motion.div>
          )}
        </AnimatePresence>

        {overlay === "spot" && spotId && (
          <div className="absolute inset-0 z-20 bg-[#FAFAF8]">
            <PremiumSpotDetail
              spotId={spotId}
              onBack={() => { setOverlay(null); setSpotId(null); }}
              onScan={openScan}
            />
          </div>
        )}

        {overlay === "scan" && (
          <div className="absolute inset-0 z-30">
            <PremiumQRScanner
              onClose={() => setOverlay(null)}
              onSuccess={handleScanSuccess}
            />
          </div>
        )}
      </div>

      {!overlay && <BottomNav active={tab} onTab={handleTab} />}
    </div>
  );
}

export default function PremiumGuestApp({ onLogout }) {
  return (
    <PremiumAppProvider>
      <PremiumShell onLogout={onLogout} />
    </PremiumAppProvider>
  );
}
