import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Gift, MapPin, Sparkles, Bookmark, X, Bell, Ticket } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllSpots,
  getUserStamps,
  resolveGuestFollowedSpotIds,
  getFollowerSpotUpdates,
  getGuestCampaignNotifications,
} from "../../lib/firestore";
import { getGuestSpotReplyAlerts } from "../../lib/spotMessages";
import { mergeSpots } from "../../lib/demoData";
import { C, CARD_GRADIENT, Card, Tag, Btn, Spinner } from "../../components/ui";
import StampCard from "../../components/stamp/StampCard";
import {
  INBOX_FILTERS,
  UPDATE_TYPE_LABELS,
  buildMySpotsFeed,
  buildFollowedSpotsBar,
  buildStampProgressCards,
  ctaForItem,
  matchesInboxFilter,
} from "../../lib/mySpots";
import {
  ALERT_TYPE_LABEL,
  buildStampAlerts,
  mergeGuestAlerts,
  resolveAlertSpotIds,
  filterAlerts,
  markInboxRead,
  markAllInboxRead,
  dismissInboxAlert,
  inboxBadgeCount,
} from "../../lib/guestInbox";
import { isCampaignCouponItem } from "../../lib/campaignCoupon";
import CampaignPushPreview from "../../components/guest/CampaignPushPreview";
import CouponRevealSheet from "../../components/guest/CouponRevealSheet";
import FollowedSpotsOrganizer from "../../components/guest/FollowedSpotsOrganizer";
import {
  loadFollowedOrganizePrefs,
  saveFollowedOrganizePrefs,
  setSpotCategoryOverride,
  enrichFollowedSpots,
  filterFollowedByCategory,
  sortFollowedSpots,
} from "../../lib/followedSpotOrganize";

const TYPE_COLORS = {
  post: C.blue,
  new_dish: C.teal,
  action: C.orange,
  happy_hour: "#D68A0C",
  event: C.purple,
  reward: C.gold,
  location: C.cyan,
};

export default function MySpots({
  onBack,
  onSpotClick,
  onWallet,
  initialFilter = "all",
  embedded = false,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState([]);
  const [stamps, setStamps] = useState([]);
  const [followedIds, setFollowedIds] = useState([]);
  const [livePosts, setLivePosts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertSpotIds, setAlertSpotIds] = useState({});
  const [filter, setFilter] = useState(initialFilter);
  const [couponSpotFilter, setCouponSpotFilter] = useState(null);
  const [followedSort, setFollowedSort] = useState("activity");
  const [followedCategoryFilter, setFollowedCategoryFilter] = useState("all");
  const [spotCategoryOverrides, setSpotCategoryOverrides] = useState({});
  const [query, setQuery] = useState("");
  const [couponItem, setCouponItem] = useState(null);
  const [saved, setSaved] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("spotloop_myspots_saved") || "[]"));
    } catch {
      return new Set();
    }
  });

  const activeMeta = INBOX_FILTERS.find((f) => f.id === filter) || INBOX_FILTERS[0];

  const reload = async () => {
    try {
      const [sp, st] = await Promise.all([getAllSpots(), getUserStamps(user.uid)]);
      const mergedSpots = mergeSpots(sp ?? []);
      setSpots(mergedSpots);
      setStamps(st ?? []);
      const byId = Object.fromEntries(mergedSpots.map((s) => [s.id, s]));
      const fids = await resolveGuestFollowedSpotIds(user.uid, st ?? [], mergedSpots);
      setFollowedIds(fids);
      const [posts, campaignAlerts, messageAlerts] = await Promise.all([
        getFollowerSpotUpdates(fids, byId, user.uid).catch(() => []),
        getGuestCampaignNotifications(user.uid, st ?? [], byId).catch(() => []),
        getGuestSpotReplyAlerts(user.uid, byId).catch(() => []),
      ]);
      setLivePosts(posts);
      const stampAlerts = buildStampAlerts(st ?? [], byId);
      const merged = mergeGuestAlerts({ stampAlerts, campaignAlerts, messageAlerts });
      setAlerts(merged);
      setAlertSpotIds(resolveAlertSpotIds(merged, mergedSpots));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    reload();
    window.addEventListener("spotloop:follow", reload);
    window.addEventListener("spotloop:campaign", reload);
    window.addEventListener("spotloop:spot-message", reload);
    return () => {
      window.removeEventListener("spotloop:follow", reload);
      window.removeEventListener("spotloop:campaign", reload);
      window.removeEventListener("spotloop:spot-message", reload);
    };
  }, [user.uid]);

  useEffect(() => {
    const prefs = loadFollowedOrganizePrefs(user.uid);
    setFollowedSort(prefs.sort);
    setSpotCategoryOverrides(prefs.categories);
  }, [user.uid]);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    if (filter !== "coupons") setCouponSpotFilter(null);
  }, [filter]);

  const spotsById = useMemo(() => Object.fromEntries(spots.map((s) => [s.id, s])), [spots]);
  const alertIds = useMemo(() => new Set(alerts.map((a) => a.id)), [alerts]);
  const readyStampSpotIds = useMemo(
    () => new Set((stamps ?? []).filter((s) => s.reward_ready).map((s) => s.spot_id)),
    [stamps]
  );

  const stampCards = useMemo(
    () => buildStampProgressCards(stamps, spotsById),
    [stamps, spotsById]
  );

  const baseFeed = useMemo(() => {
    const items = buildMySpotsFeed({
      followedIds,
      spotsById,
      stamps,
      filter: "all",
      query,
      livePosts,
    });
    return items.filter((item) => !alertIds.has(item.id));
  }, [followedIds, spotsById, stamps, query, livePosts, alertIds]);

  const allCouponItems = useMemo(
    () => baseFeed.filter((item) => isCampaignCouponItem(item)),
    [baseFeed],
  );

  const couponSpotOptions = useMemo(() => {
    const counts = {};
    const bySpot = new Map();
    allCouponItems.forEach((item) => {
      if (!item.spot_id) return;
      counts[item.spot_id] = (counts[item.spot_id] || 0) + 1;
      if (bySpot.has(item.spot_id)) return;
      bySpot.set(item.spot_id, {
        id: item.spot_id,
        name: item.spot_name || spotsById[item.spot_id]?.name || "Spot",
        emoji: item.spot_emoji || spotsById[item.spot_id]?.emoji || "🏪",
        bg: item.spot_bg || spotsById[item.spot_id]?.bg_color || C.green,
      });
    });
    return [...bySpot.values()].map((s) => ({ ...s, count: counts[s.id] || 0 }));
  }, [allCouponItems, spotsById]);

  const followedBar = useMemo(
    () =>
      buildFollowedSpotsBar(followedIds, spotsById, baseFeed, {
        rewardsOnly: filter === "rewards",
      }),
    [followedIds, spotsById, baseFeed, filter]
  );

  const organizedFollowedBar = useMemo(() => {
    const enriched = enrichFollowedSpots(followedBar, spotsById, spotCategoryOverrides);
    const filtered = filterFollowedByCategory(enriched, followedCategoryFilter);
    return sortFollowedSpots(filtered, followedSort);
  }, [followedBar, spotsById, spotCategoryOverrides, followedCategoryFilter, followedSort]);

  const followedSpotIdSet = useMemo(() => {
    if (!followedCategoryFilter || followedCategoryFilter === "all") return null;
    return new Set(organizedFollowedBar.map((s) => s.id));
  }, [organizedFollowedBar, followedCategoryFilter]);

  const feed = useMemo(() => {
    const feedOnly = baseFeed.filter((item) => matchesInboxFilter(item, filter));
    let spotScoped =
      filter === "coupons" && couponSpotFilter
        ? feedOnly.filter((item) => item.spot_id === couponSpotFilter)
        : feedOnly;
    if (followedSpotIdSet) {
      spotScoped = spotScoped.filter((item) => followedSpotIdSet.has(item.spot_id));
    }
    if (filter === "rewards" || filter === "all") {
      const cards = stampCards.filter((c) => matchesInboxFilter(c, filter));
      const scopedCards = followedSpotIdSet
        ? cards.filter((c) => followedSpotIdSet.has(c.spot_id))
        : cards;
      return [...scopedCards, ...spotScoped];
    }
    return spotScoped;
  }, [baseFeed, stampCards, filter, couponSpotFilter, followedSpotIdSet]);

  const visibleAlerts = useMemo(() => {
    let list = filterAlerts(alerts, filter).filter((a) => {
      if (a.type !== "reward_ready") return true;
      const sid = alertSpotIds[a.id] || a.spotId;
      return !readyStampSpotIds.has(sid);
    });
    if (filter === "coupons" && couponSpotFilter) {
      list = list.filter(
        (a) => (alertSpotIds[a.id] || a.spotId) === couponSpotFilter,
      );
    }
    if (followedSpotIdSet) {
      list = list.filter((a) => followedSpotIdSet.has(alertSpotIds[a.id] || a.spotId));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) => a.title?.toLowerCase().includes(q) || a.body?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [alerts, filter, query, alertSpotIds, readyStampSpotIds, couponSpotFilter, followedSpotIdSet]);

  const unreadCount = useMemo(() => inboxBadgeCount(alerts, baseFeed), [alerts, baseFeed]);
  const isCouponsView = filter === "coupons";
  const showFollowedBar = followedBar.length > 0 && filter !== "rewards" && !isCouponsView;
  const showCouponSpotFilter = isCouponsView;
  const showAlerts =
    visibleAlerts.length > 0 && filter !== "spots" && (filter !== "coupons" || couponSpotOptions.length > 0);
  const showFeed =
    feed.filter((f) => !f._stampProgress).length > 0 || filter === "spots" || isCouponsView;
  const showStampCards = feed.some((f) => f._stampProgress) && !isCouponsView;
  const empty = visibleAlerts.length === 0 && feed.length === 0;

  const toggleSave = (id) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("spotloop_myspots_saved", JSON.stringify([...next]));
      return next;
    });
  };

  const openCoupon = (item) => {
    if (!item) return;
    setCouponItem(item);
  };

  const handleAlertClick = (alert) => {
    markInboxRead(alert.id);
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, unread: false } : a)));
    const sid = alertSpotIds[alert.id] || alert.spotId;
    if (alert.type === "reward_ready" || alert.cta?.includes("einlös")) {
      onWallet?.(sid);
      return;
    }
    if (alert.type === "campaign" && (alert.feedItem || alert.coupon)) {
      openCoupon(alert.feedItem || livePosts.find((p) => p.id === alert.id) || { ...alert, spot_id: sid });
      return;
    }
    if (sid) onSpotClick?.(sid);
  };

  const handleCta = (item, cta) => {
    if (cta.action === "coupon") {
      openCoupon(item);
      return;
    }
    if (cta.action === "wallet") onWallet?.(item.spot_id);
    else if (cta.action === "route") {
      const spot = spotsById[item.spot_id];
      if (spot?.lat && spot?.lng) {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`,
          "_blank",
          "noopener"
        );
      } else onSpotClick?.(item.spot_id);
    } else if (cta.action === "save") toggleSave(item.id);
    else onSpotClick?.(item.spot_id);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          background: C.bg,
        }}
      >
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.6 }}>
              {embedded && isCouponsView ? "Vorteile" : "My Spots"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginTop: 6, lineHeight: 1.45 }}>
              {embedded && isCouponsView
                ? "Deine Aktionen & Vorteile — nach Spot filtern."
                : "Deine Welt aus Rewards und Lieblingsspots."}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  markAllInboxRead(alerts.map((a) => a.id));
                  setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
                }}
                style={{
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.18)",
                  color: "rgba(255,255,255,.85)",
                  borderRadius: 10,
                  padding: "7px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Gelesen
              </button>
            )}
            {onBack && !embedded && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Zurück"
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "none",
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Segment + Suche */}
      <div
        style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
          boxShadow: `0 4px 20px ${C.shadow}`,
        }}
      >
        <SegmentTabs filter={filter} onChange={setFilter} unreadCount={unreadCount} />

        <p
          style={{
            margin: "0 16px 12px",
            fontSize: 12,
            color: C.muted,
            lineHeight: 1.55,
            fontWeight: 500,
          }}
        >
          {activeMeta.hint}
        </p>

        <div style={{ padding: "0 16px 14px", position: "relative" }}>
          <Search
            size={15}
            color={C.muted}
            style={{
              position: "absolute",
              left: 28,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…"
            style={{
              width: "100%",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "12px 36px 12px 40px",
              fontSize: 13,
              color: C.dark,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      <div className="scroll-y" style={{ flex: 1, padding: "16px 16px 36px", minHeight: 0 }}>
        {showFollowedBar && (
          <section style={{ marginBottom: 20 }}>
            <SectionLabel icon={<MapPin size={13} />} title="Deine Lieblingsspots" />
            <FollowedSpotsOrganizer
              spots={organizedFollowedBar}
              sortMode={followedSort}
              categoryFilter={followedCategoryFilter}
              userCategories={spotCategoryOverrides}
              onSortChange={(mode) => {
                setFollowedSort(mode);
                saveFollowedOrganizePrefs(user.uid, { sort: mode });
              }}
              onCategoryFilterChange={setFollowedCategoryFilter}
              onAssignCategory={(spotId, bucketId) => {
                const next = setSpotCategoryOverride(user.uid, spotId, bucketId);
                setSpotCategoryOverrides(next);
              }}
              onSpotClick={onSpotClick}
              SpotChip={FollowedSpotChip}
            />
          </section>
        )}

        {showCouponSpotFilter && (
          <section style={{ marginBottom: 20 }}>
            <CouponSpotFilterTiles
              spots={couponSpotOptions}
              totalCount={allCouponItems.length}
              activeSpotId={couponSpotFilter}
              onSelect={setCouponSpotFilter}
            />
          </section>
        )}

        {showStampCards && (filter === "rewards" || filter === "all") && (
          <section style={{ marginBottom: 20 }}>
            <SectionLabel icon={<Gift size={13} />} title="Dein Fortschritt" />
            <AnimatePresence>
              {feed
                .filter((f) => f._stampProgress)
                .map((item, i) => (
                  <StampProgressCard
                    key={item.id}
                    item={item}
                    stamp={stamps.find((s) => s.spot_id === item.spot_id)}
                    index={i}
                    onCta={(cta) => handleCta(item, cta)}
                    onSpot={() => onSpotClick?.(item.spot_id)}
                  />
                ))}
            </AnimatePresence>
          </section>
        )}

        {showAlerts && (
          <section style={{ marginBottom: 20 }}>
            <SectionLabel
              icon={filter === "coupons" ? <Ticket size={13} /> : <Sparkles size={13} />}
              title={
                filter === "coupons"
                  ? "Aktions-Benachrichtigungen"
                  : filter === "rewards"
                    ? "Für dich"
                    : "Kurz & wichtig"
              }
            />
            <AnimatePresence>
              {visibleAlerts.map((alert, i) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  index={i}
                  onOpen={() => handleAlertClick(alert)}
                  onDismiss={() => {
                    dismissInboxAlert(alert.id);
                    setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
                  }}
                />
              ))}
            </AnimatePresence>
          </section>
        )}

        {showFeed && feed.filter((f) => !f._stampProgress).length > 0 && (
          <section>
            <SectionLabel
              icon={filter === "coupons" ? <Ticket size={13} /> : <MapPin size={13} />}
              title={
                filter === "coupons"
                  ? couponSpotFilter
                    ? `Vorteile · ${spotsById[couponSpotFilter]?.name || "Spot"}`
                    : "Alle Vorteile"
                  : filter === "spots"
                    ? "Neu von deinen Spots"
                    : "Updates"
              }
            />
            <AnimatePresence>
              {feed
                .filter((f) => !f._stampProgress)
                .map((item, i) => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    index={i}
                    saved={saved.has(item.id)}
                    onCta={(cta) => handleCta(item, cta)}
                    onSpot={() => onSpotClick?.(item.spot_id)}
                    onSave={() => toggleSave(item.id)}
                  />
                ))}
            </AnimatePresence>
          </section>
        )}

        {empty && (
          <EmptyInbox
            title={activeMeta.emptyTitle}
            body={activeMeta.emptyBody}
            filter={filter}
          />
        )}
      </div>

      <CouponRevealSheet
        item={couponItem}
        open={Boolean(couponItem)}
        onClose={() => setCouponItem(null)}
        onSpot={onSpotClick}
      />
    </div>
  );
}

function SegmentTabs({ filter, onChange, unreadCount }) {
  const icons = { all: Sparkles, rewards: Gift, spots: MapPin, coupons: Ticket };
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "14px 16px 0",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {INBOX_FILTERS.map((tab) => {
        const Icon = icons[tab.id] || Sparkles;
        const active = filter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              flex: "1 0 76px",
              minWidth: 76,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "12px 8px",
              borderRadius: 16,
              border: "none",
              cursor: "pointer",
              background: active ? C.dark : C.bg,
              color: active ? "#fff" : C.muted,
              boxShadow: active ? `0 8px 24px rgba(6,13,8,.18)` : "none",
              transition: "all .2s ease",
            }}
          >
            <Icon size={18} strokeWidth={active ? 2.4 : 2} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.2 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Spot-Kacheln zum Filtern von Kampagnen-Coupons */
function CouponSpotFilterTiles({ spots, totalCount, activeSpotId, onSelect }) {
  const allActive = !activeSpotId;

  return (
    <div
      style={{
        background: C.white,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        padding: 14,
        boxShadow: `0 4px 18px ${C.shadow}`,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, color: C.dark, marginBottom: 10 }}>
        Nach Spot filtern
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
        <button
          type="button"
          onClick={() => onSelect(null)}
          style={{
            flexShrink: 0,
            minWidth: 72,
            padding: "12px 10px",
            borderRadius: 16,
            border: `2px solid ${allActive ? C.green : C.border}`,
            background: allActive ? C.mintLight : C.white,
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>🎟️</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.dark }}>Alle</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginTop: 2 }}>
            {totalCount}
          </div>
        </button>
        {spots.map((spot) => {
          const active = activeSpotId === spot.id;
          return (
            <button
              key={spot.id}
              type="button"
              onClick={() => onSelect(active ? null : spot.id)}
              style={{
                flexShrink: 0,
                minWidth: 80,
                padding: "12px 10px",
                borderRadius: 16,
                border: `2px solid ${active ? spot.bg : C.border}`,
                background: active ? `${spot.bg}12` : C.white,
                cursor: "pointer",
                textAlign: "center",
                boxShadow: active ? `0 6px 20px ${spot.bg}25` : "none",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  margin: "0 auto 6px",
                  background: `${spot.bg}18`,
                  border: `1.5px solid ${spot.bg}35`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                {spot.emoji}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.dark,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 72,
                }}
              >
                {spot.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: active ? spot.bg : C.muted,
                  marginTop: 2,
                }}
              >
                {spot.count} Vorteil{spot.count !== 1 ? "e" : ""}
              </div>
            </button>
          );
        })}
      </div>
      {spots.length === 0 && (
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 4 }}>
          Noch keine Vorteile — sobald ein Spot eine Aktion sendet, erscheinen die Filter hier.
        </div>
      )}
    </div>
  );
}

function SectionLabel({ icon, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
        color: C.muted,
      }}
    >
      {icon}
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase" }}>
        {title}
      </span>
    </div>
  );
}

function FollowedSpotChip({ spot, onClick, onLongPress }) {
  const pressTimer = useRef(null);

  const clearPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const handlePointerDown = () => {
    clearPress();
    if (onLongPress) {
      pressTimer.current = setTimeout(() => {
        pressTimer.current = null;
        onLongPress();
      }, 500);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={clearPress}
      onPointerLeave={clearPress}
      onPointerCancel={clearPress}
      onContextMenu={(e) => {
        if (onLongPress) {
          e.preventDefault();
          onLongPress();
        }
      }}
      style={{
        flexShrink: 0,
        width: 80,
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: "14px 10px",
        cursor: "pointer",
        position: "relative",
        boxShadow: `0 4px 14px ${C.shadow}`,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: `${spot.bg}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          margin: "0 auto 8px",
        }}
      >
        {spot.emoji}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: C.dark,
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {spot.name.split(" ")[0]}
      </div>
      {spot.bucket_label && (
        <div
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: C.muted,
            textAlign: "center",
            marginTop: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {spot.bucket_emoji} {spot.bucket_label}
        </div>
      )}
      {spot.new_updates > 0 && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            minWidth: 18,
            height: 18,
            borderRadius: 99,
            background: C.green,
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {spot.new_updates}
        </div>
      )}
    </button>
  );
}

function StampProgressCard({ item, stamp, index, onCta, onSpot }) {
  const cta = ctaForItem(item);
  const spot = stamp?.spot || {
    name: item.spot_name,
    emoji: item.spot_emoji,
    bg_color: item.spot_bg,
    category: item.spot_category,
  };
  const stampData = stamp || {
    points: item.progress?.points ?? 0,
    max_points: item.progress?.max ?? 10,
    reward_ready: item.reward_available,
    reward_text: item.description,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ marginBottom: 10 }}
    >
      <StampCard
        stamp={stampData}
        spot={spot}
        variant="compact"
        onPress={onSpot}
        onRedeem={() => onCta(cta)}
        showCta={false}
      />
      {item.description && !item.reward_available && (
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 8, padding: "0 4px" }}>
          {item.description}
        </div>
      )}
      <Btn small full onClick={() => onCta(cta)} style={{ marginTop: 10 }}>
        {cta.label} →
      </Btn>
    </motion.div>
  );
}

function AlertCard({ alert, index, onOpen, onDismiss }) {
  const isCouponPush = alert.type === "campaign" && (alert.coupon || alert.pushHeadline);

  if (isCouponPush) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ delay: index * 0.03 }}
        style={{ marginBottom: 12, position: "relative" }}
      >
        <div onClick={onOpen} style={{ cursor: "pointer" }}>
          <CampaignPushPreview alert={alert} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            paddingLeft: 2,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>
            {ALERT_TYPE_LABEL[alert.type]} · {alert.time}
          </span>
          {alert.unread && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: C.green,
                background: C.mintLight,
                padding: "3px 8px",
                borderRadius: 99,
              }}
            >
              Neu
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.();
          }}
          aria-label="Ausblenden"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.25)",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          ×
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: index * 0.03 }}
      onClick={onOpen}
      style={{
        background: C.white,
        border: `1px solid ${alert.unread ? `${alert.color}30` : C.border}`,
        borderRadius: 18,
        padding: "14px 16px",
        marginBottom: 10,
        cursor: "pointer",
        boxShadow: alert.unread ? `0 6px 20px ${alert.color}10` : `0 2px 8px ${C.shadow}`,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: `${alert.color}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {alert.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 4 }}>
            {alert.title}
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{alert.body}</div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: alert.color }}>
              {ALERT_TYPE_LABEL[alert.type]}
            </span>
            {alert.cta && (
              <span style={{ fontSize: 11, fontWeight: 800, color: alert.color }}>{alert.cta} →</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeedCard({ item, index, saved, onCta, onSpot, onSave }) {
  const accent = TYPE_COLORS[item.update_type] || C.green;
  const typeLabel = UPDATE_TYPE_LABELS[item.update_type] || "Update";
  const cta = ctaForItem(item);
  const showSave = item.update_type === "action" || item.update_type === "happy_hour";
  const isCoupon = isCampaignCouponItem(item);

  if (isCoupon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ delay: index * 0.04 }}
        style={{ marginBottom: 14 }}
      >
        <div onClick={() => onCta(cta)} style={{ cursor: "pointer" }}>
          <CampaignPushPreview item={item} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <Btn small full onClick={() => onCta(cta)}>
            Vorteil öffnen →
          </Btn>
          <button
            type="button"
            onClick={onSpot}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              background: C.white,
              fontSize: 12,
              fontWeight: 700,
              color: C.muted,
              cursor: "pointer",
            }}
          >
            Spot
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ delay: index * 0.04 }}
      style={{
        background: C.white,
        border: `1px solid ${item.is_new ? `${accent}28` : C.border}`,
        borderRadius: 20,
        marginBottom: 12,
        overflow: "hidden",
        boxShadow: `0 4px 18px ${C.shadow}`,
      }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${item.spot_bg || accent}, ${accent}88)` }} />
      <div style={{ padding: "16px" }}>
        <button
          type="button"
          onClick={onSpot}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `${item.spot_bg || accent}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {item.spot_emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{item.spot_name}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{item.time_label}</div>
          </div>
          <Tag color={accent} bg={`${accent}12`}>
            {item.badge_label || typeLabel}
          </Tag>
        </button>
        {item.image_url && (
          <img
            src={item.image_url}
            alt=""
            style={{
              width: "100%",
              maxHeight: 180,
              objectFit: "cover",
              borderRadius: 14,
              marginBottom: 12,
              display: "block",
            }}
          />
        )}
        <div style={{ fontSize: 15, fontWeight: 800, color: C.dark, marginBottom: 6, lineHeight: 1.35 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 12 }}>
          {item.description}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small full={false} onClick={() => onCta(cta)} style={{ flex: 1 }}>
            {cta.label} →
          </Btn>
          {showSave && (
            <button
              type="button"
              onClick={onSave}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${saved ? C.green : C.border}`,
                background: saved ? C.mintLight : C.white,
                cursor: "pointer",
              }}
            >
              <Bookmark size={14} color={saved ? C.green : C.muted} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyInbox({ title, body, filter }) {
  const emoji =
    filter === "rewards" ? "🎁" : filter === "spots" ? "📍" : filter === "coupons" ? "🎟️" : "✨";
  return (
    <Card style={{ textAlign: "center", padding: "44px 24px", borderRadius: 22 }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>{emoji}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.dark, letterSpacing: -0.3 }}>{title}</div>
      <div style={{ fontSize: 14, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>{body}</div>
    </Card>
  );
}

export function NotificationBell({ count, onClick }) {
  return (
    <motion.button
      type="button"
      aria-label="My Spots öffnen"
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        position: "relative",
        flexShrink: 0,
        background: "linear-gradient(145deg, #6366F1 0%, #1B4FD8 100%)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 15,
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        boxShadow: "0 8px 20px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <Bell size={22} color="#fff" strokeWidth={2.25} />
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            minWidth: 20,
            height: 20,
            borderRadius: 99,
            background: "linear-gradient(135deg, #F97316, #EF4444)",
            border: "2px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 5px",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.45)",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{count > 9 ? "9+" : count}</span>
        </motion.div>
      )}
    </motion.button>
  );
}
