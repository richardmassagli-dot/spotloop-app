// localStorage fallback — mirrors the Supabase schema exactly.
// Active when VITE_SUPABASE_URL is not set. Replace with Supabase for production.

const get = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

// ── AUTH ─────────────────────────────────────────────────────────
export const localAuth = {
  currentUser: null,

  _load() {
    this.currentUser = get("local_currentUser");
  },

  async signIn(email, password) {
    const users = get("local_users", {});
    const user  = Object.values(users).find(u => u.email === email);
    if (!user) throw new Error("auth/user-not-found");
    if (user.password !== password) throw new Error("auth/wrong-password");
    this.currentUser = user;
    set("local_currentUser", user);
    return { user };
  },

  async register(email, password, name, role, birthday) {
    const users = get("local_users", {});
    if (Object.values(users).find(u => u.email === email)) throw new Error("auth/email-already-in-use");
    const id = uid();
    const user = { uid: id, id, email, password, name, role, birthday: birthday || null, created_at: now() };
    users[user.uid] = user;
    set("local_users", users);
    set("local_currentUser", user);
    this.currentUser = user;
    return { user };
  },

  signOut() {
    this.currentUser = null;
    localStorage.removeItem("local_currentUser");
  },

  onAuthStateChanged(cb) {
    this._load();
    cb(this.currentUser);
    return () => {};
  },
};

// ── SPOTS ─────────────────────────────────────────────────────────
export const localSpots = {
  save(merchantId, data) {
    const spots = get("local_spots", {});
    spots[merchantId] = {
      ...data,
      id: merchantId,
      merchant_id: merchantId,
      verification_status: data.verification_status ?? "verified",
      verification_note: data.verification_note ?? null,
      verified_at: data.verified_at ?? null,
      total_checkins: data.total_checkins ?? 0,
      followers: data.followers ?? 0,
    };
    set("local_spots", spots);
  },

  get(spotId) {
    return get("local_spots", {})[spotId] ?? null;
  },

  getAll() {
    return Object.values(get("local_spots", {}));
  },

  update(spotId, delta) {
    const spots = get("local_spots", {});
    if (spots[spotId]) {
      Object.entries(delta).forEach(([k, v]) => {
        if (typeof v === "object" && v?.__increment) {
          spots[spotId][k] = (spots[spotId][k] ?? 0) + v.__increment;
        } else {
          spots[spotId][k] = v;
        }
      });
      set("local_spots", spots);
    }
  },

  subscribe(spotId, cb) {
    cb(this.get(spotId));
    return () => {};
  },
};

// ── STAMPS (loyalty cards) ────────────────────────────────────────
export const localStamps = {
  _id: (userId, spotId) => `${userId}_${spotId}`,

  getOrCreate(userId, spotId) {
    const stamps = get("local_stamps", {});
    const id     = this._id(userId, spotId);
    if (!stamps[id]) {
      const spot = localSpots.get(spotId);
      stamps[id] = {
        id,
        user_id:     userId,
        spot_id:     spotId,
        points:      0,
        max_points:  spot?.max_points || 10,
        reward_text: spot?.reward_text || "Reward",
        reward_ready: false,
        updated_at:  now(),
      };
      set("local_stamps", stamps);
    }
    return stamps[id];
  },

  addPoint(userId, spotId) {
    const stamps  = get("local_stamps", {});
    const id      = this._id(userId, spotId);
    const stamp   = this.getOrCreate(userId, spotId);
    const newPts  = stamp.points + 1;
    const ready   = newPts >= stamp.max_points;
    stamp.points      = newPts;
    stamp.reward_ready = ready;
    stamp.updated_at  = now();
    stamps[id] = stamp;
    set("local_stamps", stamps);

    // Log check-in
    const checkins = get("local_checkins", []);
    checkins.unshift({ id: uid(), user_id: userId, spot_id: spotId, points: newPts, reward_triggered: ready, ts: now() });
    set("local_checkins", checkins.slice(0, 200));

    // Update spot stats
    localSpots.update(spotId, { total_checkins: { __increment: 1 } });

    return stamp;
  },

  redeem(userId, spotId) {
    const stamps = get("local_stamps", {});
    const id     = this._id(userId, spotId);
    if (stamps[id]) {
      stamps[id].points      = 0;
      stamps[id].reward_ready = false;
      stamps[id].updated_at  = now();
      set("local_stamps", stamps);
    }
  },

  forUser(userId) {
    const all = Object.values(get("local_stamps", {})).filter(s => s.user_id === userId);
    return all.map(s => {
      const spot = localSpots.get(s.spot_id);
      return { ...s, spot };
    });
  },
};

// ── FOLLOWS ──────────────────────────────────────────────────────
export const localFollows = {
  follow(userId, spotId) {
    const f = get("local_follows", {});
    f[`${userId}_${spotId}`] = true;
    set("local_follows", f);
    localSpots.update(spotId, { followers: { __increment: 1 } });
  },
  unfollow(userId, spotId) {
    const f = get("local_follows", {});
    delete f[`${userId}_${spotId}`];
    set("local_follows", f);
    localSpots.update(spotId, { followers: { __increment: -1 } });
  },
  isFollowing(userId, spotId) {
    return !!get("local_follows", {})[`${userId}_${spotId}`];
  },
};

// ── CHECKINS ─────────────────────────────────────────────────────
export const localCheckins = {
  forSpot(spotId, limit = 10) {
    return get("local_checkins", []).filter(c => c.spot_id === spotId).slice(0, limit);
  },
  subscribe(spotId, cb) {
    cb(this.forSpot(spotId));
    return () => {};
  },
  stats(spotId) {
    const all = get("local_checkins", []).filter(c => c.spot_id === spotId);
    return { total_checkins: all.length, redemptions: all.filter(c => c.reward_triggered).length };
  },
};

// ── CAMPAIGNS ────────────────────────────────────────────────────
export const localCampaigns = {
  create(spotId, data) {
    const list = get("local_campaigns", []);
    list.unshift({ id: uid(), spot_id: spotId, ...data, status: "gesendet", created_at: now() });
    set("local_campaigns", list);
  },
  forSpot(spotId) {
    return get("local_campaigns", []).filter(c => c.spot_id === spotId);
  },
};
