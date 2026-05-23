/**
 * Spot-Gruppen: Marke → Standorte → Community / Event / Reward
 */
import { supabase } from "./supabase";
import { IS_LOCAL_MODE } from "./config";
import {
  SPOT_GROUP_TYPES,
  DEMO_SPOT_GROUPS,
  DEMO_SPOT_GROUP_MEMBERS,
} from "../data/spotGroupsDemo";

export { SPOT_GROUP_TYPES };

const storeKey = (merchantId) => `spotloop_groups_${merchantId}`;

function readLocal(merchantId) {
  try {
    const raw = localStorage.getItem(storeKey(merchantId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      groups: Array.isArray(parsed.groups) ? parsed.groups : [],
      members: Array.isArray(parsed.members) ? parsed.members : [],
    };
  } catch {
    return null;
  }
}

function writeLocal(merchantId, data) {
  localStorage.setItem(storeKey(merchantId), JSON.stringify(data));
}

function demoNetworkForSpot(spotId) {
  const memberGroupIds = DEMO_SPOT_GROUP_MEMBERS
    .filter((m) => m.spot_id === spotId)
    .map((m) => m.group_id);
  if (!memberGroupIds.length) return null;

  const groups = DEMO_SPOT_GROUPS.filter(
    (g) => memberGroupIds.includes(g.id) || g.id === "grp-brand-roma",
  );
  const brand = DEMO_SPOT_GROUPS.find((g) => g.type === "brand" && g.id === "grp-brand-roma");
  const locations = DEMO_SPOT_GROUPS.filter((g) => g.type === "location");
  const children = DEMO_SPOT_GROUPS.filter(
    (g) => g.parent_id === "grp-brand-roma" && g.type !== "location",
  );

  return {
    brand,
    groups,
    locations,
    communities: children.filter((g) => g.type === "community"),
    events: children.filter((g) => g.type === "event"),
    rewards: children.filter((g) => g.type === "reward"),
    subgroups: children.filter((g) => g.type === "subgroup"),
    members: DEMO_SPOT_GROUP_MEMBERS.filter((m) => m.spot_id === spotId),
  };
}

function buildTree(groups, members, spotsById = {}) {
  const brand = groups.find((g) => g.type === "brand" && !g.parent_id) || groups.find((g) => g.type === "brand");
  const byParent = {};
  groups.forEach((g) => {
    const pid = g.parent_id || "_root";
    if (!byParent[pid]) byParent[pid] = [];
    byParent[pid].push(g);
  });

  const spotsForGroup = (groupId) =>
    members
      .filter((m) => m.group_id === groupId)
      .map((m) => ({ ...m, spot: spotsById[m.spot_id] }));

  return {
    brand,
    groups,
    locations: groups.filter((g) => g.type === "location"),
    communities: groups.filter((g) => g.type === "community"),
    events: groups.filter((g) => g.type === "event"),
    rewards: groups.filter((g) => g.type === "reward"),
    subgroups: groups.filter((g) => g.type === "subgroup"),
    members,
    byParent,
    spotsForGroup,
  };
}

/** Netzwerk für Merchant-Dashboard */
export async function getMerchantNetwork(merchantId, spot = null) {
  if (IS_LOCAL_MODE) {
    const stored = readLocal(merchantId);
    if (stored?.groups?.length) {
      return buildTree(stored.groups, stored.members, spot ? { [spot.id]: spot } : {});
    }
    if (spot?.id === "spot-pizza-roma" || spot?.name?.toLowerCase().includes("pizza roma")) {
      return demoNetworkForSpot("spot-pizza-roma");
    }
    return buildTree([], [], {});
  }

  if (!supabase) return buildTree([], [], {});

  const { data: groups } = await supabase
    .from("spot_groups")
    .select("*")
    .eq("merchant_id", merchantId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const groupIds = (groups ?? []).map((g) => g.id);
  let members = [];
  if (groupIds.length) {
    const { data: mem } = await supabase
      .from("spot_group_members")
      .select("*")
      .in("group_id", groupIds);
    members = mem ?? [];
  }

  return buildTree(groups ?? [], members, spot ? { [spot.id]: spot } : {});
}

/** Netzwerk für Gäste auf Spot-Detail */
export async function getSpotNetwork(spotId, spot = null) {
  if (IS_LOCAL_MODE) {
    const demo = demoNetworkForSpot(spotId);
    if (demo) return demo;
    const merchantId = spot?.merchant_id || spotId;
    const stored = readLocal(merchantId);
    if (!stored) return null;
    const memberGids = stored.members.filter((m) => m.spot_id === spotId).map((m) => m.group_id);
    if (!memberGids.length) return null;
    const related = stored.groups.filter(
      (g) => memberGids.includes(g.id) || stored.groups.some((x) => x.id === g.parent_id && memberGids.includes(x.id)),
    );
    const brandId = related.find((g) => g.type === "brand")?.id;
    const allInBrand = brandId
      ? stored.groups.filter((g) => g.id === brandId || g.parent_id === brandId)
      : related;
    return buildTree(allInBrand, stored.members.filter((m) => allInBrand.some((g) => g.id === m.group_id)));
  }

  if (!supabase) return null;

  const { data: memberships } = await supabase
    .from("spot_group_members")
    .select("group_id")
    .eq("spot_id", spotId);

  if (!memberships?.length) return null;

  const groupIds = memberships.map((m) => m.group_id);
  const { data: groups } = await supabase.from("spot_groups").select("*").in("id", groupIds).eq("is_active", true);

  const brand = (groups ?? []).find((g) => g.type === "brand");
  const brandId = brand?.id || groups?.[0]?.parent_id;

  let allGroups = groups ?? [];
  if (brandId) {
    const { data: siblings } = await supabase
      .from("spot_groups")
      .select("*")
      .or(`id.eq.${brandId},parent_id.eq.${brandId}`)
      .eq("is_active", true);
    allGroups = siblings ?? allGroups;
  }

  const allIds = allGroups.map((g) => g.id);
  const { data: members } = await supabase
    .from("spot_group_members")
    .select("*")
    .in("group_id", allIds);

  return buildTree(allGroups, members ?? []);
}

export async function saveMerchantNetwork(merchantId, groups, members) {
  if (IS_LOCAL_MODE) {
    writeLocal(merchantId, { groups, members });
    return { groups, members };
  }
  return { groups, members };
}

export function createLocalGroup(merchantId, { type, name, parent_id = null, emoji, description = "" }) {
  const stored = readLocal(merchantId) || { groups: [], members: [] };
  const group = {
    id: `grp-${Date.now()}`,
    merchant_id: merchantId,
    parent_id,
    type,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-").slice(0, 32),
    emoji: emoji || SPOT_GROUP_TYPES[type]?.emoji || "🏪",
    description,
    config: {},
    is_active: true,
  };
  stored.groups.push(group);
  writeLocal(merchantId, stored);
  return group;
}

export function linkSpotToGroup(merchantId, groupId, spotId, is_primary = false) {
  const stored = readLocal(merchantId) || { groups: [], members: [] };
  if (!stored.members.find((m) => m.group_id === groupId && m.spot_id === spotId)) {
    stored.members.push({ group_id: groupId, spot_id: spotId, is_primary });
  }
  writeLocal(merchantId, stored);
}

export function seedDemoNetworkForMerchant(merchantId, spotId) {
  if (spotId !== "spot-pizza-roma" && !String(spotId).includes("pizza")) return;
  writeLocal(merchantId, {
    groups: DEMO_SPOT_GROUPS.map((g) => ({ ...g, merchant_id: merchantId })),
    members: DEMO_SPOT_GROUP_MEMBERS,
  });
}
