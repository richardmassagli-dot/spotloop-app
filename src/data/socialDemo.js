/** Demo data for Spotloop Social — local-first, premium & calm */

export const DEMO_FRIENDS = [
  { id: "f1", name: "Anna Keller", avatar: "AK", color: "#1B4FD8", mutualSpots: 3 },
  { id: "f2", name: "Max Vogel", avatar: "MV", color: "#0EA5E9", mutualSpots: 5 },
  { id: "f3", name: "Lisa Tran", avatar: "LT", color: "#6366F1", mutualSpots: 2 },
  { id: "f4", name: "Jonas Hart", avatar: "JH", color: "#F59E0B", mutualSpots: 4 },
];

export const DEMO_FRIEND_REQUESTS = [
  { id: "r1", name: "Stefania S.", avatar: "SS", color: "#14B8A6", mutualSpots: 1 },
];

export const DEMO_ACTIVITIES = [
  { id: "a1", type: "visit", user: "Anna Keller", avatar: "AK", color: "#1B4FD8", spot: "Brewed Bliss", spotId: "demo-brewed", time: "vor 2 Std." },
  { id: "a2", type: "follow", user: "Max Vogel", avatar: "MV", color: "#0EA5E9", spot: "Burger House", spotId: "demo-burger", time: "vor 5 Std." },
  { id: "a3", type: "friends_like", count: 3, spot: "Pizza Roma", spotId: "demo-pizza", time: "heute" },
  { id: "a4", type: "reward", user: "Lisa Tran", avatar: "LT", color: "#6366F1", spot: "Green Bowl", spotId: "demo-green", time: "gestern" },
  { id: "a5", type: "share", user: "Jonas Hart", avatar: "JH", color: "#F59E0B", spot: "Café Mond", spotId: "demo-mond", message: "Perfekt für Sonntag!", time: "gestern" },
];

export const DEMO_COLLECTIONS = [
  { id: "c1", title: "Lieblingscafés", emoji: "☕", visibility: "friends", spotIds: ["demo-brewed", "demo-mond"], count: 4 },
  { id: "c2", title: "Date Night", emoji: "🌙", visibility: "private", spotIds: ["demo-green", "demo-pizza"], count: 3 },
  { id: "c3", title: "Burger Favorites", emoji: "🍔", visibility: "friends", spotIds: ["demo-burger"], count: 2 },
  { id: "c4", title: "Hidden Gems", emoji: "💎", visibility: "private", spotIds: [], count: 0 },
];

export const DEMO_POLLS = [
  {
    id: "p1",
    title: "Wo essen wir Freitag?",
    creator: "Du",
    status: "open",
    options: [
      { id: "o1", spotId: "demo-burger", name: "Burger House", emoji: "🍔", votes: 2 },
      { id: "o2", spotId: "demo-pizza", name: "Pizza Roma", emoji: "🍕", votes: 3 },
      { id: "o3", spotId: "demo-green", name: "Green Bowl", emoji: "🥗", votes: 1 },
    ],
    invited: 4,
    voted: 3,
    closesAt: "Freitag 18:00",
  },
];

export const DEMO_MOMENTS = [
  { id: "m1", user: "Anna Keller", avatar: "AK", color: "#1B4FD8", spot: "Brewed Bliss", dish: "Flat White", caption: "Bester Kaffee in Stuttgart-West.", rating: 5, emoji: "☕" },
  { id: "m2", user: "Max Vogel", avatar: "MV", color: "#0EA5E9", spot: "Burger House", dish: "Smash Burger", caption: "Knusprig, nicht zu fettig.", rating: 4, emoji: "🍔" },
];

export const DEMO_SOCIAL_MAP_HINTS = [
  { spotId: "demo-burger", label: "Max folgt", friends: 2 },
  { spotId: "demo-pizza", label: "4 Freunde waren hier", friends: 4 },
  { spotId: "demo-brewed", label: "Anna war hier", friends: 1 },
];

export const DEFAULT_SOCIAL_PREFS = {
  show_activity: true,
  show_visited_spots: true,
  show_on_social_map: true,
  moments_visibility: "friends",
  collections_default: "private",
  group_rewards: true,
};
