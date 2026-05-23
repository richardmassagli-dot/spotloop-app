import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { ProgressBar } from "./ui";

export default function StackedWallet({ cards, onCardClick }) {
  if (!cards.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#E8E8E4] bg-white p-10 text-center">
        <p className="text-sm font-semibold text-[#0B1F3A]">Noch keine Karten</p>
        <p className="text-xs text-[#5A6478] mt-1">Scanne einen Spot-QR mit dem Plus-Button</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[320px]" style={{ height: 220 + (cards.length - 1) * 28 }}>
      {cards.map((card, i) => {
        const offset = i * 28;
        const z = cards.length - i;
        const { spot, points, maxPoints, nextReward, rewardReady } = card;

        return (
          <motion.button
            key={card.spotId}
            type="button"
            onClick={() => onCardClick?.(card.spotId)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, top: offset }}
            transition={{ delay: i * 0.06 }}
            className="absolute left-0 right-0 rounded-3xl p-4 text-left text-white shadow-[0_12px_32px_rgba(11,31,58,0.18)]"
            style={{
              top: offset,
              zIndex: z,
              background: spot.gradient,
              transform: `scale(${1 - i * 0.02})`,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-semibold text-white/75 uppercase tracking-wide">Stempelkarte</p>
                <p className="text-lg font-bold mt-0.5">{spot.name}</p>
                <p className="text-xs text-white/80">{spot.category}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{points}<span className="text-sm font-semibold opacity-70">/{maxPoints}</span></p>
              </div>
            </div>

            <div className="mt-3">
              <ProgressBar value={points} max={maxPoints} color="#fff" />
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
              <Gift size={14} />
              {rewardReady ? "Reward bereit!" : `Nächster: ${nextReward}`}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
