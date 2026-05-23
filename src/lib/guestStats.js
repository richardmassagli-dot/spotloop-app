const REDEEMED_KEY = "spotloop_redeemed_total";

export function incrementRedeemedCount(userId) {
  const key = `${REDEEMED_KEY}_${userId}`;
  const n = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, String(n));
  return n;
}

export function getRedeemedCount(userId) {
  return parseInt(localStorage.getItem(`${REDEEMED_KEY}_${userId}`) || "0", 10);
}

export function getLastVisitStamp(stamps = []) {
  if (!stamps.length) return null;
  return [...stamps].sort((a, b) => {
    const ta = new Date(a.updated_at || a.last_visit || a.created_at || 0).getTime();
    const tb = new Date(b.updated_at || b.last_visit || b.created_at || 0).getTime();
    return tb - ta;
  })[0];
}

export function formatVisitLabel(isoOrLabel) {
  if (!isoOrLabel) return "—";
  if (typeof isoOrLabel === "string" && !isoOrLabel.includes("T") && isoOrLabel.length < 20) {
    return isoOrLabel;
  }
  const d = new Date(isoOrLabel);
  if (Number.isNaN(d.getTime())) return String(isoOrLabel);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}
