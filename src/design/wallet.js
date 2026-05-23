/** Wallet screen design tokens */
export const colors = {
  navy: "#0A1628",
  blue: "#1B4FD8",
  teal: "#0EA5E9",
  purple: "#6366F1",
  muted: "#64748B",
  faint: "#94A3B8",
  coral: "#F97316",
};

export const shadow = {
  card: "0 4px 20px rgba(10,22,40,.08)",
};

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
