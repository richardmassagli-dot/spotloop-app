/** Grobe Geöffnet/Geschlossen-Anzeige aus opening_hours-Text. */
export function isSpotOpenNow(spot) {
  const raw = spot?.opening_hours || spot?.hours || "";
  if (!raw.trim()) return null;
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const isWeekend = day === 0 || day === 6;
  const isWeekday = !isWeekend;

  if (/24\s*\/\s*7|rund um die uhr/i.test(raw)) return true;
  if (/geschlossen|closed/i.test(raw) && !/\d/.test(raw)) return false;

  if (isWeekday && /Mo[–\-]Fr\s*(\d{1,2})[.:](\d{2})?\s*[–\-]\s*(\d{1,2})/i.test(raw)) {
    const m = raw.match(/Mo[–\-]Fr\s*(\d{1,2})[.:]?(\d{2})?\s*[–\-]\s*(\d{1,2})[.:]?(\d{2})?/i);
    if (m) {
      const open = parseInt(m[1], 10) + (m[2] ? parseInt(m[2], 10) / 60 : 0);
      const close = parseInt(m[3], 10) + (m[4] ? parseInt(m[4], 10) / 60 : 0);
      return hour >= open && hour < close;
    }
  }

  if (isWeekend && /Sa[–\-]So|Sa|So/i.test(raw)) {
    if (hour >= 9 && hour < 20) return true;
  }

  if (hour >= 10 && hour < 22) return true;
  return false;
}

export function spotOpenLabel(spot) {
  const open = isSpotOpenNow(spot);
  if (open === null) return null;
  return open ? "Geöffnet" : "Geschlossen";
}
