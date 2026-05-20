import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Eye, ThumbsUp, Users, Send, X, Zap, ChevronDown, CheckCircle } from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { createCampaign, getMerchantCampaigns } from "../../lib/firestore";

const POST_TYPES = [
  { id: "special",    emoji: "⚡", label: "Tages-Special",         desc: "Happy Hour, Angebot, Aktion",     color: "#D68A0C", bg: "#FEFAE7" },
  { id: "new_item",   emoji: "✨", label: "Neues Gericht / Produkt", desc: "Neuheit im Sortiment",            color: "#1A8272", bg: "#DDF5EE" },
  { id: "event",      emoji: "🎉", label: "Event",                   desc: "Veranstaltung, Workshop",         color: "#6355C7", bg: "#EEEAFA" },
  { id: "reward",     emoji: "🎁", label: "Reward-Aktion",           desc: "Sonderreward, Bonusaktion",       color: "#D95B1B", bg: "#FEF0EA" },
  { id: "behind",     emoji: "🎬", label: "Behind the Scenes",       desc: "Einblick, Team, Rohstoffe",       color: "#1A5C8A", bg: "#DDF0F5" },
  { id: "milestone",  emoji: "🏆", label: "Meilenstein",             desc: "Jubiläum, Award, Danke",          color: "#B8860B", bg: "#FEFAE7" },
];

const TYPE_MAP = Object.fromEntries(POST_TYPES.map(t => [t.id, t]));

export default function MerchantPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadErr, setLoadErr] = useState("");
  const [composing, setComposing] = useState(false);
  const [type, setType] = useState("special");
  const [caption, setCaption] = useState("");
  const [imgEmoji, setImgEmoji] = useState("");
  const [hasCampaign, setHasCampaign] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [showTypeSheet, setShowTypeSheet] = useState(false);

  useEffect(() => {
    getMerchantCampaigns(user.uid)
      .then((rows) => {
        const mapped = (rows ?? [])
          .filter((r) => (r.type || "").startsWith("post_"))
          .map((r) => ({
            id: r.id,
            type: (r.type || "").replace("post_", "") || "special",
            emoji: TYPE_MAP[(r.type || "").replace("post_", "") || "special"]?.emoji || "✨",
            title: r.message?.slice(0, 48) || "Post",
            text: r.message || "",
            published_at: r.created_at ? new Date(r.created_at).toLocaleString("de-DE") : "—",
            views: 0,
            reactions: 0,
            reach: 0,
            has_campaign: false,
            campaign_label: null,
            status: "live",
          }));
        setPosts(mapped);
      })
      .catch((e) => setLoadErr(e.message || "Posts konnten nicht geladen werden."));
  }, [user.uid]);

  const totalViews     = posts.reduce((a, p) => a + p.views, 0);
  const totalReactions = posts.reduce((a, p) => a + p.reactions, 0);
  const avgEngagement  = posts.length
    ? ((totalReactions / totalViews) * 100).toFixed(1)
    : "0.0";

  const publish = async () => {
    if (!caption.trim()) return;
    setPublishing(true);
    setLoadErr("");
    try {
      const selectedType = POST_TYPES.find((t) => t.id === type);
      await createCampaign(user.uid, {
        type: `post_${type}`,
        message: `${imgEmoji || selectedType.emoji} ${caption}`,
        spot_name: "Post",
      });
      const fresh = await getMerchantCampaigns(user.uid);
      const mapped = (fresh ?? [])
        .filter((r) => (r.type || "").startsWith("post_"))
        .map((r) => ({
          id: r.id,
          type: (r.type || "").replace("post_", "") || "special",
          emoji: TYPE_MAP[(r.type || "").replace("post_", "") || "special"]?.emoji || "✨",
          title: r.message?.slice(0, 48) || "Post",
          text: r.message || "",
          published_at: r.created_at ? new Date(r.created_at).toLocaleString("de-DE") : "—",
          views: 0,
          reactions: 0,
          reach: 0,
          has_campaign: false,
          campaign_label: null,
          status: "live",
        }));
      setPosts(mapped);
      setCaption("");
      setImgEmoji("");
      setHasCampaign(false);
      setPublished(true);
      setTimeout(() => { setPublished(false); setComposing(false); }, 2200);
    } catch (e) {
      setLoadErr(e.message || "Post konnte nicht veröffentlicht werden.");
    } finally {
      setPublishing(false);
    }
  };

  const selectedType = POST_TYPES.find(t => t.id === type);

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* ── Stats strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { icon: <Eye size={14} color={C.teal} />,      label: "Post-Views",    val: totalViews.toLocaleString("de"),     bg: "#DDF0F5", c: C.teal },
          { icon: <ThumbsUp size={14} color={C.fresh} />, label: "Reaktionen",   val: totalReactions,                      bg: C.mintLight, c: C.fresh },
          { icon: <Users size={14} color={C.purple} />,   label: "Ø Engagement", val: `${avgEngagement}%`,                 bg: C.purpleLight, c: C.purple },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "12px 10px", textAlign: "center", border: `1px solid ${s.c}15` }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: s.c, letterSpacing: -0.5 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {loadErr && (
        <div style={{ marginBottom: 12, fontSize: 12, color: C.orange, fontWeight: 700 }}>{loadErr}</div>
      )}

      {/* ── Composer ── */}
      <AnimatePresence>
        {!composing ? (
          <motion.button
            key="cta"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setComposing(true)}
            style={{
              width: "100%", background: CARD_GRADIENT, border: "none", borderRadius: 18,
              padding: "16px", fontSize: 14, fontWeight: 800, color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: `0 8px 28px ${C.shadowLg}`, marginBottom: 20,
            }}
          >
            <Plus size={18} /> Neuen Post erstellen
          </motion.button>
        ) : (
          <motion.div
            key="composer"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20, boxShadow: `0 4px 20px ${C.shadow}` }}
          >
            {/* Composer header */}
            <div style={{ background: CARD_GRADIENT, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Neuer Post</div>
              <button onClick={() => { setComposing(false); setCaption(""); }} style={{ background: "rgba(255,255,255,.12)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: "16px" }}>
              {/* Post type selector */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 7, letterSpacing: 0.5 }}>TYP</div>
                <button
                  onClick={() => setShowTypeSheet(v => !v)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: selectedType.bg, border: `1.5px solid ${selectedType.color}30`, borderRadius: 14, padding: "11px 14px", cursor: "pointer" }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${selectedType.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {selectedType.emoji}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{selectedType.label}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{selectedType.desc}</div>
                  </div>
                  <ChevronDown size={16} color={C.muted} style={{ transform: showTypeSheet ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </button>

                <AnimatePresence>
                  {showTypeSheet && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden", marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}
                    >
                      {POST_TYPES.filter(t => t.id !== type).map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setType(t.id); setShowTypeSheet(false); }}
                          style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer" }}
                        >
                          <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{t.emoji}</span>
                          <div style={{ flex: 1, textAlign: "left" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{t.label}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{t.desc}</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Image emoji picker */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 7, letterSpacing: 0.5 }}>BILD / EMOJI</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 14, background: C.bg, border: `2px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: imgEmoji ? 32 : 24, flexShrink: 0, color: C.muted }}>
                    {imgEmoji || selectedType.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {["☕","🍰","🥗","🍕","🍔","🫗","☀️","🎶","🌿","🏆","🎉","✨"].map(e => (
                        <button key={e} onClick={() => setImgEmoji(e)} style={{ fontSize: 22, background: imgEmoji === e ? C.mintLight : C.bg, border: `1px solid ${imgEmoji === e ? C.fresh : C.border}`, borderRadius: 8, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 7, letterSpacing: 0.5 }}>NACHRICHT</div>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value.slice(0, 200))}
                  placeholder={`z.B. "${selectedType.desc} — jetzt verfügbar!"`}
                  rows={3}
                  style={{ width: "100%", background: C.bg, border: `1.5px solid ${caption ? C.green : C.border}`, borderRadius: 14, padding: "12px 14px", fontSize: 14, color: C.dark, outline: "none", resize: "none", fontFamily: "inherit", transition: "border-color .15s", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, marginTop: 4 }}>
                  <span>Deine Follower erhalten eine Benachrichtigung</span>
                  <span>{caption.length}/200</span>
                </div>
              </div>

              {/* Campaign attach */}
              <button
                onClick={() => setHasCampaign(v => !v)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: hasCampaign ? C.mintLight : C.bg, border: `1.5px solid ${hasCampaign ? C.green : C.border}`, borderRadius: 12, padding: "11px 14px", cursor: "pointer", marginBottom: 14 }}
              >
                <Zap size={16} color={hasCampaign ? C.green : C.muted} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: hasCampaign ? C.green : C.dark }}>Kampagne verknüpfen</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Optional: Reward oder Bonus anhängen</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: hasCampaign ? C.green : C.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {hasCampaign && <span style={{ fontSize: 12, color: "#fff" }}>✓</span>}
                </div>
              </button>

              {/* Publish */}
              <button
                onClick={publish}
                disabled={!caption.trim() || publishing || published}
                style={{
                  width: "100%", background: published ? C.fresh : caption.trim() ? CARD_GRADIENT : C.border,
                  color: caption.trim() || published ? "#fff" : C.muted,
                  border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800,
                  cursor: caption.trim() && !publishing && !published ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: caption.trim() && !published ? `0 6px 20px ${C.shadowLg}` : "none",
                  transition: "all .25s",
                }}
              >
                {published
                  ? <><CheckCircle size={16} /> Veröffentlicht!</>
                  : publishing
                  ? "Wird gesendet…"
                  : <><Send size={15} /> Jetzt veröffentlichen</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Post list ── */}
      <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 12 }}>
        Veröffentlichte Posts ({posts.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((post, i) => {
          const t = TYPE_MAP[post.type] || POST_TYPES[0];
          const engRate = post.views > 0 ? ((post.reactions / post.views) * 100).toFixed(1) : "0.0";
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: `0 2px 10px ${C.shadow}` }}
            >
              {/* Status strip */}
              {post.status === "live" && (
                <div style={{ background: C.mintLight, padding: "4px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.fresh }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: C.fresh }}>LIVE</span>
                  {post.has_campaign && (
                    <>
                      <span style={{ fontSize: 10, color: C.muted }}>·</span>
                      <Zap size={10} color={C.orange} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.orange }}>{post.campaign_label}</span>
                    </>
                  )}
                </div>
              )}

              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: t.bg, border: `1px solid ${t.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                    {post.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <div style={{ background: t.bg, borderRadius: 99, padding: "2px 8px" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: t.color }}>{t.label}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{post.published_at}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginBottom: 12 }}>{post.text}</div>

                {/* Post metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                  {[
                    { icon: <Eye size={12} />, val: post.views,     label: "Views",     color: C.teal },
                    { icon: <ThumbsUp size={12} />, val: post.reactions, label: "Likes", color: C.fresh },
                    { icon: <Users size={12} />,    val: post.reach,    label: "Reichweite", color: C.purple },
                    { icon: <Zap size={12} />,      val: `${engRate}%`, label: "Engagement",  color: C.orange },
                  ].map((m, j) => (
                    <div key={j} style={{ background: C.bg, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", color: m.color, marginBottom: 2 }}>{m.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: C.dark, letterSpacing: -0.3 }}>{m.val}</div>
                      <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
