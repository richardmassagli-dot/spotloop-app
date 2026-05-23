import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { C } from "../ui";
import { formatEuro } from "../../lib/merchantInsights";
import CountUp from "./CountUp";
import StammgaesteMetricsGrid, { StammgaesteScoreBar } from "./StammgaesteMetricsGrid";
import { MERCHANT_PAGE_BG } from "./merchantHeader";

const NAVY = "#0A1628";
const APP_FRAME_MAX_WIDTH = 390;
const SHEET_Z = 10000;

/** Portal-Ziel — Sheet liegt über overflow:hidden der App-Hülle. */
function useSheetPortal() {
  const [root, setRoot] = useState(null);
  useEffect(() => {
    setRoot(document.body);
  }, []);
  return root;
}

function EuroCountUp({ amount }) {
  return (
    <CountUp
      value={amount}
      format={(n) =>
        new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(n)
      }
    />
  );
}

export default function MerchantStammgaesteSheet({
  open,
  onClose,
  insights,
  onNavigate,
  onReactivation,
}) {
  const d = insights?.detail ?? {};
  const hub = insights?.hub ?? {};
  const score = hub.returnScore ?? 73;

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const chartTotal = (d.chart7 || []).reduce((s, day) => s + (day.count || 0), 0);
  const portalRoot = useSheetPortal();

  if (!portalRoot) return null;

  const sheet = (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: SHEET_Z,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: APP_FRAME_MAX_WIDTH,
              height: "100%",
              maxHeight: "100dvh",
            }}
          >
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(10, 22, 40, 0.45)",
              }}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                top: "6%",
                zIndex: 1,
                background: MERCHANT_PAGE_BG,
                borderRadius: "24px 24px 0 0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 -8px 40px rgba(10, 22, 40, 0.15)",
              }}
            >
            <div
              style={{
                flexShrink: 0,
                padding: "max(12px, env(safe-area-inset-top)) 16px 14px",
                borderBottom: `1px solid ${C.border}`,
                background: C.white,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Zurück"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <ArrowLeft size={20} color={C.dark} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: C.dark, lineHeight: 1.2 }}>
                    Stammgäste & Umsatz
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 2 }}>
                    Diesen Monat · anonym & DSGVO-konform
                  </div>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    padding: "6px 12px",
                    borderRadius: 99,
                    background: `${C.blue}14`,
                    color: C.blue,
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  Score {score}
                </span>
              </div>
            </div>

            <div className="scroll-y" style={{ flex: 1, padding: "16px 16px 32px", minHeight: 0 }}>
              {/* Zusammenfassung */}
              <div
                style={{
                  background: C.white,
                  borderRadius: 20,
                  border: `1px solid ${C.border}`,
                  padding: 16,
                  marginBottom: 16,
                  boxShadow: "0 2px 14px rgba(10, 22, 40, 0.06)",
                }}
              >
                <StammgaesteMetricsGrid data={hub} variant="sheet" animate />
                <div style={{ marginTop: 16 }}>
                  <StammgaesteScoreBar score={score} animate />
                </div>
              </div>

              {/* Trend-KPIs */}
              <SectionTitle>Trend</SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <TrendKpi
                  label="Wiederkehr-Umsatz"
                  value={<EuroCountUp amount={d.returningRevenue ?? 1248} />}
                  delta={`+${d.returningRevenueDelta ?? 18} %`}
                />
                <TrendKpi
                  label="Wiederkehrquote"
                  value={
                    <>
                      <CountUp value={d.repeatRate ?? 42} /> %
                    </>
                  }
                  delta={`+${d.repeatRateDelta ?? 6} %`}
                />
                <TrendKpi
                  label="Aktive Stammgäste"
                  value={<CountUp value={d.activeStammgaeste ?? 12} />}
                  span2={false}
                />
                <TrendKpi
                  label="Schläfer-Risiko"
                  value={String(hub.sleepers ?? 3)}
                  warn={(hub.sleepers ?? 0) > 0}
                />
              </div>

              <SectionTitle>Check-ins · letzte 7 Tage</SectionTitle>
              <div
                style={{
                  background: C.white,
                  borderRadius: 20,
                  border: `1px solid ${C.border}`,
                  padding: "16px 14px 14px",
                  marginBottom: 20,
                  boxShadow: "0 2px 12px rgba(10, 22, 40, 0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Gesamt</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: C.dark }}>{chartTotal}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    height: 96,
                  }}
                >
                  {(d.chart7 || []).map((day, i) => {
                    const h = Math.max(10, (day.count / (d.maxBar || 1)) * 80);
                    const last = i === (d.chart7?.length ?? 0) - 1;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: last ? C.blue : C.muted,
                            minHeight: 14,
                          }}
                        >
                          {day.count > 0 ? day.count : ""}
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: h }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                          style={{
                            width: "100%",
                            maxWidth: 32,
                            borderRadius: "6px 6px 2px 2px",
                            background: last ? C.blue : NAVY,
                            opacity: last ? 1 : 0.7,
                          }}
                        />
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <SectionTitle>Umsatz nach Segment</SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <SegmentTile
                  title="Stammgäste"
                  revenue={d.segments?.stamm?.revenue}
                  pct={d.segments?.stamm?.pct}
                  cta="VIP-Reward senden"
                  onCta={() => {
                    onClose();
                    onNavigate?.("reward");
                  }}
                  delay={0}
                />
                <SegmentTile
                  title="Aktive Gäste"
                  revenue={d.segments?.active?.revenue}
                  cta="Kampagne senden"
                  onCta={() => {
                    onClose();
                    onNavigate?.("campaigns");
                  }}
                  delay={0.05}
                />
                <SegmentTile
                  title="Schläfer"
                  revenue={d.segments?.sleepers?.revenue}
                  potential={d.segments?.sleepers?.potential}
                  cta="Reaktivieren"
                  onCta={() => {
                    onClose();
                    onReactivation?.();
                  }}
                  delay={0.1}
                  warn
                />
                <SegmentTile
                  title="Neue Gäste"
                  revenue={d.segments?.newGuests?.revenue}
                  cta="Willkommen senden"
                  onCta={() => {
                    onClose();
                    onNavigate?.("campaigns");
                  }}
                  delay={0.15}
                />
              </div>

              <SectionTitle>Top-Stammgäste</SectionTitle>
              <p style={{ fontSize: 11, color: C.muted, margin: "0 0 10px", lineHeight: 1.45 }}>
                Anonyme IDs · Besuchsmuster · Umsatz diesen Monat
              </p>
              <div
                style={{
                  background: C.white,
                  borderRadius: 20,
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                  marginBottom: 20,
                  boxShadow: "0 2px 12px rgba(10, 22, 40, 0.05)",
                }}
              >
                {(d.topGuests?.length ? d.topGuests : demoGuests()).map((g, i, arr) => (
                  <GuestRow key={g.pseudonym || i} guest={g} isLast={i === arr.length - 1} />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
                  border: "1px solid #FDBA74",
                  borderRadius: 20,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, color: C.dark, lineHeight: 1.45 }}>
                  {d.reactivation?.count ?? 3} Stammgäste waren {d.reactivation?.days ?? 21} Tage nicht da.
                  <br />
                  Potenzial {formatEuro(d.reactivation?.potential ?? 180)}.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReactivation?.();
                  }}
                  style={{
                    marginTop: 14,
                    width: "100%",
                    minHeight: 48,
                    borderRadius: 14,
                    border: "none",
                    background: C.orange,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Reaktivierungs-Kampagne senden
                </button>
              </motion.div>

              <p
                style={{
                  fontSize: 10,
                  color: C.muted,
                  textAlign: "center",
                  marginTop: 16,
                  lineHeight: 1.45,
                }}
              >
                Umsatz = Schätzung (Ø €15/Besuch) · sichtbare Wiederkehr, keine Garantie
              </p>
            </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(sheet, portalRoot);
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 900,
        color: C.dark,
        marginBottom: 10,
        letterSpacing: -0.2,
      }}
    >
      {children}
    </div>
  );
}

function TrendKpi({ label, value, delta, warn }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 16,
        border: `1px solid ${warn ? `${C.orange}40` : C.border}`,
        padding: "14px 12px",
        boxShadow: "0 2px 10px rgba(10, 22, 40, 0.04)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, lineHeight: 1.25 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: warn ? C.orange : C.dark,
          letterSpacing: -0.5,
          lineHeight: 1.1,
        }}
      >
        {warn ? "⚠ " : null}
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 11, fontWeight: 800, color: "#059669", marginTop: 6 }}>{delta}</div>
      )}
    </div>
  );
}

function GuestRow({ guest, isLast }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: isLast ? "none" : `1px solid ${C.border}`,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "start",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.dark }}>{guest.pseudonym}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>
          {guest.patternHint || "Regelmäßig unter der Woche"}
        </div>
        {guest.daysSinceVisit >= 18 && (
          <div style={{ fontSize: 10, fontWeight: 800, color: C.orange, marginTop: 6 }}>
            ⚠ {guest.daysSinceVisit} Tage nicht da
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>
          Umsatz
        </div>
        <div style={{ fontSize: 15, fontWeight: 900, color: C.dark, marginTop: 4 }}>
          {guest.revenueMonthLabel || formatEuro(guest.revenueMonthEstimate ?? 0)}
        </div>
      </div>
    </div>
  );
}

function SegmentTile({ title, revenue, pct, potential, cta, onCta, delay, warn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: C.white,
        borderRadius: 20,
        border: `1px solid ${warn ? `${C.orange}35` : C.border}`,
        padding: 14,
        boxShadow: "0 2px 12px rgba(10, 22, 40, 0.05)",
        display: "flex",
        flexDirection: "column",
        minHeight: 44,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 900, color: C.dark }}>{title}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: warn ? C.orange : C.green, marginTop: 8 }}>
        {warn && potential != null ? formatEuro(0) : formatEuro(revenue ?? 0)}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 4, lineHeight: 1.35 }}>
        {warn && potential != null
          ? `Potenzial ${formatEuro(potential)}`
          : pct != null
            ? `${pct} % des Monatsumsatzes`
            : "Geschätzt diesen Monat"}
      </div>
      <button
        type="button"
        onClick={onCta}
        style={{
          marginTop: 12,
          minHeight: 44,
          width: "100%",
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          background: C.bg,
          fontSize: 11,
          fontWeight: 800,
          color: C.blue,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {cta}
      </button>
    </motion.div>
  );
}

function demoGuests() {
  return [
    { pseudonym: "Gast #A72X", patternHint: "Mo & Do · reagiert auf Push", revenueMonthLabel: "EUR 95", daysSinceVisit: 4 },
    { pseudonym: "Gast #B19K", patternHint: "Wochenende", revenueMonthLabel: "EUR 72", daysSinceVisit: 22 },
    { pseudonym: "Gast #C04M", patternHint: "Mittags", revenueMonthLabel: "EUR 58", daysSinceVisit: 8 },
    { pseudonym: "Gast #D88P", patternHint: "Theke", revenueMonthLabel: "EUR 41", daysSinceVisit: 19 },
  ];
}
