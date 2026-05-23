import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { Filter, MapPin, Search, Star, X } from "lucide-react";
import { PREMIUM_SPOTS } from "../../data/premiumDemo";
import { Pill } from "../../components/premium/ui";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CENTER = [48.7758, 9.1829];
const CATS = ["Alle", "Café", "Restaurant", "Bäckerei", "Bar"];

function createPin(spot, selected) {
  const size = selected ? 52 : 44;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${spot.color};border:3px solid ${selected ? "#fff" : spot.color};box-shadow:0 4px 16px ${spot.color}66;display:flex;align-items:center;justify-content:center;font-size:${selected ? 22 : 18}px">${spot.category === "Café" ? "☕" : spot.category === "Restaurant" ? "🍽" : spot.category === "Bäckerei" ? "🥐" : "🍸"}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 0.6 });
  }, [center, map]);
  return null;
}

export default function PremiumMap({ onSpotClick }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Alle");
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = PREMIUM_SPOTS.filter((s) => {
    const matchCat = cat === "Alle" || s.category === cat;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const flyCenter = selected ? [selected.lat, selected.lng] : null;

  return (
    <div className="relative h-full bg-[#FAFAF8] flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-[500] px-4 pt-12 pb-2 pointer-events-none">
        <div className="pointer-events-auto flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA3B5]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Spot oder Stadtteil…"
              className="w-full rounded-2xl border border-[#EEECE8] bg-white/95 backdrop-blur-md py-3 pl-10 pr-4 text-sm text-[#0B1F3A] shadow-[0_4px_20px_rgba(11,31,58,0.08)] outline-none focus:border-[#7C5CFF]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#EEECE8] shadow-sm"
          >
            <Filter size={18} className="text-[#0B1F3A]" />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 flex gap-2 overflow-x-auto pb-1 pointer-events-auto"
            >
              {CATS.map((c) => (
                <Pill key={c} active={cat === c} onClick={() => setCat(c)}>
                  {c}
                </Pill>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: 320 }}>
        <MapContainer center={CENTER} zoom={14} style={{ height: "100%", width: "100%", minHeight: 320 }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution="© OpenStreetMap © CARTO"
          />
          {flyCenter && <FlyTo center={flyCenter} />}
          {filtered.map((spot) => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={createPin(spot, selected?.id === spot.id)}
              eventHandlers={{ click: () => setSelected(spot) }}
            />
          ))}
        </MapContainer>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-[500] px-4 pb-4"
          >
            <div className="rounded-3xl bg-white border border-[#EEECE8] shadow-[0_8px_32px_rgba(11,31,58,0.12)] overflow-hidden">
              <div className="relative h-28">
                <img src={selected.heroImage} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#0B1F3A]">{selected.name}</h3>
                    <p className="text-xs text-[#5A6478]">{selected.category} · {selected.area}</p>
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-[#0B1F3A]">
                    <Star size={12} className="text-[#FF6B5A] fill-[#FF6B5A]" /> {selected.rating}
                  </span>
                </div>
                <div className="mt-2 flex gap-3 text-xs text-[#5A6478]">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {selected.distance}</span>
                  <span className="text-[#42B8A6] font-semibold">{selected.openLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSpotClick(selected.id)}
                  className="mt-3 w-full rounded-2xl py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6]"
                >
                  Details ansehen
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
