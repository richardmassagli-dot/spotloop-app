import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History } from "lucide-react";
import StackedWallet from "../../components/premium/StackedWallet";
import { SectionTitle } from "../../components/premium/ui";
import { usePremiumApp } from "../../context/PremiumAppContext";
import PremiumRewardHistory from "./PremiumRewardHistory";

export default function PremiumWallet({ onSpotClick }) {
  const { walletViews } = usePremiumApp();
  const [showHistory, setShowHistory] = useState(false);

  if (showHistory) {
    return <PremiumRewardHistory onBack={() => setShowHistory(false)} />;
  }

  const readyCount = walletViews.filter((c) => c.rewardReady).length;

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF8]">
      <header className="px-5 pt-12 pb-2">
        <h1 className="text-2xl font-bold text-[#0B1F3A] tracking-tight">Wallet</h1>
        <p className="text-sm text-[#5A6478] mt-0.5">Deine Stempelkarten — wie Apple Wallet</p>
      </header>

      <div className="px-5 py-4">
        <StackedWallet cards={walletViews} onCardClick={onSpotClick} />
      </div>

      <div className="px-5 pb-6 space-y-4">
        {readyCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-[#FF6B5A]/15 to-[#7C5CFF]/15 border border-[#FF6B5A]/25 p-4"
          >
            <p className="text-sm font-bold text-[#0B1F3A]">
              {readyCount} Reward{readyCount > 1 ? "s" : ""} bereit
            </p>
            <p className="text-xs text-[#5A6478] mt-0.5">Zeig die Karte beim nächsten Besuch</p>
          </motion.div>
        )}

        <section>
          <SectionTitle
            title="Reward History"
            action="Alle anzeigen"
            onAction={() => setShowHistory(true)}
          />
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="w-full flex items-center gap-3 rounded-2xl bg-white border border-[#EEECE8] p-4 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <History size={20} className="text-[#3B82F6]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#0B1F3A]">Eingelöste Rewards</p>
              <p className="text-xs text-[#5A6478]">Datum, Spot & Punkte</p>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}
