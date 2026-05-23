import { motion } from "framer-motion";
import { Home, Map, Wallet, Newspaper, Plus } from "lucide-react";
import { cn } from "./ui";

const TABS = [
  { id: "home", Icon: Home, label: "Home" },
  { id: "map", Icon: Map, label: "Map" },
  { id: "scan", Icon: Plus, label: "", center: true },
  { id: "wallet", Icon: Wallet, label: "Wallet" },
  { id: "feed", Icon: Newspaper, label: "Feed" },
];

export default function BottomNav({ active, onTab }) {
  return (
    <nav className="shrink-0 border-t border-[#EEECE8] bg-white/95 backdrop-blur-xl px-2 pt-2 pb-6 safe-bottom">
      <div className="flex items-end justify-around max-w-[390px] mx-auto">
        {TABS.map(({ id, Icon, label, center }) => {
          if (center) {
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTab(id)}
                aria-label="QR scannen"
                className="relative -mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] via-[#3B82F6] to-[#42B8A6] text-white shadow-[0_10px_28px_rgba(124,92,255,0.45)]"
              >
                <Icon size={26} strokeWidth={2.5} />
              </button>
            );
          }

          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTab(id)}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <motion.div
                animate={{ backgroundColor: isActive ? "#EFF6FF" : "transparent" }}
                className="flex h-9 w-11 items-center justify-center rounded-xl"
              >
                <Icon size={20} className={cn(isActive ? "text-[#3B82F6]" : "text-[#9AA3B5]")} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={cn("text-[10px] font-semibold", isActive ? "text-[#0B1F3A]" : "text-[#9AA3B5]")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
