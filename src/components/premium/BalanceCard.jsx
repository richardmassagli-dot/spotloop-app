import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PREMIUM_USER } from "../../data/premiumDemo";

export default function BalanceCard({ points = PREMIUM_USER.totalPoints }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-5 text-white shadow-[0_12px_40px_rgba(124,92,255,0.35)]"
      style={{ background: "linear-gradient(135deg, #7C5CFF 0%, #3B82F6 45%, #42B8A6 100%)" }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/8" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/75">{PREMIUM_USER.balanceLabel}</p>
          <p className="mt-1 text-4xl font-black tracking-tight">{points}</p>
          <p className="mt-1 text-sm text-white/80">Punkte bei allen Spots</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <Sparkles size={22} className="text-white" />
        </div>
      </div>

      <div className="relative mt-4 flex gap-2">
        {["Wallet", "Rewards", "Map"].map((t) => (
          <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold backdrop-blur-sm">
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
