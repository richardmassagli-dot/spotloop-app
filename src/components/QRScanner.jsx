import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";
import { parseCheckinFromQr } from "../lib/parseCheckinQr";

const ELEMENT_ID = "spotloop-qr-scanner";

export default function QRScanner({ onDetected, onCancel }) {
  const [error, setError] = useState(null);
  const handled = useRef(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    handled.current = false;
    const scanner = new Html5Qrcode(ELEMENT_ID);
    scannerRef.current = scanner;
    let cancelled = false;

    const stop = async () => {
      try {
        if (scanner.isScanning) await scanner.stop();
      } catch {
        /* ignore */
      }
      try {
        scanner.clear();
      } catch {
        /* ignore */
      }
    };

    (async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          (decodedText) => {
            if (cancelled || handled.current) return;
            const spotId = parseCheckinFromQr(decodedText);
            if (!spotId) return;
            handled.current = true;
            stop().then(() => onDetected(spotId));
          },
          () => {}
        );
      } catch (e) {
        if (!cancelled) {
          const msg = e?.message || String(e);
          if (/secure|permission|notallowed/i.test(msg)) {
            setError("Kamera-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben und Seite neu laden.");
          } else if (/notfound|devices/i.test(msg)) {
            setError("Keine Kamera gefunden. Nutze den Link aus dem Händler-QR oder öffne die App auf dem Handy.");
          } else {
            setError(msg);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [onDetected]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0A1628" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>QR scannen</div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Schließen"
          style={{
            background: "rgba(255,255,255,.12)",
            border: "none",
            borderRadius: 10,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 24px" }}>
        <div
          id={ELEMENT_ID}
          style={{
            width: "100%",
            maxWidth: 320,
            borderRadius: 16,
            overflow: "hidden",
            background: "#000",
            minHeight: 280,
          }}
        />

        {error ? (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "rgba(239,68,68,.15)",
              border: "1px solid rgba(239,68,68,.35)",
              borderRadius: 12,
              fontSize: 13,
              color: "#FCA5A5",
              lineHeight: 1.5,
              maxWidth: 320,
            }}
          >
            {error}
          </div>
        ) : (
          <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.55, maxWidth: 300 }}>
            Halte den Händler-QR-Code ins Feld. Auf dem iPhone: Safari → Kamera erlauben.
          </p>
        )}
      </div>
    </div>
  );
}
