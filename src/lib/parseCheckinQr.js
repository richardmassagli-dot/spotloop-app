/**
 * Liest aus einem gescannten QR-Text die Spot-/Händler-ID (checkin-Parameter).
 */
export function parseCheckinFromQr(text) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();

  try {
    const url = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(trimmed, window.location.origin);
    const cid = url.searchParams.get("checkin");
    if (cid) return cid;
  } catch {
    /* kein vollständiger URL */
  }

  const inline = trimmed.match(/[?&]checkin=([a-f0-9-]{36})/i);
  if (inline) return inline[1];

  if (/^[a-f0-9-]{36}$/i.test(trimmed)) return trimmed;

  return null;
}
