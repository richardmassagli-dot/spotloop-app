/** Kurz prüfen ob vermutlich eine gespeicherte Session existiert. */
export function hasLikelyStoredSession() {
  try {
    if (typeof localStorage === "undefined") return false;
    const keys = Object.keys(localStorage);
    if (keys.some((k) => k.startsWith("sb-") && k.includes("auth-token"))) return true;
    if (localStorage.getItem("myspot-auth")) return true;
    return false;
  } catch {
    return false;
  }
}
