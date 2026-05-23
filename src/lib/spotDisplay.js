/** Kategorie-Text ohne führendes Emoji (vermeidet „☕ ☕ Café“). */
export function categoryLabelOnly(spot) {
  const raw = (spot?.category || "").trim();
  if (!raw) return "";
  const emoji = spot?.emoji || "";
  if (emoji && raw.startsWith(emoji)) return raw.slice(emoji.length).trim();
  return raw.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, "").trim() || raw;
}

/** Ein Emoji + Kategorie, z. B. „☕ Café“. */
export function spotCategoryLine(spot, defaultEmoji = "☕") {
  const emoji = spot?.emoji || defaultEmoji;
  const label = categoryLabelOnly(spot);
  return label ? `${emoji} ${label}` : emoji;
}
