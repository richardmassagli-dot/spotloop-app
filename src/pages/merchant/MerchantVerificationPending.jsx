import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getSpot } from "../../lib/firestore";
import { VERIFICATION_STATUS } from "../../lib/merchantVerification";
import { Screen, Btn, Logo, C, Card, Spinner } from "../../components/ui";
import { PrivacyNote } from "../../components/trust";
import DevBootstrapPanel from "../../components/DevBootstrapPanel";
import { ShieldCheck, Clock, XCircle, RefreshCw } from "lucide-react";

export default function MerchantVerificationPending({ spot: initialSpot, onRefresh, onLogout }) {
  const { user } = useAuth();
  const [spot, setSpot] = useState(initialSpot);
  const [loading, setLoading] = useState(false);

  const isRejected = spot?.verification_status === VERIFICATION_STATUS.REJECTED;

  const refresh = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const latest = await getSpot(user.uid);
      setSpot(latest);
      onRefresh?.(latest);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen bg={C.bg} pad={false}>
      <div style={{ background: C.darkGreen, padding: "20px 24px 24px" }}>
        <Logo size={22} light />
        <PageTitle isRejected={isRejected} />
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 4 }}>
          {spot?.name || "Dein Spot"} — spotloop prüft deinen Spot-Account
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <Card style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            {isRejected
              ? <XCircle size={40} color="#DC2626" />
              : <Clock size={40} color={C.fresh} />}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 8, textAlign: "center" }}>
            {isRejected ? "Account nicht freigeschaltet" : "Prüfung läuft"}
          </div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, textAlign: "center" }}>
            {isRejected
              ? "Dein Spot-Profil konnte nicht verifiziert werden. Bitte kontaktiere uns oder registriere dich mit korrekten Betriebsdaten neu."
              : "Damit Follower deinen Spot finden und Stempel sammeln können, prüfen wir kurz, dass du ein echter lokaler Betrieb bist. Das dauert in der Regel 1–2 Werktage."}
          </div>
          {spot?.verification_note ? (
            <div style={{
              marginTop: 14, padding: "12px 14px", background: "#FEF2F2",
              borderRadius: 12, border: "1px solid #FECACA", fontSize: 13, color: "#991B1B",
            }}>
              <strong>Hinweis:</strong> {spot.verification_note}
            </div>
          ) : null}
        </Card>

        <PrivacyNote variant={isRejected ? "warning" : "info"}>
          <PrivacyContent />
        </PrivacyNote>

        {!isRejected && (
          <Card style={{ padding: 16, marginTop: 14, background: C.mintLight, border: `1px solid ${C.mint}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginBottom: 8 }}>Nächste Schritte</div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              <li>E-Mail bestätigt und Spot-Profil vollständig ausgefüllt?</li>
              <li>spotloop prüft deinen Betrieb (Status oben mit „Status aktualisieren“).</li>
              <li>Bist du Admin? Profil → Datenschutz → <strong>Pending Spots prüfen</strong>, oder direkt <a href="/admin/spots" style={{ color: C.blue, fontWeight: 700 }}>/admin/spots</a>.</li>
            </ol>
          </Card>
        )}

        <DevBootstrapPanel onDone={() => refresh()} />

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {!isRejected && (
            <Btn onClick={refresh} disabled={loading} style={{ width: "100%" }}>
              {loading ? (
                <Spinner size={18} color="#fff" />
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <RefreshCw size={16} /> Status aktualisieren
                </span>
              )}
            </Btn>
          )}
          <Btn variant="ghost" onClick={onLogout} style={{ width: "100%" }}>
            Abmelden
          </Btn>
        </div>
      </div>
    </Screen>
  );
}

function PageTitle({ isRejected }) {
  return (
    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 12 }}>
      {isRejected ? "Verifizierung abgelehnt" : "Verifizierung ausstehend"}
    </div>
  );
}

function PrivacyContent() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong>Warum Verifizierung?</strong>
        <div style={{ marginTop: 4, fontWeight: 500 }}>
          Ohne Freigabe erscheinst du nicht in der Spot-Suche, Follower können keine Stempel sammeln,
          und Kampagnen sind gesperrt — so schützen wir Follower vor Fake-Spots.
        </div>
      </div>
    </div>
  );
}
