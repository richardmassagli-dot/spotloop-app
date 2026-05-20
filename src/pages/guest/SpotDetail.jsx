import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Heart, MapPin, Clock, Star, Shield, QrCode,
  CheckCircle, Gift, Share2, Phone, Globe,
  Wifi, PawPrint, Leaf, CreditCard, ChevronRight, Zap,
  CalendarDays, ThumbsUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getSpot, getOrCreateStamp, followSpot, unfollowSpot, isFollowing } from "../../lib/firestore";
import { C, CARD_GRADIENT, Spinner, StampGrid, ProgressBar } from "../../components/ui";
import { demoSpots, demoStamps } from "../../lib/demoData";

const FOLLOW_KEY = "spotloop_followed";
const getLocalFollowed = () => { try { return JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]"); } catch { return []; } };
const setLocalFollowed = (ids) => localStorage.setItem(FOLLOW_KEY, JSON.stringify(ids));

const TABS = [
  { id: "overview",  label: "Übersicht",  emoji: "🏠" },
  { id: "menu",      label: "Menü",       emoji: "🍽️" },
  { id: "gallery",   label: "Galerie",    emoji: "📸" },
  { id: "events",    label: "Events",     emoji: "🎉" },
  { id: "updates",   label: "Updates",    emoji: "📢" },
];

export default function SpotDetail({ spotId, onBack, onCheckin }) {
  const { user } = useAuth();
  const [spot, setSpot]             = useState(null);
  const [stamp, setStamp]           = useState(null);
  const [following, setFollowing]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState("overview");
  const [showRedeemSheet, setShowRedeemSheet] = useState(false);
  const [redeemed, setRedeemed]     = useState(false);
  const tabRef = useRef(null);

  useEffect(() => {
    const localFollowed = getLocalFollowed();
    Promise.all([
      getSpot(spotId),
      getOrCreateStamp(user.uid, spotId),
      isFollowing(user.uid, spotId),
    ]).then(([s, st, f]) => {
      setSpot(s || demoSpots.find(d => d.id === spotId) || null);
      setStamp(st || demoStamps.find(d => d.spot_id === spotId) || null);
      setFollowing(f || localFollowed.includes(spotId));
      setLoading(false);
    }).catch(() => {
      setSpot(demoSpots.find(d => d.id === spotId) || null);
      setStamp(demoStamps.find(d => d.spot_id === spotId) || null);
      setFollowing(localFollowed.includes(spotId));
      setLoading(false);
    });
  }, [spotId, user.uid]);

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    const current = getLocalFollowed();
    setLocalFollowed(next ? [...new Set([...current, spotId])] : current.filter(id => id !== spotId));
    window.dispatchEvent(new Event("spotloop:follow"));
    try { next ? followSpot(user.uid, spotId) : unfollowSpot(user.uid, spotId); } catch {}
  };

  const handleRedeem = () => {
    setRedeemed(true);
    setTimeout(() => { setShowRedeemSheet(false); setRedeemed(false); }, 2200);
  };

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner size={40} />
    </div>
  );
  if (!spot) return null;

  const bg = spot.bg_color || C.green;
  const visibleTabs = TABS.filter(t =>
    t.id !== "menu"    || spot.menu?.length > 0 ||
    t.id !== "gallery" || spot.gallery?.length > 0 ||
    t.id !== "events"  || spot.events?.length > 0 ||
    t.id !== "updates" || spot.posts?.length > 0 ||
    t.id === "overview"
  );

  return (
    <div style={{ background: C.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>

      {/* ── Hero ── */}
      <div style={{ position: "relative", background: `linear-gradient(170deg, ${bg}28 0%, ${bg}10 60%, ${C.bg} 100%)`, flexShrink: 0 }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: `${bg}08`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 40, left: -60, width: 180, height: 180, borderRadius: "50%", background: `${bg}06`, pointerEvents: "none" }} />

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 16px 0", position: "relative" }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,.85)", backdropFilter: "blur(8px)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <ArrowLeft size={18} color={C.dark} />
          </motion.button>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button whileTap={{ scale: 0.9 }}
              style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,.85)", backdropFilter: "blur(8px)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Share2 size={16} color={C.muted} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleFollow}
              style={{ width: 38, height: 38, borderRadius: 12, background: following ? `${bg}18` : "rgba(255,255,255,.85)", backdropFilter: "blur(8px)", border: `1.5px solid ${following ? bg : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Heart size={16} color={following ? bg : C.muted} fill={following ? bg : "none"} />
            </motion.button>
          </div>
        </div>

        {/* Spot identity */}
        <div style={{ padding: "20px 20px 0", textAlign: "center", position: "relative" }}>
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            style={{ width: 92, height: 92, borderRadius: 28, background: `${bg}22`, border: `2.5px solid ${bg}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, margin: "0 auto 14px", boxShadow: `0 10px 36px ${bg}28` }}
          >
            {spot.emoji || "🏪"}
          </motion.div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.dark, letterSpacing: -0.5 }}>{spot.name}</div>
            {spot.verified && <VerifiedBadge />}
          </div>

          {spot.tagline && (
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 12, fontStyle: "italic" }}>{spot.tagline}</div>
          )}

          {/* Rating + stats row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {spot.rating && (
              <StatPill icon={<Star size={11} color="#D68A0C" fill="#D68A0C" />} value={spot.rating} color="#D68A0C" bg="#FFF7ED" />
            )}
            <StatPill icon={<Heart size={11} color={following ? bg : C.muted} fill={following ? bg : "none"} />} value={following ? `Du & ${(spot.followers || 0) - 1} weitere` : `${(spot.followers || 0).toLocaleString("de")} Follower`} color={following ? bg : C.muted} bg={following ? `${bg}12` : C.bg} />
            <StatPill icon={<QrCode size={11} color={C.green} />} value={`${spot.total_checkins} Check-ins`} color={C.green} bg={C.mintLight} />
          </div>

          {/* Current action */}
          {spot.current_action && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF7ED", border: `1.5px solid ${C.orange}28`, borderRadius: 12, padding: "7px 14px", marginBottom: 4 }}
            >
              <Zap size={13} color={C.orange} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>{spot.current_action}</span>
            </motion.div>
          )}
        </div>

        {/* Stamp mini-preview (if has card) */}
        {stamp && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{ margin: "14px 16px 0", background: C.white, borderRadius: 16, border: `1.5px solid ${stamp.reward_ready ? `${C.orange}40` : `${bg}25`}`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: stamp.reward_ready ? C.orange : bg, marginBottom: 5 }}>
                {stamp.reward_ready ? "🎁 Reward bereit!" : `${stamp.points}/${stamp.max_points} Punkte`}
              </div>
              <div style={{ height: 4, background: `${bg}18`, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: 4, width: `${Math.round((stamp.points / stamp.max_points) * 100)}%`, background: stamp.reward_ready ? C.orange : bg, borderRadius: 99, transition: "width 1s ease" }} />
              </div>
            </div>
            {stamp.reward_ready && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowRedeemSheet(true)}
                style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}
              >
                <Gift size={12} /> Einlösen
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Tabs */}
        <div ref={tabRef} style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none", marginTop: 16, borderBottom: `1px solid ${C.border}` }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flexShrink: 0, padding: "10px 16px", background: "none", border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 800 : 600,
                color: tab === t.id ? bg : C.muted,
                borderBottom: `2.5px solid ${tab === t.id ? bg : "transparent"}`,
                marginBottom: -1, transition: "all .15s",
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

            {tab === "overview" && <OverviewTab spot={spot} stamp={stamp} bg={bg} />}
            {tab === "menu"     && <MenuTab     spot={spot} bg={bg} />}
            {tab === "gallery"  && <GalleryTab  spot={spot} bg={bg} />}
            {tab === "events"   && <EventsTab   spot={spot} bg={bg} />}
            {tab === "updates"  && <UpdatesTab  spot={spot} bg={bg} />}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: "rgba(247,249,248,.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.border}`, padding: "12px 16px 28px", zIndex: 50 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCheckin}
          style={{ width: "100%", background: CARD_GRADIENT, color: "#fff", border: "none", borderRadius: 16, padding: "15px", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, boxShadow: "0 6px 24px rgba(10,61,39,.32)" }}
        >
          <QrCode size={18} /> QR-Code scannen & Punkt sichern
        </motion.button>
      </div>

      {/* ── Redeem Sheet ── */}
      <AnimatePresence>
        {showRedeemSheet && stamp?.reward_ready && (
          <RedeemSheet spot={spot} stamp={stamp} redeemed={redeemed} onRedeem={handleRedeem} onClose={() => setShowRedeemSheet(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ spot, stamp, bg }) {
  return (
    <div style={{ padding: "16px 16px 0" }}>

      {/* Description */}
      {spot.description && (
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 14, boxShadow: `0 2px 12px rgba(6,13,8,.05)` }}>
          <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.75 }}>{spot.description}</div>
        </div>
      )}

      {/* Stamp card detail */}
      {stamp && (
        <div style={{ background: C.white, borderRadius: 18, border: `1.5px solid ${stamp.reward_ready ? `${C.orange}45` : `${bg}25`}`, padding: "16px", marginBottom: 14, boxShadow: stamp.reward_ready ? `0 8px 28px ${C.orange}15` : `0 4px 20px rgba(6,13,8,.07)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Meine Stempelkarte</div>
            {stamp.reward_ready && (
              <div style={{ background: C.orange, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 800 }}>🎁 Einlösbar</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
            <div style={{ position: "relative", width: 66, height: 66, flexShrink: 0 }}>
              <svg width={66} height={66} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={33} cy={33} r={27} fill="none" stroke={`${bg}15`} strokeWidth={5.5} />
                <circle cx={33} cy={33} r={27} fill="none" stroke={stamp.reward_ready ? C.orange : bg} strokeWidth={5.5}
                  strokeDasharray={`${2 * Math.PI * 27}`}
                  strokeDashoffset={`${2 * Math.PI * 27 * (1 - stamp.points / stamp.max_points)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: stamp.reward_ready ? C.orange : bg, lineHeight: 1 }}>{stamp.points}</div>
                <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>/{stamp.max_points}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {stamp.reward_ready ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.orange, marginBottom: 3 }}>🎉 Reward bereit!</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{stamp.reward_text || spot.reward_text}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Beim Personal einlösen.</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 3 }}>Nächster Reward:</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: bg }}>{stamp.reward_text || spot.reward_text}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Noch <strong style={{ color: C.dark }}>{stamp.max_points - stamp.points}</strong> Punkte</div>
                </>
              )}
            </div>
          </div>
          <StampGrid pts={stamp.points} max={stamp.max_points} color={stamp.reward_ready ? C.orange : bg} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {[
              { label: "Besuche", val: stamp.total_checkins || stamp.points, icon: "📍" },
              { label: "Mitglied seit", val: stamp.created_at?.slice(0, 7) || "–", icon: "📅" },
              { label: "Letzter Besuch", val: stamp.last_visit || "–", icon: "🕐" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{s.val}</div>
                <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location & info */}
      <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 14, boxShadow: `0 2px 12px rgba(6,13,8,.05)` }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 12 }}>Informationen</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {spot.address && (
            <InfoRow icon={<MapPin size={14} color={C.green} />} label={spot.address} action={() => {}} actionLabel="Route" />
          )}
          {spot.opening_hours && (
            <InfoRow icon={<Clock size={14} color={C.green} />} label={spot.opening_hours} />
          )}
          {spot.phone && (
            <InfoRow icon={<Phone size={14} color={C.green} />} label={spot.phone} />
          )}
          {spot.website && (
            <InfoRow icon={<Globe size={14} color={C.green} />} label={spot.website} />
          )}
          {spot.instagram && (
            <InfoRow icon={<span style={{ fontSize: 14 }}>📸</span>} label={spot.instagram} />
          )}
        </div>

        {/* Amenities */}
        {spot.amenities && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {spot.amenities.wifi      && <AmenityChip icon={<Wifi size={11} color={C.green} />} label="WLAN" />}
            {spot.amenities.outdoor   && <AmenityChip icon={<span style={{ fontSize: 11 }}>🌿</span>} label="Outdoor" />}
            {spot.amenities.vegan     && <AmenityChip icon={<Leaf size={11} color={C.green} />} label="Vegan" />}
            {spot.amenities.pet_friendly && <AmenityChip icon={<PawPrint size={11} color={C.green} />} label="Haustiere" />}
            {spot.amenities.payment_card && <AmenityChip icon={<CreditCard size={11} color={C.green} />} label="Kartenzahlung" />}
          </div>
        )}

        {/* Tags */}
        {spot.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {spot.tags.map(tag => (
              <span key={tag} style={{ background: C.mintLight, color: C.green, borderRadius: 99, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Trust panel */}
      <div style={{ background: `linear-gradient(135deg, ${C.mintLight}, rgba(232,248,238,.4))`, borderRadius: 18, border: `1px solid ${C.fresh}20`, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Shield size={15} color={C.green} />
          <div style={{ fontSize: 13, fontWeight: 800, color: C.green }}>Verifizierter Spot · Trusted by spotloop</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { icon: "✅", text: "Identität geprüft" },
            { icon: "🔒", text: "DSGVO-konform" },
            { icon: "🔄", text: "Rotating QR" },
            { icon: "⚡", text: "Echtzeit-Punkte" },
          ].map(t => (
            <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.7)", borderRadius: 99, padding: "4px 10px" }}>
              <span style={{ fontSize: 11 }}>{t.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.dark }}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Menu Tab ─────────────────────────────────────────────────────────────────
function MenuTab({ spot, bg }) {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!spot.menu?.length) return (
    <div style={{ padding: "40px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Menü folgt bald</div>
      <div style={{ fontSize: 13, color: C.muted }}>Der Spot richtet die Speisekarte gerade ein.</div>
    </div>
  );

  const cat = spot.menu[activeCategory];

  return (
    <div>
      {/* Category tabs */}
      <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none", borderBottom: `1px solid ${C.border}`, background: C.white }}>
        {spot.menu.map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(i)}
            style={{
              flexShrink: 0, padding: "11px 16px", background: "none", border: "none",
              cursor: "pointer", fontSize: 12, fontWeight: activeCategory === i ? 800 : 600,
              color: activeCategory === i ? bg : C.muted,
              borderBottom: `2px solid ${activeCategory === i ? bg : "transparent"}`,
              marginBottom: -1, display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {c.emoji} {c.category}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 16px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeCategory} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cat.items.map((item, i) => (
                <MenuItemCard key={i} item={item} bg={bg} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MenuItemCard({ item, bg }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 16px", boxShadow: `0 2px 10px rgba(6,13,8,.05)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: item.desc ? 4 : 0 }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{item.name}</div>
            {item.popular && <span style={{ background: `${C.orange}15`, color: C.orange, borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 800 }}>BELIEBT</span>}
            {item.new && <span style={{ background: `${C.green}15`, color: C.green, borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 800 }}>NEU</span>}
            {item.vegan && <span style={{ background: `${bg}12`, color: bg, borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 800 }}>VEGAN</span>}
          </div>
          {item.desc && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{item.desc}</div>}
        </div>
        <div style={{ fontSize: 15, fontWeight: 900, color: C.dark, flexShrink: 0 }}>
          {item.price} €
        </div>
      </div>
    </div>
  );
}

// ── Gallery Tab ───────────────────────────────────────────────────────────────
function GalleryTab({ spot, bg }) {
  const [selected, setSelected] = useState(null);

  if (!spot.gallery?.length) return (
    <div style={{ padding: "40px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>Galerie folgt bald</div>
    </div>
  );

  const CATEGORIES = [...new Set(spot.gallery.map(g => g.type))];

  return (
    <div style={{ padding: "14px 16px" }}>
      {/* Category legend */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 14, scrollbarWidth: "none" }}>
        {["all", ...CATEGORIES].map(c => (
          <button key={c} style={{ flexShrink: 0, borderRadius: 99, padding: "5px 12px", background: C.white, border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, cursor: "pointer" }}>
            {c === "all" ? "Alle" : c === "food" ? "Speisen" : c === "drink" ? "Getränke" : c === "interior" ? "Interior" : c === "atmosphere" ? "Atmosphäre" : "Backstage"}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {spot.gallery.map((photo, i) => (
          <motion.div
            key={i}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSelected(photo)}
            style={{
              aspectRatio: "1",
              borderRadius: 14,
              background: `linear-gradient(145deg, ${photo.color}30, ${photo.color}18)`,
              border: `1.5px solid ${photo.color}25`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>{photo.emoji}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: photo.color, textAlign: "center", padding: "0 6px", lineHeight: 1.3 }}>{photo.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Photo lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              style={{ width: 200, height: 200, borderRadius: 28, background: `linear-gradient(145deg, ${selected.color}35, ${selected.color}20)`, border: `2px solid ${selected.color}40`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
              <div style={{ fontSize: 64, marginBottom: 8 }}>{selected.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: selected.color, textAlign: "center", padding: "0 16px" }}>{selected.label}</div>
            </motion.div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>Tippe zum Schließen</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Events Tab ────────────────────────────────────────────────────────────────
function EventsTab({ spot, bg }) {
  const [rsvpd, setRsvpd] = useState(new Set());

  if (!spot.events?.length) return (
    <div style={{ padding: "40px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Keine Events geplant</div>
      <div style={{ fontSize: 13, color: C.muted }}>Folge dem Spot um benachrichtigt zu werden.</div>
    </div>
  );

  const typeColors = {
    music: "#8B5CF6",
    workshop: "#1B6CA8",
    food: C.orange,
    default: C.green,
  };

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {spot.events.map(event => {
          const color = typeColors[event.type] || typeColors.default;
          const isRsvpd = rsvpd.has(event.id);
          const urgentSpots = event.spots_left <= 5;
          return (
            <div key={event.id} style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 3px 14px rgba(6,13,8,.07)` }}>
              <div style={{ background: `linear-gradient(90deg, ${color}18, ${color}08)`, padding: "14px 16px", borderBottom: `1px solid ${color}15` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {event.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: C.dark, marginBottom: 2 }}>{event.title}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        <CalendarDays size={11} color={C.muted} style={{ display: "inline", marginRight: 3 }} />
                        {event.date} · {event.time}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: urgentSpots ? C.orange : C.muted }}>
                      {urgentSpots ? `⚠️ Nur ${event.spots_left} Plätze` : `${event.spots_left} Plätze frei`}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, marginBottom: 12 }}>{event.desc}</div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setRsvpd(s => { const n = new Set(s); n.has(event.id) ? n.delete(event.id) : n.add(event.id); return n; })}
                  style={{
                    width: "100%",
                    background: isRsvpd ? C.mintLight : `${color}12`,
                    border: `1.5px solid ${isRsvpd ? C.fresh : color}30`,
                    borderRadius: 12, padding: "10px",
                    fontSize: 13, fontWeight: 700,
                    color: isRsvpd ? C.green : color,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  }}
                >
                  {isRsvpd ? <><CheckCircle size={14} /> Angemeldet!</> : <><CalendarDays size={14} /> Teilnehmen</>}
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Updates Tab ───────────────────────────────────────────────────────────────
function UpdatesTab({ spot, bg }) {
  const [liked, setLiked] = useState(new Set());

  if (!spot.posts?.length) return (
    <div style={{ padding: "40px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 6 }}>Noch keine Updates</div>
      <div style={{ fontSize: 13, color: C.muted }}>Folge dem Spot um die neuesten News zu sehen.</div>
    </div>
  );

  const typeStyles = {
    new:       { color: C.green,  bg: C.mintLight,  icon: "🆕", label: "NEU" },
    campaign:  { color: C.orange, bg: `${C.orange}12`, icon: "⚡", label: "AKTION" },
    milestone: { color: "#8B5CF6", bg: "#F3F0FF",  icon: "🏆", label: "MEILENSTEIN" },
    default:   { color: C.muted,  bg: C.bg,         icon: "📌", label: "UPDATE" },
  };

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {spot.posts.map(post => {
          const s = typeStyles[post.type] || typeStyles.default;
          const isLiked = liked.has(post.id);
          return (
            <div key={post.id} style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "16px", boxShadow: `0 2px 12px rgba(6,13,8,.06)` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {post.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{post.time}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 4 }}>{post.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{post.text}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                <button
                  onClick={() => setLiked(s => { const n = new Set(s); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: isLiked ? C.orange : C.muted, padding: "4px 0" }}
                >
                  <ThumbsUp size={13} fill={isLiked ? C.orange : "none"} color={isLiked ? C.orange : C.muted} />
                  {post.reactions + (isLiked ? 1 : 0)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────
function VerifiedBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, background: C.mintLight, borderRadius: 99, padding: "3px 8px" }}>
      <CheckCircle size={11} color={C.green} fill={C.green} />
      <span style={{ fontSize: 10, fontWeight: 800, color: C.green, letterSpacing: 0.3 }}>VERIFIZIERT</span>
    </div>
  );
}

function StatPill({ icon, value, color, bg }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, borderRadius: 99, padding: "4px 10px" }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, action, actionLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.5, flex: 1 }}>{label}</div>
      {action && (
        <button onClick={action} style={{ background: C.mintLight, border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: C.green, cursor: "pointer", flexShrink: 0 }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function AmenityChip({ icon, label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 99, padding: "5px 10px" }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{label}</span>
    </div>
  );
}

function RedeemSheet({ spot, stamp, redeemed, onRedeem, onClose }) {
  const bg = spot?.bg_color || C.green;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 300, display: "flex", alignItems: "flex-end" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 34, stiffness: 420 }}
        style={{ background: C.white, borderRadius: "26px 26px 0 0", width: "100%", maxWidth: 390, margin: "0 auto", padding: "0 0 32px" }}
      >
        <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: "10px auto 20px" }} />
        {redeemed ? (
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "20px 24px" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: C.mintLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.dark, marginBottom: 6 }}>Reward eingelöst!</div>
            <div style={{ fontSize: 14, color: C.muted }}>Zeig diese Bestätigung dem Personal.</div>
          </motion.div>
        ) : (
          <div style={{ padding: "0 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>{spot?.emoji || "🎁"}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.dark, marginBottom: 4 }}>{stamp?.reward_text || spot?.reward_text}</div>
              <div style={{ fontSize: 13, color: C.muted }}>bei {spot?.name}</div>
            </div>
            <div style={{ background: C.bg, borderRadius: 14, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Sage dem Personal:</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>„Ich möchte meinen spotloop-Reward einlösen."</div>
            </div>
            <button onClick={onRedeem} style={{ width: "100%", background: CARD_GRADIENT, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(10,61,39,.3)" }}>
              <CheckCircle size={16} /> Einlösung bestätigen
            </button>
            <button onClick={onClose} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 8 }}>
              Abbrechen
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
