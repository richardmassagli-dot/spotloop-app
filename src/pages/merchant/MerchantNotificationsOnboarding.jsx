import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Share, Plus, Smartphone } from "lucide-react";
import { C, CARD_GRADIENT } from "../../components/ui";
import { MERCHANT_NOTIF_ONBOARDING } from "../../data/spotloopRetentionTriggers";
import { markMerchantNotificationsOnboarded } from "../../lib/retentionTriggers";

const isIOS =
  typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

/** Ein Screen nach erstem Login — Notifications + optional PWA (iOS). */
export default function MerchantNotificationsOnboarding({ userId, onDone }) {
  const finish = async () => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }
    markMerchantNotificationsOnboarded(userId);
    onDone?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 11000,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        padding: "max(24px, env(safe-area-inset-top)) 24px max(32px, env(safe-area-inset-bottom))",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{
            width: 88,
            height: 88,
            borderRadius: 28,
            background: `${C.blue}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Bell size={44} color={C.blue} strokeWidth={2} />
        </motion.div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: C.dark,
            textAlign: "center",
            lineHeight: 1.25,
            margin: "0 0 12px",
            letterSpacing: -0.5,
            maxWidth: 320,
          }}
        >
          {MERCHANT_NOTIF_ONBOARDING.headline}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: C.muted,
            textAlign: "center",
            lineHeight: 1.55,
            margin: 0,
            maxWidth: 340,
          }}
        >
          {MERCHANT_NOTIF_ONBOARDING.body}
        </p>

        {isIOS && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: 32,
              width: "100%",
              maxWidth: 320,
              background: C.white,
              borderRadius: 20,
              border: `1px solid ${C.border}`,
              padding: 20,
              boxShadow: "0 4px 20px rgba(10,22,40,.08)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textAlign: "center", marginBottom: 16 }}>
              {MERCHANT_NOTIF_ONBOARDING.pwaHint}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
              <PwaStep icon={Share} label="Teilen" active />
              <div style={{ flex: 1, height: 2, background: C.border, marginBottom: 20 }} />
              <PwaStep icon={Plus} label="Zum Home-Bildschirm" active />
              <div style={{ flex: 1, height: 2, background: C.border, marginBottom: 20 }} />
              <PwaStep icon={Smartphone} label="Fertig" />
            </div>
          </motion.div>
        )}
      </div>

      <button
        type="button"
        onClick={finish}
        style={{
          width: "100%",
          minHeight: 52,
          borderRadius: 16,
          border: "none",
          background: CARD_GRADIENT,
          color: "#fff",
          fontSize: 16,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 8px 24px rgba(27,79,216,.25)",
        }}
      >
        {MERCHANT_NOTIF_ONBOARDING.cta}
      </button>
      <button
        type="button"
        onClick={finish}
        style={{
          width: "100%",
          marginTop: 12,
          minHeight: 44,
          background: "none",
          border: "none",
          color: C.muted,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Später
      </button>
    </motion.div>
  );
}

function PwaStep({ icon: Icon, label, active }) {
  return (
    <div style={{ textAlign: "center", flex: "0 0 72px" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          margin: "0 auto 8px",
          background: active ? `${C.blue}14` : C.bg,
          border: `1.5px solid ${active ? C.blue : C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} color={active ? C.blue : C.muted} />
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: active ? C.dark : C.muted, lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}
