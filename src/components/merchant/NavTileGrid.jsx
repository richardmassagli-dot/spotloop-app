import PremiumTile from "../PremiumTile";

/** Dezente Akzentfarben pro Merchant-Bereich */
export const TILE_ACCENTS = {
  overview: { from: "#0A1628", to: "#1B4FD8", glow: "rgba(27, 79, 216, 0.2)" },
  stampdesign: { from: "#0284C7", to: "#06B6D4", glow: "rgba(6, 182, 212, 0.22)" },
  notifications: { from: "#6366F1", to: "#818CF8", glow: "rgba(99, 102, 241, 0.2)" },
  spotpage: { from: "#0F766E", to: "#14B8A6", glow: "rgba(20, 184, 166, 0.2)" },
  qr: { from: "#0A1628", to: "#475569", glow: "rgba(15, 23, 42, 0.16)" },
  campaigns: { from: "#1D4ED8", to: "#7C3AED", glow: "rgba(124, 58, 237, 0.2)" },
  community: { from: "#BE185D", to: "#EC4899", glow: "rgba(236, 72, 153, 0.2)" },
  network: { from: "#0369A1", to: "#0EA5E9", glow: "rgba(14, 165, 233, 0.2)" },
  brandkit: { from: "#C026D3", to: "#E879F9", glow: "rgba(192, 38, 211, 0.2)" },
  analytics: { from: "#0A1628", to: "#0EA5E9", glow: "rgba(14, 165, 233, 0.2)" },
  msettings: { from: "#475569", to: "#64748B", glow: "rgba(100, 116, 139, 0.16)" },
  profile: { from: "#1B4FD8", to: "#60A5FA", glow: "rgba(27, 79, 216, 0.2)" },
  content: { from: "#EA580C", to: "#FB923C", glow: "rgba(249, 115, 22, 0.2)" },
  preview: { from: "#0F766E", to: "#2DD4BF", glow: "rgba(45, 212, 191, 0.2)" },
  pricing: { from: "#059669", to: "#34D399", glow: "rgba(52, 211, 153, 0.22)" },
};

function accentFor(item) {
  if (item.accent) return item.accent;
  return TILE_ACCENTS[item.id] || { from: "#1B4FD8", to: "#0EA5E9", glow: "rgba(27, 79, 216, 0.18)" };
}

/**
 * Navigation als Kachel-Grid — modern, hochwertig.
 * items: { id, label, emoji?, hint?, accent? }[]
 */
export default function NavTileGrid({ items, active, onSelect, columns = 2 }) {
  const compact = columns >= 3;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: compact ? 14 : 14,
      }}
    >
      {items.map((item, index) => (
        <PremiumTile
          key={item.id}
          index={index}
          compact={compact}
          iconVariant="soft"
          isActive={active === item.id}
          accent={accentFor(item)}
          emoji={item.emoji}
          icon={item.icon}
          label={item.label}
          hint={item.hint}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </div>
  );
}
