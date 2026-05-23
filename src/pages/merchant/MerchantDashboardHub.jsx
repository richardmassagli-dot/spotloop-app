import { motion } from "framer-motion";
import {
  LayoutDashboard,
  QrCode,
  Gift,
  Megaphone,
  Settings,
  RefreshCw,
} from "lucide-react";
import { C } from "../../components/ui";
import MerchantHubTile from "../../components/merchant/MerchantHubTile";
import MerchantStammgaesteHubCard from "../../components/merchant/MerchantStammgaesteHubCard";
import MerchantTriggerInbox from "../../components/merchant/MerchantTriggerInbox";
import { MERCHANT_PAGE_BG } from "../../components/merchant/merchantHeader";

const ACCENTS = {
  indigo: { bg: "#EEF2FF", fg: "#6366F1" },
  green: { bg: "#ECFDF5", fg: "#059669" },
  orange: { bg: "#FFF7ED", fg: "#F97316" },
  purple: { bg: "#F5F3FF", fg: "#7C3AED" },
  slate: { bg: "#F1F5F9", fg: "#475569" },
  red: { bg: "#FEF2F2", fg: "#DC2626" },
};

export default function MerchantDashboardHub({
  insights,
  onSelectTab,
  onOpenStammgaeste,
  merchantTriggers = [],
  onTriggerAction,
}) {
  const sleepers = insights?.hub?.sleepers ?? 0;
  let tileIndex = 0;

  return (
    <div
      className="scroll-y"
      style={{
        flex: 1,
        minHeight: 0,
        background: MERCHANT_PAGE_BG,
        marginTop: -8,
        padding: "8px 16px 32px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 12 }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: C.dark,
            margin: "0 0 6px",
            letterSpacing: -0.3,
            lineHeight: 1.2,
          }}
        >
          Dein Stammgast-Schalter
        </h2>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.muted,
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          QR · Stempel · Push — Gäste zurückbringen, ohne Umweg.
        </p>
      </motion.div>

      {merchantTriggers.length > 0 && (
        <MerchantTriggerInbox triggers={merchantTriggers} onAction={onTriggerAction} />
      )}

      <div style={{ marginBottom: 10 }}>
        <MerchantStammgaesteHubCard
          insights={insights}
          onClick={onOpenStammgaeste}
          index={0}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <MerchantHubTile
          icon={LayoutDashboard}
          label="Übersicht"
          hint="3 Zahlen"
          accent={ACCENTS.indigo}
          onClick={() => onSelectTab("overview")}
          index={tileIndex++}
        />
        <MerchantHubTile
          icon={QrCode}
          label="QR-Code"
          hint="Anzeigen"
          accent={ACCENTS.green}
          onClick={() => onSelectTab("qr")}
          index={tileIndex++}
        />
        <MerchantHubTile
          icon={Gift}
          label="Reward"
          hint="Stempelkarte"
          accent={ACCENTS.orange}
          onClick={() => onSelectTab("reward")}
          index={tileIndex++}
        />
        <MerchantHubTile
          icon={Megaphone}
          label="Kampagne"
          hint="Senden"
          accent={ACCENTS.purple}
          onClick={() => onSelectTab("campaigns")}
          index={tileIndex++}
        />

        <MerchantHubTile
          icon={Settings}
          label="Einstellungen"
          hint="Account"
          accent={ACCENTS.slate}
          onClick={() => onSelectTab("msettings")}
          index={tileIndex++}
        />
        <MerchantHubTile
          icon={RefreshCw}
          label="Reaktivierung"
          hint="Schläfer zurückholen"
          accent={ACCENTS.red}
          badge={sleepers}
          onClick={onOpenStammgaeste}
          index={tileIndex++}
        />
      </div>
    </div>
  );
}
