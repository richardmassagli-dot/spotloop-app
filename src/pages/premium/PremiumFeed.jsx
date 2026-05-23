import { motion } from "framer-motion";
import { Gift, Sparkles, Zap } from "lucide-react";
import { Card } from "../../components/premium/ui";
import { PREMIUM_FEED, spotById } from "../../data/premiumDemo";

const ICONS = { action: Zap, new: Sparkles, reward: Gift };
const COLORS = { action: "#7C5CFF", new: "#42B8A6", reward: "#FF6B5A" };

export default function PremiumFeed({ onSpotClick }) {
  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF8]">
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-[#0B1F3A] tracking-tight">Feed</h1>
        <p className="text-sm text-[#5A6478] mt-0.5">Neuigkeiten von deinen Spots</p>
      </header>

      <div className="px-5 pb-8 space-y-3">
        {PREMIUM_FEED.map((item, i) => {
          const spot = spotById(item.spotId);
          const Icon = ICONS[item.type] || Sparkles;
          const color = COLORS[item.type];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card onClick={() => onSpotClick(item.spotId)} className="p-4">
                <div className="flex gap-3">
                  {spot && (
                    <img src={spot.heroImage} alt="" className="h-12 w-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <span className="text-[10px] font-semibold text-[#9AA3B5]">{item.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#0B1F3A] mt-2 leading-snug">{item.text}</p>
                    {spot && <p className="text-xs text-[#5A6478] mt-1">{spot.name}</p>}
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
