/** Akzent aus Spot-Farbe für Kachel-Icons */
export function spotAccent(bg = "#1B4FD8") {
  return {
    from: bg,
    to: "#0EA5E9",
    glow: `${bg}33`,
  };
}
