import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Compass, Gift, ThumbsUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUserStamps, getAllSpots } from "../../lib/firestore";
import { C, PremiumCard, Spinner, ProgressBar, CARD_GRADIENT } from "../../components/ui";
import { mergeSpots } from "../../lib/demoData";
import NotificationCenter, { NotificationBell } from "./NotificationCenter";

const FOLLOW_KEY = "spotloop_followed";
const getLocalFollowed = () => { try { return JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]"); } catch { return []; } };

export default function Home({ onSpotClick, onCheckin }) {
  const { user, profile } = useAuth();
  const [stamps, setStamps] = useState([]);
  const [spots, setSpots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [followedIds, setFollowedIds] = useState(getLocalFollowed);

  useEffect(() => {
    const handler = () => setFollowedIds(getLocalFollowed());
    window.addEventListener("spotloop:follow", handler);
    return () => window.removeEventListener("spotloop:follow", handler);
  }, []);

  useEffect(() => {
    Promise.all([getUserStamps(user.uid), getAllSpots()])
      .then(([s, sp]) => {
        setStamps(s ?? []);
        setSpots(mergeSpots(sp ?? []));
        setLoading(false);
      })
      .catch(() => {
        setStamps([]);
        setSpots([]);
        setLoading(false);
      });
  }, [user.uid]);
  const dynamicPosts = spots
    .filter((s) => s.current_action)
    .slice(0, 6)
    .map((s) => ({
      id: `spot-${s.id}`,
      spot_id: s.id,
      spot_name: s.name,
      spot_bg: s.bg_color || C.green,
      spot_emoji: s.emoji || "🏪",
      time: "Heute",
      title: s.current_action,
      text: `Aktuelles Angebot bei ${s.name}.`,
      reactions: 0,
      is_new: true,
      badge_color: C.orange,
      badge_label: "Aktion",
    }));

  const isBirthday = (() => {
    const bday = user?.birthday || profile?.birthday;
    if (!bday) return false;
    const d = new Date(bday);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  })();

  if (showNotifications) {
    return <NotificationCenter onClose={() => setShowNotifications(false)} onSpotClick={(id) => { setShowNotifications(false); onSpotClick(id); }} />;
  }

  const totalPoints = stamps.reduce((a, s) => a + s.points, 0);
  const readyCount  = stamps.filter(s => s.reward_ready).length;
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  const dateStr     = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  const activeStamps = stamps.filter(s => s.points > 0);
  const nearbySpots  = spots.slice(0, 5);

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ background: C.white, padding: "52px 20px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 2 }}>{dateStr}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.dark, letterSpacing: -0.5 }}>
              {greeting}, {profile?.name?.split(" ")[0]}
            </div>
          </div>
          <NotificationBell count={3} onClick={() => setShowNotifications(true)} />
        </div>
      </div>

      <div style={{ padding: "18px 18px 0" }}>

        {/* ── spotloop Card ── */}
        <PremiumCard profile={profile} totalPoints={totalPoints} readyCount={readyCount} />

        {/* ── Quick Actions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          {[
            { Icon: ScanLine, label: "Check-in",  action: onCheckin,  color: C.green,  bg: C.mintLight },
            { Icon: Compass,  label: "Entdecken", action: () => {},   color: "#1A5C8A", bg: "#DDF0F5" },
            { Icon: Gift,     label: "Rewards",   action: () => {},   color: C.orange, bg: C.orangeLight },
          ].map(({ Icon, label, action, color, bg }, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={action}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, boxShadow: `0 2px 8px ${C.shadow}` }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{label}</span>
            </motion.button>
          ))}
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          {[
            { val: stamps.length,   label: "Karten",  color: C.green,  bg: C.mintLight },
            { val: totalPoints,     label: "Punkte",  color: C.purple, bg: C.purpleLight },
            { val: readyCount,      label: "Rewards", color: C.orange, bg: C.orangeLight },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "12px 8px", textAlign: "center", border: `1px solid ${s.color}14` }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, letterSpacing: -1 }}>{s.val}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Birthday Banner ── */}
        {isBirthday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: "linear-gradient(135deg, #B8860B, #D95B1B)", borderRadius: 16, padding: "14px 16px", marginTop: 14, display: "flex", gap: 12, alignItems: "center", boxShadow: "0 6px 24px rgba(184,134,11,.28)" }}
          >
            <span style={{ fontSize: 28 }}>🎂</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>Happy Birthday, {profile?.name?.split(" ")[0]}!</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", marginTop: 2 }}>Gratis Kaffee heute bei Café Himmelblau – von spotloop!</div>
            </div>
          </motion.div>
        )}

        {/* ── Active Stamp Cards ── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={32} /></div>
        ) : activeStamps.length > 0 && (
          <section style={{ marginTop: 22 }}>
            <SectionHeader label="Aktive Karten" count={`${activeStamps.length} aktiv`} />
            <div style={{ display: "flex", gap: 12, overflowX: "auto", margin: "0 -18px", padding: "0 18px 4px", scrollbarWidth: "none" }}>
              {activeStamps.map(stamp => (
                <StampCard key={stamp.id} stamp={stamp} onPress={() => onSpotClick(stamp.spot_id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Followed Feed ── */}
        <FollowedFeed followedIds={followedIds} posts={dynamicPosts} onSpotClick={onSpotClick} />

        {/* ── Nearby Spots ── */}
        {nearbySpots.length > 0 && (
          <section style={{ marginTop: 22, marginBottom: 8 }}>
            <SectionHeader label="In deiner Nähe" count={`${nearbySpots.length} Spots`} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nearbySpots.map(spot => (
                <SpotRow key={spot.id} spot={spot} onPress={() => onSpotClick(spot.id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty ── */}
        {!loading && stamps.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", marginTop: 8 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🗺️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Lokale Spots entdecken</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginBottom: 20, maxWidth: 280, margin: "0 auto 20px" }}>
              Scanne den QR-Code deines Lieblingscafés und sammle deinen ersten Punkt.
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onCheckin}
              style={{ background: CARD_GRADIENT, color: "#fff", border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 24px rgba(15,61,62,.3)` }}
            >
              QR-Code scannen
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

function FollowedFeed({ followedIds, posts, onSpotClick }) {
  const [likedIds, setLikedIds] = useState([]);
  const feedPosts = followedIds.length > 0
    ? posts.filter(p => followedIds.includes(p.spot_id))
    : posts.slice(0, 2);

  if (!feedPosts.length && followedIds.length === 0) return null;

  return (
    <section style={{ marginTop: 22 }}>
      <SectionHeader
        label={followedIds.length > 0 ? "Updates deiner Spots" : "Beliebte Updates"}
        count={`${feedPosts.length} neu`}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {feedPosts.map((post, i) => {
          const liked = likedIds.includes(post.id);
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 2px 10px ${C.shadow}`, cursor: "pointer" }}
              onClick={() => onSpotClick(post.spot_id)}
            >
              {/* Spot identity strip */}
              <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${post.spot_bg}18`, border: `1px solid ${post.spot_bg}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {post.spot_emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{post.spot_name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{post.time}</div>
                </div>
                {post.is_new && (
                  <div style={{ background: post.badge_color, borderRadius: 99, padding: "3px 8px" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{post.badge_label}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: "0 14px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 4 }}>{post.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>{post.text}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setLikedIds(ids => liked ? ids.filter(id => id !== post.id) : [...ids, post.id]); }}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: liked ? C.mintLight : C.bg, border: `1px solid ${liked ? C.fresh : C.border}`, borderRadius: 99, padding: "5px 10px", cursor: "pointer" }}
                  >
                    <ThumbsUp size={11} color={liked ? C.fresh : C.muted} fill={liked ? C.fresh : "none"} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: liked ? C.fresh : C.muted }}>{post.reactions + (liked ? 1 : 0)}</span>
                  </button>
                  <span style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>Spot öffnen →</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeader({ label, count }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{label}</div>
      {count && <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{count}</span>}
    </div>
  );
}

function StampCard({ stamp, onPress }) {
  const bg  = stamp.spot?.bg_color || C.green;
  const pct = Math.round((stamp.points / stamp.max_points) * 100);
  return (
    <div
      onClick={onPress}
      style={{ minWidth: 155, maxWidth: 155, background: `linear-gradient(140deg, ${bg}F0, ${bg})`, borderRadius: 18, padding: "14px 13px", cursor: "pointer", flexShrink: 0, boxShadow: `0 8px 24px ${bg}40`, position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
      <div style={{ fontSize: 26, marginBottom: 8 }}>{stamp.spot?.emoji || "🏪"}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stamp.spot?.name || "Spot"}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", marginBottom: 10 }}>{stamp.spot?.category}</div>
      <div style={{ height: 3, background: "rgba(255,255,255,.18)", borderRadius: 99, overflow: "hidden", marginBottom: 5 }}>
        <div style={{ height: 3, background: "#fff", borderRadius: 99, width: `${pct}%` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.65)", fontWeight: 600 }}>{stamp.points}/{stamp.max_points}</span>
        {stamp.reward_ready && <span style={{ fontSize: 12 }}>🎁</span>}
      </div>
    </div>
  );
}

function SpotRow({ spot, onPress }) {
  const bg = spot.bg_color || C.green;
  return (
    <div
      onClick={onPress}
      style={{ background: C.white, borderRadius: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: `1px solid ${C.border}`, boxShadow: `0 2px 10px ${C.shadow}` }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: `${bg}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
        {spot.emoji || "🏪"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{spot.name}</div>
          <div style={{ fontSize: 11, color: C.muted, flexShrink: 0, marginLeft: 8 }}>❤️ {spot.followers ?? 0}</div>
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>{spot.category}{spot.area && ` · ${spot.area}`}</div>
        {spot.current_action && (
          <div style={{ marginTop: 3, fontSize: 11, fontWeight: 700, color: C.orange }}>⚡ {spot.current_action}</div>
        )}
      </div>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: C.mintLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.green, fontWeight: 700, flexShrink: 0 }}>›</div>
    </div>
  );
}
