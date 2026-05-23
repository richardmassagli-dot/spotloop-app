const hasUrl = Boolean(import.meta.env.VITE_SUPABASE_URL);
const hasAnon = Boolean(
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

/** True when Supabase env is incomplete → localStorage demo backend */
export const IS_LOCAL_MODE = !(hasUrl && hasAnon);

/** Demo spots/stamps only in local mode (production = real data only) */
export const SHOW_DEMO_DATA = IS_LOCAL_MODE;

export const APP_NAME = "myspot";

/** E-Mail in Supabase `app_bootstrap_emails` → Admin + eigene Spot-Freigabe (Migration 004). */
export const ENABLE_DEV_BOOTSTRAP = import.meta.env.VITE_ENABLE_DEV_BOOTSTRAP === "true";

/**
 * Nur Header ohne Tabs (optional): VITE_MERCHANT_CLASSIC=true
 * Standard: volles Spot-Dashboard mit Übersicht, QR, Kampagne …
 */
export const MERCHANT_CLASSIC =
  import.meta.env.VITE_MERCHANT_CLASSIC === "true";
