/** Kurz prüfen ob vermutlich eine gespeicherte Supabase-Session existiert. */
export function hasLikelyStoredSession() {
  try {
    if (typeof localStorage === "undefined") return false;
    return Object.keys(localStorage).some(
      (k) => k.startsWith("sb-") && k.includes("auth-token"),
    );
  } catch {
    return false;
  }
}
