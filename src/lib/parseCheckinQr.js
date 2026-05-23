/**
 * Liest aus einem gescannten QR-Text die Spot-/Händler-ID (checkin-Parameter).
 * @returns {{ spotId: string|null, expired: boolean }}
 */
export function parseCheckinQr(text) {
  if (!text || typeof text !== "string") return { spotId: null, expired: false };
  const trimmed = text.trim();

  try {
    const url = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(trimmed, window.location.origin);
    const cid = url.searchParams.get("checkin");
    const exp = url.searchParams.get("exp");
    if (cid) {
      const expired = !!(exp && Number(exp) < Date.now());
      return { spotId: expired ? null : cid, expired };
    }
  } catch {
    /* kein vollständiger URL */
  }

  const inline = trimmed.match(/[?&]checkin=([a-f0-9-]{36})/i);
  if (inline) {
    const expMatch = trimmed.match(/[?&]exp=(\d+)/i);
    const expired = !!(expMatch && Number(expMatch[1]) < Date.now());
    return { spotId: expired ? null : inline[1], expired };
  }

  if (/^[a-f0-9-]{36}$/i.test(trimmed)) return { spotId: trimmed, expired: false };

  return { spotId: null, expired: false };
}

/** @deprecated Nutze parseCheckinQr für expired-Feedback */
export function parseCheckinFromQr(text) {
  return parseCheckinQr(text).spotId;
}
