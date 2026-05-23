import { ChevronRight } from "lucide-react";
import { C } from "../ui";

export default function SectionHeader({ label, count, actionLabel, onAction, icon: Icon }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: C.dark,
            letterSpacing: -0.4,
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        {count && (
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 3 }}>
            {count}
          </div>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "linear-gradient(165deg, #FFFFFF 0%, #EFF6FF 100%)",
            border: `1px solid ${C.border}`,
            borderRadius: 99,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: C.blue,
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(10,22,40,.05)",
          }}
        >
          {Icon && <Icon size={14} strokeWidth={2.2} />}
          {actionLabel}
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
