import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, Logo } from "../components/ui";

const SLIDES = [
  {
    emoji: "💳",
    title: "Dein Loyalty-Wallet",
    body: "Alle Stempelkarten deiner Lieblingscafés, Restaurants und Bäckereien — an einem Ort. Übersichtlich. Immer dabei.",
    bg: "#0A1628",
    accent: "#1B4FD8",
    accentLight: "#EFF6FF",
  },
  {
    emoji: "🎁",
    title: "Echte Rewards",
    body: "Gratis Kaffee, Mahlzeiten, Rabatte. Transparente Punkte — kein Kleingedrucktes. Einfach besuchen und sammeln.",
    bg: "#0D2A5E",
    accent: "#0EA5E9",
    accentLight: "#E0F2FE",
  },
  {
    emoji: "📍",
    title: "Lokale Spots entdecken",
    body: "Finde verifizierte lokale Gastronomiebetriebe in deiner Nähe. Keine Werbung. Nur echte, empfohlene Orte.",
    bg: "#12203A",
    accent: "#F59E0B",
    accentLight: "#FFFBEB",
  },
];

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 320 : -320, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -320 : 320, opacity: 0 }),
};

export default function Onboarding({ onDone }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir]     = useState(1);

  const slide = SLIDES[index];

  const next = () => {
    if (index < SLIDES.length - 1) { setDir(1); setIndex(i => i + 1); }
    else onDone();
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: slide.bg, transition: "background .55s ease", position: "relative", overflow: "hidden" }}>
      {/* Subtle radial glow */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.07, 0.12, 0.07] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: -100, right: -100, width: 320, height: 320, borderRadius: "50%", background: slide.accent, pointerEvents: "none" }}
      />
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        style={{ position: "absolute", bottom: -80, left: -80, width: 260, height: 260, borderRadius: "50%", background: "#fff", pointerEvents: "none" }}
      />

      {/* Skip */}
      <div style={{ padding: "52px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <Logo size={22} light />
        <button
          onClick={onDone}
          style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.6)", borderRadius: 99, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Überspringen
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 36px", position: "relative" }}>
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={index}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 30, stiffness: 360 }}
            style={{ textAlign: "center", width: "100%" }}
          >
            <motion.div
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, type: "spring", damping: 16 }}
              style={{ width: 100, height: 100, borderRadius: 30, background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, margin: "0 auto 36px" }}
            >
              {slide.emoji}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 16 }}
            >
              {slide.title}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              style={{ fontSize: 15, color: "rgba(255,255,255,.55)", lineHeight: 1.75, maxWidth: 290, margin: "0 auto" }}
            >
              {slide.body}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div style={{ padding: "0 24px 48px", position: "relative" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === index ? 22 : 7, background: i === index ? slide.accent : "rgba(255,255,255,.2)" }}
              transition={{ duration: 0.28 }}
              style={{ height: 7, borderRadius: 99, cursor: "pointer" }}
              onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          style={{
            width: "100%", background: slide.accent, color: "#fff",
            border: "none", borderRadius: 18, padding: "16px",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            boxShadow: `0 8px 28px ${slide.accent}55`,
            letterSpacing: -0.3,
          }}
        >
          {index === SLIDES.length - 1 ? "Loslegen →" : "Weiter →"}
        </motion.button>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "rgba(255,255,255,.2)", fontWeight: 700, letterSpacing: 3 }}>
          SPOTLOOP
        </div>
      </div>
    </div>
  );
}
