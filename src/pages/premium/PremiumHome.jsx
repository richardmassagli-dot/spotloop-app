import { motion } from "framer-motion";
import { ChevronRight, Gift, MapPin, Star, Zap } from "lucide-react";
import BalanceCard from "../../components/premium/BalanceCard";
import { Card, SectionTitle } from "../../components/premium/ui";
import { PREMIUM_BENEFITS, PREMIUM_SPOTS, PREMIUM_USER } from "../../data/premiumDemo";
import { usePremiumApp } from "../../context/PremiumAppContext";

const BENEFIT_ICONS = { zap: Zap, gift: Gift, sparkles: Star };

export default function PremiumHome({ onSpotClick, onSeeMap, onLogout }) {
  const { walletViews } = usePremiumApp();
  const totalPoints = walletViews.reduce((a, c) => a + c.points, 0) + 120;
  const recommended = PREMIUM_SPOTS.filter((s) => s.trending);
  const discover = PREMIUM_SPOTS.slice(0, 3);

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF8] pb-4">
      <header className="px-5 pt-12 pb-4 flex justify-between items-start">
        <div>
          <p className="text-sm text-[#5A6478]">{PREMIUM_USER.greeting}</p>
          <h1 className="text-2xl font-bold text-[#0B1F3A] tracking-tight">
            {PREMIUM_USER.name} 👋
          </h1>
        </div>
        {onLogout && (
          <button type="button" onClick={onLogout} className="text-xs font-semibold text-[#9AA3B5] mt-1">
            Abmelden
          </button>
        )}
      </header>

      <div className="px-5 space-y-6">
        <BalanceCard points={totalPoints} />

        <section>
          <SectionTitle title="Deine Vorteile" action="Alle" />
          <div className="space-y-2.5">
            {PREMIUM_BENEFITS.map((b, i) => {
              const Icon = BENEFIT_ICONS[b.icon] || Gift;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="flex items-center gap-3 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${b.color}18` }}>
                      <Icon size={20} style={{ color: b.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0B1F3A] text-sm">{b.title}</p>
                      <p className="text-xs text-[#5A6478] truncate">{b.subtitle}</p>
                    </div>
                    <ChevronRight size={18} className="text-[#C5CAD4] shrink-0" />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionTitle title="Entdecke neue Spots" action="Map" onAction={onSeeMap} />
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {discover.map((spot) => (
              <button
                key={spot.id}
                type="button"
                onClick={() => onSpotClick(spot.id)}
                className="shrink-0 w-[200px] overflow-hidden rounded-3xl bg-white border border-[#EEECE8] shadow-[0_4px_20px_rgba(11,31,58,0.06)] text-left"
              >
                <div className="relative h-28">
                  <img src={spot.heroImage} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/70 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white">{spot.category}</span>
                </div>
                <div className="p-3">
                  <p className="font-bold text-[#0B1F3A] text-sm truncate">{spot.name}</p>
                  <p className="text-[11px] text-[#5A6478] flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {spot.distance}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="Für dich empfohlen" />
          <div className="space-y-3">
            {recommended.map((spot, i) => (
              <motion.div key={spot.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                <Card onClick={() => onSpotClick(spot.id)} className="overflow-hidden p-0">
                  <div className="flex">
                    <img src={spot.heroImage} alt="" className="h-24 w-24 object-cover shrink-0" />
                    <div className="p-3.5 min-w-0 flex-1">
                      <p className="font-bold text-[#0B1F3A]">{spot.name}</p>
                      <p className="text-xs text-[#5A6478]">{spot.category} · {spot.area}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-0.5 font-semibold text-[#0B1F3A]">
                          <Star size={12} className="text-[#FF6B5A] fill-[#FF6B5A]" /> {spot.rating}
                        </span>
                        <span className="text-[#42B8A6] font-semibold">{spot.openLabel}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
