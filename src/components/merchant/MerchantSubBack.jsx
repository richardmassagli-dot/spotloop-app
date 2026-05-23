import { ArrowLeft, ChevronRight } from "lucide-react";
import { C, CARD_GRADIENT } from "../ui";

/** Premium Zurück-Leiste zur Kachel-Übersicht */
export default function MerchantSubBack({ title, subtitle, onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      style={{
        width: "100%",
        marginBottom: 18,
        padding: 0,
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          borderRadius: 18,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          boxShadow: `0 4px 20px ${C.shadow}, 0 1px 0 rgba(255,255,255,.8) inset`,
          background: C.white,
        }}
      >
        <div
          style={{
            width: 52,
            background: CARD_GRADIENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} color="#fff" strokeWidth={2.5} />
        </div>
        <div
          style={{
            flex: 1,
            padding: "12px 14px 12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: C.blue,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Zurück
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: C.dark,
                letterSpacing: -0.35,
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.35 }}>{subtitle}</div>
            )}
          </div>
          <ChevronRight size={18} color={C.light} strokeWidth={2.25} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </button>
  );
}
