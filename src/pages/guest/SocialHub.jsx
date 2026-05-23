import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Sparkles, Bookmark, Vote, Plus, UserPlus, Trash2,
  MapPin, Navigation, ChevronRight, Lock, Globe,
} from "lucide-react";
import { C, CARD_GRADIENT, Btn, Card } from "../../components/ui";
import FilterChip from "../../components/tiles/FilterChip";
import SocialAvatar from "../../components/social/SocialAvatar";
import ActivityFeed from "../../components/social/ActivityFeed";
import {
  hydrateSocial,
  getFriends, getFriendRequests, acceptFriendRequest, removeFriend, addFriendByCode,
  getFriendActivityFeed, getCollections, createCollection, getPolls, createPoll, votePoll, getPollWinner,
  getFoodMoments, getSocialPrefs, isSocialRemote, subscribePoll,
} from "../../lib/social";
import { getAllSpots } from "../../lib/firestore";
import { mergeSpots } from "../../lib/demoData";

const TABS = [
  { id: "activity", label: "Aktivität", Icon: Sparkles },
  { id: "friends", label: "Freunde", Icon: Users },
  { id: "collections", label: "Listen", Icon: Bookmark },
  { id: "polls", label: "Umfragen", Icon: Vote },
];

export default function SocialHub({ onSpotClick, onOpenPrivacy }) {
  const [section, setSection] = useState("activity");
  const [friends, setFriends] = useState(getFriends());
  const [requests, setRequests] = useState(getFriendRequests());
  const [activities, setActivities] = useState(getFriendActivityFeed());
  const [collections, setCollections] = useState(getCollections());
  const [polls, setPolls] = useState(getPolls());
  const [spots, setSpots] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [newListTitle, setNewListTitle] = useState("");
  const [showNewPoll, setShowNewPoll] = useState(false);
  const [pollTitle, setPollTitle] = useState("");
  const [selectedPollSpots, setSelectedPollSpots] = useState([]);
  const [remote, setRemote] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setFriends(getFriends());
    setRequests(getFriendRequests());
    setActivities(getFriendActivityFeed());
    setCollections(getCollections());
    setPolls(getPolls());
  };

  const reload = async () => {
    setLoading(true);
    const { remote: isRemote } = await hydrateSocial();
    setRemote(isRemote);
    refresh();
    setLoading(false);
  };

  useEffect(() => {
    getAllSpots().then((data) => setSpots(mergeSpots(data ?? []))).catch(() => setSpots(mergeSpots([])));
    reload();
    isSocialRemote().then(setRemote);
  }, []);

  const handleAccept = async (id) => { await acceptFriendRequest(id); await reload(); };
  const handleRemove = async (id) => { await removeFriend(id); await reload(); };
  const handleAddFriend = async () => {
    if (!friendName.trim()) return;
    await addFriendByCode(friendName.trim());
    setFriendName("");
    setShowAddFriend(false);
    await reload();
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%", paddingBottom: 100 }}>
      <div style={{ background: CARD_GRADIENT, padding: "52px 20px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.45)", letterSpacing: 2 }}>GEMEINSAM ENTDECKEN</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: -0.6, marginTop: 6 }}>
            Mit Freunden bessere Spots finden
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", marginTop: 8, lineHeight: 1.45, maxWidth: 300 }}>
            Kein Social-Media-Feed — nur hilfreiche, lokale Signale aus deinem Freundeskreis.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "14px 16px 6px", overflowX: "auto" }}>
        {TABS.map(({ id, label, Icon }, i) => (
          <FilterChip
            key={id}
            icon={Icon}
            label={label}
            active={section === id}
            onClick={() => setSection(id)}
            glass={false}
            index={i}
          />
        ))}
      </div>

      <div style={{ padding: "8px 16px 24px" }}>
        {loading && (
          <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "8px 0 16px" }}>Social wird geladen…</div>
        )}
        {section === "activity" && (
          <>
            <SectionLabel title="Freundes-Aktivität" sub="Relevant · lokal · übersichtlich" />
            <ActivityFeed items={activities} onSpotClick={onSpotClick} />
            <Card style={{ marginTop: 16, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 10 }}>Food Moments</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {getFoodMoments().slice(0, 2).map((m) => (
                  <div key={m.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {m.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{m.user} · {m.spot}</div>
                      <div style={{ fontSize: 13, color: C.dark, marginTop: 2 }}>{m.caption}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{m.dish}{m.rating ? ` · ${"★".repeat(m.rating)}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {section === "friends" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionLabel title="Freundesliste" sub={`${friends.length} Kontakte`} />
              <button type="button" onClick={() => setShowAddFriend(true)} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <UserPlus size={14} /> Hinzufügen
              </button>
            </div>

            {showAddFriend && (
              <Card style={{ marginBottom: 12, padding: 14 }}>
                <input value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder={remote ? "E-Mail des Freundes" : "Name (Demo)"} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, marginBottom: 8, fontSize: 14 }} />
                <Btn onClick={handleAddFriend} variant="dark">Einladen</Btn>
              </Card>
            )}

            {requests.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8 }}>Anfragen</div>
                {requests.map((r) => (
                  <FriendRow key={r.id} friend={r} onAccept={() => handleAccept(r.id)} isRequest />
                ))}
              </>
            )}

            {friends.map((f) => (
              <FriendRow key={f.id} friend={f} onRemove={() => handleRemove(f.id)} onSpotClick={onSpotClick} />
            ))}
          </>
        )}

        {section === "collections" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Neue Liste z.B. Brunch Ideen"
                style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13 }}
              />
              <button
                type="button"
                onClick={async () => {
                  if (!newListTitle.trim()) return;
                  await createCollection({ title: newListTitle.trim(), visibility: getSocialPrefs().collections_default });
                  setNewListTitle("");
                  await reload();
                }}
                style={{ background: C.green, color: "#fff", border: "none", borderRadius: 12, padding: "0 14px", cursor: "pointer" }}
              >
                <Plus size={18} />
              </button>
            </div>
            {collections.map((c) => (
              <Card key={c.id} style={{ marginBottom: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{c.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.count || 0} Spots · {c.visibility === "friends" ? "Mit Freunden" : "Privat"}</div>
                    </div>
                  </div>
                  {c.visibility === "private" ? <Lock size={14} color={C.muted} /> : <Globe size={14} color={C.teal} />}
                </div>
              </Card>
            ))}
          </>
        )}

        {section === "polls" && (
          <>
            <button
              type="button"
              onClick={() => setShowNewPoll(!showNewPoll)}
              style={{
                width: "100%", marginBottom: 14, padding: "12px", borderRadius: 14,
                border: `1.5px dashed ${C.border}`, background: C.white,
                fontSize: 13, fontWeight: 700, color: C.green, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Plus size={16} /> Gruppen-Umfrage erstellen
            </button>

            {showNewPoll && (
              <Card style={{ marginBottom: 14, padding: 14 }}>
                <input value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} placeholder="z.B. Wo essen wir Freitag?" style={{ width: "100%", padding: 10, borderRadius: 10, border: `1.5px solid ${C.border}`, marginBottom: 10, fontSize: 14 }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Spots vorschlagen (max. 4)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {spots.slice(0, 8).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedPollSpots((prev) => prev.find((x) => x.id === s.id) ? prev.filter((x) => x.id !== s.id) : prev.length < 4 ? [...prev, s] : prev)}
                      style={{
                        padding: "6px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        border: `1.5px solid ${selectedPollSpots.find((x) => x.id === s.id) ? C.green : C.border}`,
                        background: selectedPollSpots.find((x) => x.id === s.id) ? "#EFF6FF" : C.white,
                      }}
                    >
                      {s.emoji} {s.name}
                    </button>
                  ))}
                </div>
                <Btn
                  variant="dark"
                  onClick={async () => {
                    if (!pollTitle.trim() || selectedPollSpots.length < 2) return;
                    await createPoll({ title: pollTitle.trim(), optionSpots: selectedPollSpots });
                    setPollTitle("");
                    setSelectedPollSpots([]);
                    setShowNewPoll(false);
                    await reload();
                  }}
                >
                  Freunde einladen & starten
                </Btn>
              </Card>
            )}

            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} onVote={async (optionId) => { await votePoll(poll.id, optionId); await reload(); }} onSpotClick={onSpotClick} onRefresh={reload} />
            ))}
          </>
        )}

        <button
          type="button"
          onClick={onOpenPrivacy}
          style={{
            marginTop: 20, width: "100%", padding: 12, borderRadius: 14,
            border: `1px solid ${C.border}`, background: C.white,
            fontSize: 12, fontWeight: 700, color: C.muted, cursor: "pointer",
          }}
        >
          Social-Datenschutz anpassen →
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ title, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function FriendRow({ friend, onAccept, onRemove, isRequest, onSpotClick }) {
  return (
    <Card style={{ marginBottom: 8, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SocialAvatar initials={friend.avatar} color={friend.color} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>{friend.name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{friend.mutualSpots ?? 0} gemeinsame Lieblingsspots</div>
        </div>
        {isRequest ? (
          <button type="button" onClick={onAccept} style={{ background: C.green, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Annehmen
          </button>
        ) : (
          <button type="button" onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
            <Trash2 size={16} color={C.muted} />
          </button>
        )}
      </div>
      {!isRequest && friend.mutualSpots > 0 && (
        <button
          type="button"
          onClick={() => onSpotClick?.("demo-brewed")}
          style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: C.green, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
        >
          Gemeinsame Spots <ChevronRight size={12} />
        </button>
      )}
    </Card>
  );
}

function PollCard({ poll, onVote, onSpotClick, onRefresh }) {
  const total = poll.options.reduce((a, o) => a + (o.votes || 0), 0) || 1;
  const winner = getPollWinner(poll);

  useEffect(() => {
    return subscribePoll(poll.id, () => onRefresh?.());
  }, [poll.id, onRefresh]);

  return (
    <Card style={{ marginBottom: 12, padding: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.dark }}>{poll.title}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{poll.voted}/{poll.invited} Stimmen · {poll.closesAt}</div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {poll.options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onVote(o.id)}
            style={{
              textAlign: "left", border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "10px 12px", background: C.white, cursor: "pointer", position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: `${((o.votes || 0) / total) * 100}%`,
              background: "#EFF6FF", transition: "width .4s",
            }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{o.emoji} {o.name}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.green }}>{o.votes || 0}</span>
            </div>
          </button>
        ))}
      </div>
      {winner && total > 0 && (
        <div style={{ marginTop: 14, padding: 12, background: "#EFF6FF", borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Aktueller Favorit</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginTop: 4 }}>{winner.emoji} {winner.name}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="button" onClick={() => onSpotClick?.(winner.spotId)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: C.green, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Spot öffnen
            </button>
            <button type="button" style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Navigation size={14} /> Route
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
