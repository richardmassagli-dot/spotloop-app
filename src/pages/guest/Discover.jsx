import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Map, List, Search, X, Star, Heart, Navigation,
  Clock, Zap, CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAllSpots, getUserStamps } from "../../lib/firestore";
import { C, CARD_GRADIENT, Spinner } from "../../components/ui";
import { mergeSpots } from "../../lib/demoData";
import { spotOpenLabel } from "../../lib/spotHours";
import { formatDistanceKm } from "../../lib/nearbySpots";

// Fix Leaflet default marker icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STUTTGART_CENTER = [48.7758, 9.1829];
const MAP_ZOOM = 14;

const CATS = [
  { id: "alle", label: "Alle", emoji: "✨" },
  { id: "Café", label: "Café", emoji: "☕" },
  { id: "Restaurant", label: "Restaurant", emoji: "🍽️" },
  { id: "Bar", label: "Bar", emoji: "🍸" },
];

const DISCOVERY_CHIPS = [
  { id: "favorites", label: "Lieblingsorte", icon: "❤️", filter: (s, stamps) => stamps.some((st) => st.spot_id === s.id) },
  { id: "recommended", label: "Empfehlungen", icon: "⭐", filter: (s) => s.verified !== false },
  { id: "rewards", label: "Mit Reward", icon: "🎁", filter: (s) => s.reward_text },
  { id: "new", label: "Schöne Spots", icon: "✨", filter: (s, stamps) => !stamps.find((st) => st.spot_id === s.id) },
];

function createMarker(spot, isSelected, hasStamp, rewardReady) {
  const bg = spot.bg_color || C.green;
  const size = isSelected ? 60 : 48;
  const borderColor = isSelected ? "#fff" : bg;
  const shadow = isSelected ? `0 6px 24px ${bg}80` : `0 3px 12px ${bg}50`;

  const badge = rewardReady
    ? `<div style="position:absolute;top:-4px;right:-4px;background:#F05830;color:#fff;font-size:9px;font-weight:900;border-radius:99px;padding:2px 5px;border:1.5px solid #fff;white-space:nowrap">🎁</div>`
    : spot.current_action
    ? `<div style="position:absolute;top:-4px;right:-4px;background:#D68A0C;color:#fff;font-size:10px;border-radius:99px;padding:2px 6px;border:1.5px solid #fff">⚡</div>`
    : spot.verified
    ? `<div style="position:absolute;top:-4px;right:-4px;background:#13B05C;color:#fff;font-size:10px;border-radius:99px;padding:2px 5px;border:1.5px solid #fff">✓</div>`
    : "";

  const pulseCss = (isSelected || rewardReady)
    ? `<style>@keyframes msp-pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.4);opacity:0}}</style><div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${bg};animation:msp-pulse 1.8s ease-in-out infinite;pointer-events:none"></div>`
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px">
        ${pulseCss}
        <div style="
          width:${size}px;height:${size}px;
          border-radius:50%;
          background:${bg};
          border:3px solid ${borderColor};
          box-shadow:${shadow};
          display:flex;align-items:center;justify-content:center;
          font-size:${isSelected ? 26 : 20}px;
          transition:all .2s;
          position:relative;
        ">
          ${spot.emoji || "🏪"}
        </div>
        ${badge}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

/** Leaflet rendert sonst oft mit Höhe 0 bis invalidateSize. */
function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const run = () => map.invalidateSize({ animate: false });
    run();
    const t1 = setTimeout(run, 80);
    const t2 = setTimeout(run, 400);
    window.addEventListener("resize", run);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", run);
    };
  }, [map]);
  return null;
}

export default function Discover({ onSpotClick }) {
  const { user } = useAuth();
  const [spots, setSpots]       = useState([]);
  const [stamps, setStamps]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState("map");
  const [cat, setCat]           = useState("alle");
  const [search, setSearch]     = useState("");
  const [discovery, setDiscovery] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [flyTo, setFlyTo]       = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    Promise.all([getAllSpots(), getUserStamps(user.uid)])
      .then(([spotsData, stampsData]) => {
        setSpots(mergeSpots(spotsData ?? []));
        setStamps(stampsData ?? []);
        setLoading(false);
      })
      .catch(() => {
        setSpots([]);
        setStamps([]);
        setLoading(false);
      });
  }, [user.uid]);

  const filtered = spots.filter(s => {
    const matchCat = cat === "alle" || s.category === cat;
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.area?.toLowerCase().includes(search.toLowerCase());
    const chip = DISCOVERY_CHIPS.find(c => c.id === discovery);
    const matchDisc = !chip || chip.filter(s, stamps);
    return matchCat && matchSearch && matchDisc;
  });

  const handlePinClick = (spot) => {
    setSelectedSpot(spot);
    setFlyTo([spot.lat, spot.lng]);
  };

  return (
    <div style={{ background: C.bg, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Floating Header ── */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, zIndex: 400, pointerEvents: "none" }}>
        <div style={{ padding: "52px 14px 10px", pointerEvents: "auto" }}>
          {/* Top row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            {/* Search bar */}
            <AnimatePresence>
              {showSearch ? (
                <motion.div
                  key="search"
                  initial={{ width: "80%", opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: "80%", opacity: 0 }}
                  style={{ flex: 1, position: "relative" }}
                >
                  <Search size={14} color={C.muted} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Spot oder Stadtteil…"
                    style={{
                      width: "100%", background: "rgba(255,255,255,.95)",
                      backdropFilter: "blur(12px)",
                      border: `1.5px solid ${search ? C.green : C.border}`,
                      borderRadius: 14, padding: "10px 36px 10px 32px",
                      fontSize: 14, color: C.dark, outline: "none",
                      fontFamily: "inherit", boxShadow: "0 4px 20px rgba(0,0,0,.12)",
                    }}
                  />
                  <button onClick={() => { setSearch(""); setShowSearch(false); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted }}>
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="search-btn"
                  onClick={() => setShowSearch(true)}
                  style={{ flex: 1, background: "rgba(255,255,255,.9)", backdropFilter: "blur(12px)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}
                >
                  <Search size={14} color={C.muted} />
                  <span style={{ fontSize: 14, color: C.muted }}>Spot oder Stadtteil…</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* View toggle */}
            <div style={{ display: "flex", background: "rgba(255,255,255,.9)", backdropFilter: "blur(12px)", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }}>
              {[{ id: "map", Icon: Map }, { id: "list", Icon: List }].map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: view === id ? C.green : "transparent", border: "none", cursor: "pointer", transition: "background .15s" }}
                >
                  <Icon size={16} color={view === id ? "#fff" : C.muted} />
                </button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
            {CATS.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                style={{
                  flexShrink: 0, borderRadius: 99, padding: "6px 12px",
                  background: cat === c.id ? C.green : "rgba(255,255,255,.88)",
                  backdropFilter: "blur(8px)",
                  border: `1.5px solid ${cat === c.id ? C.green : "rgba(255,255,255,.6)"}`,
                  color: cat === c.id ? "#fff" : C.dark,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,0,0,.1)",
                  display: "flex", alignItems: "center", gap: 4,
                  transition: "all .15s",
                }}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map View ── */}
      {view === "map" && (
        <div className="discover-map-root" style={{ position: "relative", flex: 1, minHeight: 0 }}>
          {loading ? (
            <div style={{ height: "100%", minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
              <Spinner size={40} />
            </div>
          ) : (
            <MapContainer
              center={STUTTGART_CENTER}
              zoom={MAP_ZOOM}
              style={{ height: "100%", width: "100%", minHeight: 320 }}
              zoomControl={false}
              attributionControl={false}
            >
              <MapInvalidateSize />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="© OpenStreetMap © CARTO"
                maxZoom={20}
              />
              {flyTo && <MapFlyTo center={flyTo} zoom={15} />}
              {filtered.map(spot => {
                const hasStamp = stamps.some(s => s.spot_id === spot.id);
                const rewardReady = stamps.some(s => s.spot_id === spot.id && s.reward_ready);
                const isSelected = selectedSpot?.id === spot.id;
                if (!spot.lat || !spot.lng) return null;
                return (
                  <Marker
                    key={spot.id}
                    position={[spot.lat, spot.lng]}
                    icon={createMarker(spot, isSelected, hasStamp, rewardReady)}
                    eventHandlers={{ click: () => handlePinClick(spot) }}
                  />
                );
              })}
            </MapContainer>
          )}

          {/* Discovery chips overlay */}
          <div style={{ position: "absolute", bottom: selectedSpot ? 260 : 100, left: 0, right: 0, zIndex: 10, padding: "0 14px" }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {DISCOVERY_CHIPS.map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setDiscovery(discovery === chip.id ? null : chip.id)}
                  style={{
                    background: discovery === chip.id ? CARD_GRADIENT : "rgba(255,255,255,.92)",
                    backdropFilter: "blur(12px)",
                    border: `1.5px solid ${discovery === chip.id ? "transparent" : "rgba(255,255,255,.6)"}`,
                    borderRadius: 99, padding: "7px 14px",
                    fontSize: 12, fontWeight: 700,
                    color: discovery === chip.id ? "#fff" : C.dark,
                    cursor: "pointer",
                    boxShadow: "0 3px 14px rgba(0,0,0,.12)",
                    display: "flex", alignItems: "center", gap: 5,
                    transition: "all .15s",
                  }}
                >
                  {chip.icon} {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Near Me button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setFlyTo(STUTTGART_CENTER)}
            style={{
              position: "absolute", bottom: selectedSpot ? 272 : 110, right: 14, zIndex: 10,
              width: 44, height: 44, borderRadius: 14,
              background: "rgba(255,255,255,.92)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,.12)",
            }}
          >
            <Navigation size={18} color={C.green} />
          </motion.button>

          {/* Spot count / empty hint */}
          {!loading && (
            <div
              style={{
                position: "absolute",
                top: 148,
                right: 14,
                zIndex: 10,
                background: "rgba(255,255,255,.92)",
                backdropFilter: "blur(8px)",
                borderRadius: 12,
                padding: filtered.length > 0 ? "4px 10px" : "8px 12px",
                boxShadow: "0 2px 10px rgba(0,0,0,.1)",
                maxWidth: 160,
              }}
            >
              {filtered.length > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: C.dark }}>{filtered.length} Spots</span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, lineHeight: 1.4 }}>
                  Keine Spots — Filter anpassen oder Liste öffnen
                </span>
              )}
            </div>
          )}

          {/* ── Preview Card ── */}
          <AnimatePresence>
            {selectedSpot && (
              <motion.div
                key={selectedSpot.id}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 34, stiffness: 400 }}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20 }}
              >
                <MapPreviewCard
                  spot={selectedSpot}
                  stamp={stamps.find(s => s.spot_id === selectedSpot.id)}
                  onOpen={() => onSpotClick(selectedSpot.id)}
                  onClose={() => { setSelectedSpot(null); setFlyTo(null); }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── List View ── */}
      {view === "list" && (
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 148, paddingBottom: 92 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={40} /></div>
          ) : (
            <div style={{ padding: "0 14px" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.dark, letterSpacing: -0.4 }}>
                  Lieblingsorte & schöne Spots
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.5, fontWeight: 500 }}>
                  Empfehlungen in deiner Nähe — echte Orte, keine Werbelärm.
                </div>
              </div>
              {/* Discovery chips */}
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
                {DISCOVERY_CHIPS.map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => setDiscovery(discovery === chip.id ? null : chip.id)}
                    style={{
                      flexShrink: 0, borderRadius: 99, padding: "6px 12px",
                      background: discovery === chip.id ? C.green : C.white,
                      border: `1.5px solid ${discovery === chip.id ? C.green : C.border}`,
                      color: discovery === chip.id ? "#fff" : C.muted,
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    {chip.icon} {chip.label}
                  </button>
                ))}
              </div>

              {/* Featured spots */}
              {filtered.filter(s => s.current_action).length > 0 && (
                <section style={{ marginBottom: 20 }}>
                  <SectionHeader label="🔥 Aktuelle Aktionen" />
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", margin: "0 -14px", padding: "0 14px 4px", scrollbarWidth: "none" }}>
                    {filtered.filter(s => s.current_action).map(s => (
                      <FeaturedCard key={s.id} spot={s} stamp={stamps.find(st => st.spot_id === s.id)} onPress={() => onSpotClick(s.id)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Trending */}
              {filtered.filter(s => s.trending).length > 0 && (
                <section style={{ marginBottom: 20 }}>
                  <SectionHeader label="⚡ Trending auf spotloop" />
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", margin: "0 -14px", padding: "0 14px 4px", scrollbarWidth: "none" }}>
                    {filtered.filter(s => s.trending).map(s => (
                      <TrendingCard key={s.id} spot={s} stamp={stamps.find(st => st.spot_id === s.id)} onPress={() => onSpotClick(s.id)} />
                    ))}
                  </div>
                </section>
              )}

              {/* All spots */}
              <SectionHeader label={`Alle ${filtered.length} Spots`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
                {filtered.map(s => (
                  <SpotListRow key={s.id} spot={s} stamp={stamps.find(st => st.spot_id === s.id)} onPress={() => onSpotClick(s.id)} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>Keine Spots gefunden</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Versuche eine andere Suche.</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Map Preview Card ──────────────────────────────────────────────────────────
function MapPreviewCard({ spot, stamp, onOpen, onClose }) {
  const bg = spot.bg_color || C.green;
  const pct = stamp ? Math.round((stamp.points / stamp.max_points) * 100) : 0;

  return (
    <div style={{ background: C.white, borderRadius: "22px 22px 0 0", padding: "8px 0 28px", boxShadow: "0 -6px 32px rgba(0,0,0,.18)" }}>
      {/* Handle */}
      <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2, margin: "0 auto 14px" }} />

      <div style={{ padding: "0 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: `${bg}20`, border: `2px solid ${bg}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
            {spot.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{spot.name}</div>
              {spot.verified && <CheckCircle size={14} color={C.green} fill={C.green} />}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
              {spot.category} · {spot.area}
              {spot.distance && ` · 📍 ${spot.distance}`}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {spot.rating && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#FFF7ED", borderRadius: 99, padding: "3px 8px" }}>
                  <Star size={10} color="#D68A0C" fill="#D68A0C" />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#D68A0C" }}>{spot.rating}</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 3, background: C.mintLight, borderRadius: 99, padding: "3px 8px" }}>
                <Heart size={10} color={C.green} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>{spot.followers}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={14} color={C.muted} />
          </button>
        </div>

        {/* Current action */}
        {spot.current_action && (
          <div style={{ background: `${C.orange}10`, border: `1px solid ${C.orange}25`, borderRadius: 10, padding: "8px 12px", marginBottom: 12, display: "flex", gap: 7, alignItems: "center" }}>
            <Zap size={12} color={C.orange} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>{spot.current_action}</span>
          </div>
        )}

        {/* Stamp progress */}
        {stamp ? (
          <div style={{ background: `${bg}08`, border: `1px solid ${bg}20`, borderRadius: 12, padding: "10px 12px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: bg }}>
                {stamp.reward_ready ? "🎁 Reward bereit!" : `${stamp.points}/${stamp.max_points} Stempel`}
              </span>
              <span style={{ fontSize: 11, color: C.muted }}>
                {stamp.reward_ready ? stamp.reward_text : `Noch ${stamp.max_points - stamp.points} bis: ${stamp.reward_text}`}
              </span>
            </div>
            <div style={{ height: 4, background: `${bg}20`, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: 4, width: `${pct}%`, background: stamp.reward_ready ? C.orange : bg, borderRadius: 99, transition: "width .6s" }} />
            </div>
          </div>
        ) : (
          <div style={{ background: C.mintLight, border: `1px solid ${C.fresh}20`, borderRadius: 12, padding: "10px 12px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>🎁 Reward: {spot.reward_text}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Check-in für deinen ersten Punkt</div>
          </div>
        )}

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onOpen}
          style={{ width: "100%", background: CARD_GRADIENT, color: "#fff", border: "none", borderRadius: 14, padding: "13px", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          Spot öffnen →
        </motion.button>
      </div>
    </div>
  );
}

// ── List components ──────────────────────────────────────────────────────────
function SectionHeader({ label }) {
  return <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 10 }}>{label}</div>;
}

function FeaturedCard({ spot, stamp, onPress }) {
  const bg = spot.bg_color || C.green;
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onPress}
      style={{ minWidth: 190, background: `linear-gradient(145deg, ${bg}EE, ${bg}BB)`, borderRadius: 20, padding: "18px 16px", cursor: "pointer", flexShrink: 0, boxShadow: `0 8px 28px ${bg}40`, position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
      <div style={{ fontSize: 32, marginBottom: 8 }}>{spot.emoji}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{spot.name}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginBottom: 10 }}>{spot.area}</div>
      {spot.current_action && (
        <div style={{ background: "rgba(255,255,255,.14)", borderRadius: 8, padding: "5px 10px", fontSize: 10, fontWeight: 700, color: "#fff" }}>
          ⚡ {spot.current_action}
        </div>
      )}
    </motion.div>
  );
}

function TrendingCard({ spot, stamp, onPress }) {
  const bg = spot.bg_color || C.green;
  const rewardReady = stamp?.reward_ready;
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onPress}
      style={{ minWidth: 140, background: C.white, border: `1.5px solid ${rewardReady ? `${C.orange}50` : C.border}`, borderRadius: 18, padding: "14px 12px", cursor: "pointer", flexShrink: 0, boxShadow: `0 3px 14px rgba(6,13,8,.07)`, textAlign: "center" }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 16, background: `${bg}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 8px" }}>
        {spot.emoji}
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.dark, marginBottom: 2 }}>{spot.name}</div>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{spot.area}</div>
      {spot.rating && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#FFF7ED", borderRadius: 99, padding: "3px 8px" }}>
          <Star size={9} color="#D68A0C" fill="#D68A0C" />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#D68A0C" }}>{spot.rating}</span>
        </div>
      )}
      {rewardReady && (
        <div style={{ marginTop: 6, fontSize: 10, fontWeight: 800, color: C.orange }}>🎁 Bereit!</div>
      )}
    </motion.div>
  );
}

function SpotListRow({ spot, stamp, onPress }) {
  const bg = spot.bg_color || C.green;
  const rewardReady = stamp?.reward_ready;
  const pct = stamp ? Math.round((stamp.points / stamp.max_points) * 100) : 0;
  const openLabel = spotOpenLabel(spot);

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={onPress}
      style={{ background: C.white, borderRadius: 18, border: `1.5px solid ${rewardReady ? `${C.orange}40` : C.border}`, padding: "14px", display: "flex", gap: 12, cursor: "pointer", boxShadow: `0 2px 12px rgba(6,13,8,.06)` }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${bg}18`, border: `1.5px solid ${bg}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, position: "relative" }}>
        {spot.emoji}
        {spot.verified && (
          <div style={{ position: "absolute", bottom: -4, right: -4, background: C.fresh, borderRadius: 99, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff" }}>
            <CheckCircle size={9} color="#fff" fill="#fff" />
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{spot.name}</div>
          {spot.rating && (
            <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 6 }}>
              <Star size={10} color="#D68A0C" fill="#D68A0C" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#D68A0C" }}>{spot.rating}</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 7 }}>
          {spot.category}{spot.area && ` · ${spot.area}`}
          {spot._distanceKm != null && ` · ${formatDistanceKm(spot._distanceKm)}`}
          {openLabel && (
            <span style={{ marginLeft: 6, fontWeight: 700, color: openLabel === "Geöffnet" ? C.green : C.muted }}>
              · {openLabel}
            </span>
          )}
        </div>
        {stamp ? (
          <div>
            <div style={{ height: 3, background: `${bg}18`, borderRadius: 99, overflow: "hidden", marginBottom: 3 }}>
              <div style={{ height: 3, width: `${pct}%`, background: rewardReady ? C.orange : bg, borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 10, color: rewardReady ? C.orange : C.muted, fontWeight: rewardReady ? 800 : 600 }}>
              {rewardReady ? "🎁 Reward bereit!" : `${stamp.points}/${stamp.max_points} · ${stamp.reward_text}`}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, fontWeight: 600, color: C.green }}>
            🎁 {spot.reward_text}
          </div>
        )}
        {spot.current_action && (
          <div style={{ marginTop: 5, fontSize: 10, fontWeight: 700, color: C.orange }}>⚡ {spot.current_action}</div>
        )}
      </div>
    </motion.div>
  );
}
