import { motion } from "framer-motion";
import { ArrowLeft, Minus } from "lucide-react";
import { Card } from "../../components/premium/ui";
import { usePremiumApp } from "../../context/PremiumAppContext";
import { spotById } from "../../data/premiumDemo";

export default function PremiumRewardHistory({ onBack }) {
  const { rewardHistory } = usePremiumApp();

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF8]">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#EEECE8] shadow-sm"
        >
          <ArrowLeft size={20} className="text-[#0B1F3A]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0B1F3A]">Reward History</h1>
          <p className="text-xs text-[#5A6478]">Eingelöste Vorteile</p>
        </div>
      </header>

      <div className="px-5 pb-8 space-y-3">
        {rewardHistory.map((item, i) => {
          const spot = spotById(item.spotId);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex gap-3">
                  {spot && (
                    <img
                      src={spot.heroImage}
                      alt=""
                      className="h-14 w-14 rounded-2xl object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#0B1F3A] text-sm">{item.title}</p>
                    <p className="text-xs text-[#5A6478] mt-0.5">{spot?.name}</p>
                    <p className="text-[11px] text-[#9AA3B5] mt-1">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF6B5A] font-bold text-sm shrink-0">
                    <Minus size={14} />
                    {item.pointsUsed}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
