import { SHOW_DEMO_DATA } from "./config";
import {
  DEMO_STAMPS,
  DEMO_SPOTS,
  DEMO_POSTS,
  DEMO_TRANSACTIONS,
} from "../data/demo";

export const demoSpots = SHOW_DEMO_DATA ? DEMO_SPOTS : [];
export const demoStamps = SHOW_DEMO_DATA ? DEMO_STAMPS : [];
export const demoPosts = SHOW_DEMO_DATA ? DEMO_POSTS : [];
export const demoTransactions = SHOW_DEMO_DATA ? DEMO_TRANSACTIONS : [];

/** Merge real spots with demo (demo only when SHOW_DEMO_DATA) */
export function mergeSpots(realSpots = []) {
  const realWithCoords = realSpots.filter(
    (s) => s.lat && s.lng && !demoSpots.find((d) => d.id === s.id)
  );
  return [...demoSpots, ...realWithCoords];
}
