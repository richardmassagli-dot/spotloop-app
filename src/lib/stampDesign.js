/**
 * Stempelkarten-Design — localStorage + page_config + spots-Spalten.
 */
import { supabase } from "./supabase";
import { IS_LOCAL_MODE } from "./config";
import { localSpots } from "./localStore";
import { updateSpot } from "./firestore";

const key = (spotId) => `spotloop_stamp_design_${spotId}`;

function readJson(spotId) {
  try {
    const raw = localStorage.getItem(key(spotId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredStampDesign(spotId) {
  return readJson(spotId);
}

export function saveStoredStampDesign(spotId, design) {
  localStorage.setItem(key(spotId), JSON.stringify(design));
}

/** Design aus localStorage / page_config auf Spot anwenden */
export function applyStampDesignToSpot(spot) {
  if (!spot?.id) return spot;
  const stored = getStoredStampDesign(spot.id);
  const fromPage =
    spot.page_config?.stamp_design && typeof spot.page_config.stamp_design === "object"
      ? spot.page_config.stamp_design
      : null;
  const d = { ...fromPage, ...stored };
  if (!d || Object.keys(d).length === 0) return spot;
  return {
    ...spot,
    emoji: d.emoji ?? spot.emoji,
    bg_color: d.bg_color ?? spot.bg_color,
    reward_text: d.reward_text ?? spot.reward_text,
    max_points: d.max_points != null ? Number(d.max_points) : spot.max_points,
    current_action: d.current_action !== undefined ? d.current_action : spot.current_action,
  };
}

export async function saveStampCardDesign(spotId, design) {
  const payload = {
    emoji: design.emoji || "☕",
    bg_color: design.bg_color || "#1B4FD8",
    reward_text: (design.reward_text || "Gratis Kaffee").trim(),
    max_points: Math.max(1, parseInt(design.max_points, 10) || 10),
    current_action: design.current_action?.trim() || null,
  };

  saveStoredStampDesign(spotId, payload);

  try {
    const row = await updateSpot(spotId, payload);
    if (row) return applyStampDesignToSpot(row);
    throw new Error("Speichern ohne Rückgabe — Fallback wird versucht.");
  } catch (primaryErr) {
    if (IS_LOCAL_MODE) throw primaryErr;
    if (!supabase) throw primaryErr;

    const { data: existing, error: readErr } = await supabase
      .from("spots")
      .select("page_config")
      .eq("id", spotId)
      .maybeSingle();
    if (readErr) throw primaryErr;

    const pageConfig = {
      ...(existing?.page_config && typeof existing.page_config === "object" ? existing.page_config : {}),
      stamp_design: payload,
    };

    const { data, error } = await supabase
      .from("spots")
      .update({ page_config: pageConfig, ...payload })
      .eq("id", spotId)
      .select("*");

    if (error) {
      const { data: data2, error: err2 } = await supabase
        .from("spots")
        .update({ page_config: pageConfig })
        .eq("id", spotId)
        .select("*");
      if (err2) throw primaryErr;
      if (!data2?.length) throw new Error("Spot nicht gefunden — bitte zuerst das Spot-Setup abschließen.");
      return applyStampDesignToSpot(data2[0]);
    }
    if (!data?.length) throw new Error("Spot nicht gefunden — bitte zuerst das Spot-Setup abschließen.");
    return applyStampDesignToSpot(data[0]);
  }

  if (IS_LOCAL_MODE) {
    const row = localSpots.get(spotId);
    return applyStampDesignToSpot(row);
  }

  throw new Error("Speichern fehlgeschlagen — bitte erneut versuchen.");
}
