const hasUrl = Boolean(import.meta.env.VITE_SUPABASE_URL);
const hasAnon = Boolean(
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

/** True when Supabase env is incomplete → localStorage demo backend */
export const IS_LOCAL_MODE = !(hasUrl && hasAnon);

/** Demo spots/stamps only in local mode (production = real data only) */
export const SHOW_DEMO_DATA = IS_LOCAL_MODE;

export const APP_NAME = "myspot";
