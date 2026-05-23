import { SHOW_DEMO_DATA } from "./config";
import {
  DEMO_STAMPS,
  DEMO_SPOTS,
  DEMO_POSTS,
  DEMO_TRANSACTIONS,
  DEMO_PAYMENTS,
} from "../data/demo";
import { ensureSpotCoords } from "./spotCoords";

export const demoSpots = SHOW_DEMO_DATA ? DEMO_SPOTS : [];
export const demoStamps = SHOW_DEMO_DATA ? DEMO_STAMPS : [];
export const demoPosts = SHOW_DEMO_DATA ? DEMO_POSTS : [];
export const demoTransactions = SHOW_DEMO_DATA ? DEMO_TRANSACTIONS : [];
export const demoPayments = SHOW_DEMO_DATA ? DEMO_PAYMENTS : [];

/** Merge real spots with demo; alle Spots bekommen Karten-Koordinaten */
export function mergeSpots(realSpots = []) {
  const real = realSpots
    .filter((s) => !demoSpots.find((d) => d.id === s.id))
    .map((s, i) => ensureSpotCoords(s, i + demoSpots.length));
  return [...demoSpots, ...real];
}
