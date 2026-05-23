import { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  INITIAL_WALLET,
  PREMIUM_REWARD_HISTORY,
  spotById,
  walletCardView,
} from "../data/premiumDemo";

const PremiumAppContext = createContext(null);

export function PremiumAppProvider({ children }) {
  const [wallet, setWallet] = useState(INITIAL_WALLET);
  const [rewardHistory, setRewardHistory] = useState(PREMIUM_REWARD_HISTORY);
  const [lastScan, setLastScan] = useState(null);

  const walletViews = useMemo(() => wallet.map(walletCardView).filter(Boolean), [wallet]);

  const addStamp = useCallback((spotId) => {
    const spot = spotById(spotId);
    if (!spot) return null;

    let result = null;
    setWallet((prev) => {
      const idx = prev.findIndex((c) => c.spotId === spotId);
      if (idx >= 0) {
        const card = prev[idx];
        const nextPts = Math.min(card.points + 1, card.maxPoints);
        result = { spot, points: nextPts, maxPoints: card.maxPoints, rewardReady: nextPts >= card.maxPoints };
        const next = [...prev];
        next[idx] = { ...card, points: nextPts };
        return next;
      }
      result = { spot, points: 1, maxPoints: spot.maxPoints, rewardReady: false };
      return [...prev, { spotId, points: 1, maxPoints: spot.maxPoints }];
    });
    setLastScan(result);
    return result;
  }, []);

  const redeemReward = useCallback((spotId) => {
    const spot = spotById(spotId);
    setWallet((prev) =>
      prev.map((c) =>
        c.spotId === spotId ? { ...c, points: 0 } : c
      )
    );
    if (spot) {
      setRewardHistory((h) => [
        {
          id: `r-${Date.now()}`,
          spotId,
          title: spot.rewardText,
          date: new Date().toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" }),
          pointsUsed: spot.maxPoints,
        },
        ...h,
      ]);
    }
  }, []);

  const value = {
    wallet,
    walletViews,
    rewardHistory,
    lastScan,
    clearLastScan: () => setLastScan(null),
    addStamp,
    redeemReward,
  };

  return (
    <PremiumAppContext.Provider value={value}>
      {children}
    </PremiumAppContext.Provider>
  );
}

export const usePremiumApp = () => {
  const ctx = useContext(PremiumAppContext);
  if (!ctx) throw new Error("usePremiumApp requires PremiumAppProvider");
  return ctx;
};
