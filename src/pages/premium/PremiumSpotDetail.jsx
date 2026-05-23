import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, Clock } from "lucide-react";
import { GradientButton, ProgressBar, Card } from "../../components/premium/ui";
import { spotById } from "../../data/premiumDemo";
import { usePremiumApp } from "../../context/PremiumAppContext";

export default function PremiumSpotDetail({ spotId, onBack, onScan }) {
  const spot = spotById(spotId);
  const { walletViews, addStamp } = usePremiumApp();
  const card = walletViews.find((c) => c.spotId === spotId);
  const points = card?.points ?? 0;
  const maxPoints = card?.maxPoints ?? spot?.maxPoints ?? 8;

  if (!spot) return null;

  const handleStamp = () => {
    addStamp(spotId);
    onScan?.();
  };

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAF8]">
      <div className="relative h-56">
        <img src={spot.heroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent" />
        <button
          type="button"
          onClick={onBack}
          className="absolute top-12 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur shadow-sm"
        >
          <ArrowLeft size={20} className="text-[#0B1F3A]" />
        </button>
      </div>

      <div className="px-5 -mt-6 relative pb-8">
        <Card className="p-5">
          <h1 className="text-2xl font-bold text-[#0B1F3A] tracking-tight">{spot.name}</h1>
          <p className="text-sm text-[#5A6478] mt-0.5">{spot.category}</p>

          <div className="flex flex-wrap gap-3 mt-3 text-sm">
            <span className="flex items-center gap-1 font-semibold text-[#0B1F3A]">
              <Star size={14} className="text-[#FF6B5A] fill-[#FF6B5A]" /> {spot.rating}
            </span>
            <span className="flex items-center gap-1 text-[#5A6478]">
              <MapPin size={14} /> {spot.distance}
            </span>
            <span className={`flex items-center gap-1 font-semibold ${spot.open ? "text-[#42B8A6]" : "text-[#FF6B5A]"}`}>
              <Clock size={14} /> {spot.openLabel}
            </span>
          </div>

          <p className="mt-4 text-sm text-[#5A6478] leading-relaxed">{spot.description}</p>
        </Card>

        <section className="mt-5">
          <h2 className="text-[17px] font-bold text-[#0B1F3A] mb-3">Deine Stempelkarte</h2>
          <div className="rounded-3xl p-5 text-white shadow-[0_8px_28px_rgba(11,31,58,0.12)]" style={{ background: spot.gradient }}>
            <div className="flex justify-between text-white">
              <div>
                <p className="text-xs text-white/75">Fortschritt</p>
                <p className="text-3xl font-black mt-1">{points}<span className="text-lg opacity-70">/{maxPoints}</span></p>
              </div>
              <div className="text-right text-xs text-white/85 max-w-[140px]">
                <p className="font-semibold">Nächster Reward</p>
                <p className="mt-0.5">{spot.rewardText}</p>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={points} max={maxPoints} color="#fff" />
            </div>
          </div>
        </section>

        <div className="mt-5 space-y-2">
          <GradientButton onClick={handleStamp}>Stempel sammeln</GradientButton>
          <GradientButton variant="ghost" onClick={onScan}>
            QR-Code scannen
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
