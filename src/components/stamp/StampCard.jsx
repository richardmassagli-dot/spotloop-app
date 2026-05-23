import { motion } from "framer-motion";
import { Gift, ChevronRight } from "lucide-react";
import { C } from "../../design/tokens.js";
import StampSlots from "./StampSlots";
import { stampThemeFromSpot, stampProgress } from "./stampTheme";
import BankCardShell, { BankCardContactless, BankCardNumber } from "../cards/BankCardShell";

function stampCardGradient(bg) {
  return `linear-gradient(145deg, ${bg} 0%, ${bg}cc 38%, #0A1628 92%)`;
}

function formatCardPoints(n, maxLen = 4) {
  const s = String(Math.max(0, n ?? 0)).padStart(2, "0");
  return s.length > maxLen ? s.slice(-maxLen) : s.padStart(maxLen, "0");
}

/**
 * Stempelkarte — Bankkarten-Look, Spot-Farbe & Branding.
 * variant: full | compact | mini | wallet
 */
export default function StampCard({
  stamp,
  spot: spotProp,
  variant = "full",
  onPress,
  onRedeem,
  showCta = true,
  redeeming = false,
  style,
}) {
  const spot = spotProp || stamp?.spot || {};
  const theme = stampThemeFromSpot(spot, stamp);
  const { points, max, pct, left, ready } = stampProgress(stamp?.points, stamp?.max_points);
  const rewardReady = stamp?.reward_ready || ready;

  if (variant === "mini") {
    return (
      <MiniStampCard
        theme={theme}
        points={points}
        max={max}
        pct={pct}
        rewardReady={rewardReady}
        rewardText={theme.rewardText}
        onPress={onPress}
        onRedeem={onRedeem}
      />
    );
  }

  if (variant === "compact") {
    return (
      <CompactStampCard
        theme={theme}
        points={points}
        max={max}
        left={left}
        rewardReady={rewardReady}
        rewardText={theme.rewardText}
        onPress={onPress}
        onRedeem={onRedeem}
        style={style}
      />
    );
  }

  return (
    <FullStampCard
      theme={theme}
      points={points}
      max={max}
      left={left}
      rewardReady={rewardReady}
      rewardText={theme.rewardText}
      onPress={onPress}
      onRedeem={onRedeem}
      showCta={showCta}
      redeeming={redeeming}
      style={style}
    />
  );
}

function FullStampCard({
  theme,
  points,
  max,
  left,
  rewardReady,
  rewardText,
  onPress,
  onRedeem,
  showCta,
  redeeming,
  style,
}) {
  const { bg, emoji, name, category } = theme;
  const glow = rewardReady
    ? `0 0 0 2px ${C.orange}55, 0 20px 40px ${C.orange}30`
    : `0 0 0 1px ${bg}40`;

  return (
    <div style={style}>
      <motion.div
        animate={rewardReady ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={rewardReady ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
      <BankCardShell gradient={stampCardGradient(bg)} glow={glow}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {rewardReady && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: "rgba(255,255,255,.95)",
                  color: C.orange,
                  borderRadius: 8,
                  padding: "5px 8px",
                  fontSize: 9,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Gift size={10} />
                Reward freigeschaltet
              </motion.div>
            )}
            <BankCardContactless />
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "rgba(255,255,255,.55)",
              letterSpacing: 2,
            }}
          >
            SPOT-KARTE
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: -0.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </div>
              {category && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 2 }}>
                  {category}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <BankCardNumber size={14}>
            {formatCardPoints(points)} / {formatCardPoints(max)}
          </BankCardNumber>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,.55)",
              marginTop: 6,
              fontWeight: 600,
            }}
          >
            {rewardReady ? "Jetzt einlösen" : `Noch ${left} ${left === 1 ? "Besuch" : "Besuche"}`}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <StampSlots points={points} max={max} color={bg} size="sm" onDark />
        </div>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <div style={{ fontSize: 8, color: "rgba(255,255,255,.45)", letterSpacing: 1, fontWeight: 700 }}>
            REWARD
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              marginTop: 2,
              lineHeight: 1.3,
            }}
          >
            {rewardText}
          </div>
        </div>
      </BankCardShell>
      </motion.div>

      {showCta && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={redeeming}
          onClick={(e) => {
            if (rewardReady && onRedeem) {
              e.stopPropagation?.();
              onRedeem(e);
            } else if (onPress) {
              onPress(e);
            }
          }}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "14px",
            borderRadius: 14,
            border: "none",
            cursor: redeeming ? "not-allowed" : "pointer",
            opacity: redeeming ? 0.7 : 1,
            background: rewardReady ? `linear-gradient(135deg, ${C.orange}, #e85a20)` : bg,
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 8px 22px ${rewardReady ? C.orange : bg}45`,
          }}
        >
          {redeeming ? "Wird eingelöst…" : rewardReady ? "Reward einlösen" : "Spot öffnen"}
          {!redeeming && <ChevronRight size={16} />}
        </motion.button>
      )}
    </div>
  );
}

function CompactStampCard({
  theme,
  points,
  max,
  left,
  rewardReady,
  rewardText,
  onPress,
  onRedeem,
  style,
}) {
  const { bg, emoji, name } = theme;
  const glow = rewardReady ? `0 0 0 2px ${C.orange}50` : undefined;

  return (
    <BankCardShell
      gradient={stampCardGradient(bg)}
      glow={glow}
      onClick={rewardReady && onRedeem ? onRedeem : onPress}
      style={style}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <BankCardContactless />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,.5)", letterSpacing: 1.5 }}>
            SPOT-KARTE
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
        </div>
        <BankCardNumber size={12}>
          {formatCardPoints(points)}/{formatCardPoints(max)}
        </BankCardNumber>
      </div>
      <div style={{ marginTop: 10 }}>
        <StampSlots points={points} max={max} color={bg} size="sm" animate={false} onDark />
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,.7)", marginTop: 8, fontWeight: 600 }}>
        {rewardReady ? rewardText : `Noch ${left} · ${rewardText}`}
      </div>
    </BankCardShell>
  );
}

function MiniStampCard({ theme, points, max, pct, rewardReady, rewardText, onPress, onRedeem }) {
  const { bg, emoji, name } = theme;

  return (
    <div style={{ margin: "14px 16px 0" }}>
      <BankCardShell
        gradient={stampCardGradient(bg)}
        aspectRatio={2.4}
        onClick={rewardReady && onRedeem ? onRedeem : onPress}
        style={{
          boxShadow: rewardReady
            ? `0 8px 24px ${C.orange}25, 0 0 0 1px ${C.orange}40`
            : `0 8px 24px ${bg}25`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: "100%" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,.5)", letterSpacing: 1.2 }}>
              {name}
            </div>
            <BankCardNumber size={12}>
              {formatCardPoints(points)} / {formatCardPoints(max)}
            </BankCardNumber>
            <div
              style={{
                marginTop: 4,
                height: 3,
                borderRadius: 99,
                background: "rgba(255,255,255,.15)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: rewardReady ? C.orange : "rgba(255,255,255,.9)",
                }}
              />
            </div>
          </div>
          <span style={{ fontSize: 24 }}>{emoji}</span>
          {rewardReady && (
            <span style={{ fontSize: 10, fontWeight: 900, color: C.orange, background: "#fff", padding: "4px 8px", borderRadius: 8 }}>
              🎁
            </span>
          )}
        </div>
      </BankCardShell>
    </div>
  );
}
