import { C } from "../ui";
import { formatEuro } from "../../lib/merchantInsights";
import CountUp from "./CountUp";

const METRICS = [
  { key: "returningRevenue", label: "Wiederkehr-Umsatz", format: (v) => formatEuro(v), accent: C.green },
  { key: "repeatRate", label: "Wiederkehrquote", format: (v) => `${v} %`, accent: C.blue },
  { key: "activeStammgaeste", label: "Stammgäste", format: (v) => String(v), accent: C.dark },
  { key: "sleepers", label: "Schläfer", format: (v) => String(v), accent: C.orange, warn: true },
];

/**
 * 2×2 KPI-Grid — Stammgäste & Umsatz (Hub, Sheet, Übersicht).
 */
export default function StammgaesteMetricsGrid({
  data = {},
  variant = "hub",
  animate = false,
}) {
  const isSheet = variant === "sheet";
  const isHub = variant === "hub";

  const values = {
    returningRevenue: data.returningRevenue ?? 1248,
    repeatRate: data.repeatRate ?? 42,
    activeStammgaeste: data.activeStammgaeste ?? 12,
    sleepers: data.sleepers ?? 3,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: isHub ? 10 : 8,
        width: "100%",
      }}
    >
      {METRICS.map((m) => {
        const raw = values[m.key];
        const display = m.format(raw);
        const showWarn = m.warn && raw > 0;

        return (
          <div
            key={m.key}
            style={{
              padding: isSheet ? "14px 12px" : "12px 10px",
              borderRadius: isSheet ? 16 : 14,
              background: isSheet ? C.white : "#F8FAFC",
              border: `1px solid ${showWarn ? `${C.orange}35` : C.border}`,
              minHeight: isSheet ? 76 : 64,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: isSheet ? 11 : 10,
                fontWeight: 700,
                color: C.muted,
                lineHeight: 1.25,
                marginBottom: 6,
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: isSheet ? 20 : 17,
                fontWeight: 900,
                color: showWarn ? C.orange : m.accent,
                letterSpacing: -0.5,
                lineHeight: 1.1,
                wordBreak: "break-word",
              }}
            >
              {showWarn && "⚠ "}
              {animate && typeof raw === "number" && m.key !== "repeatRate" ? (
                m.key === "returningRevenue" ? (
                  <CountUp
                    value={raw}
                    format={(n) =>
                      new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      }).format(n)
                    }
                  />
                ) : (
                  <CountUp value={raw} />
                )
              ) : (
                display
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Wiederkehr-Score Balken */
export function StammgaesteScoreBar({ score = 73, animate = false }) {
  const s = Math.min(100, Math.max(0, score));

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          fontWeight: 700,
          color: C.muted,
          marginBottom: 8,
        }}
      >
        <span>Wiederkehr-Score</span>
        <span style={{ color: C.dark, fontWeight: 900 }}>
          {animate ? <CountUp value={s} /> : s}
          <span style={{ fontWeight: 700, color: C.muted }}> / 100</span>
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 99,
          background: "#E2E8F0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${s}%`,
            borderRadius: 99,
            background: "linear-gradient(90deg, #1B4FD8, #059669)",
            transition: animate ? "width 0.8s ease-out" : "none",
          }}
        />
      </div>
    </div>
  );
}
