import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { Check, X, Camera } from "lucide-react";
import { parseCheckinFromQr } from "../../lib/parseCheckinQr";
import { PREMIUM_SPOTS } from "../../data/premiumDemo";
import { usePremiumApp } from "../../context/PremiumAppContext";

const ELEMENT_ID = "premium-qr-scanner";

function pickRearCamera(cameras) {
  if (!cameras?.length) return null;
  const rear = cameras.find((c) => /back|rear|environment|rück|wide/i.test(c.label || ""));
  return rear || cameras[cameras.length - 1] || cameras[0];
}

export default function PremiumQRScanner({ onClose, onSuccess }) {
  const { addStamp } = usePremiumApp();
  const [phase, setPhase] = useState("permission"); // permission | scanning | success | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const scannerRef = useRef(null);
  const handled = useRef(false);

  const startCamera = async () => {
    setPhase("scanning");
    setError("");
    handled.current = false;

    const scanner = new Html5Qrcode(ELEMENT_ID, { verbose: false });
    scannerRef.current = scanner;

    try {
      const cameras = await Html5Qrcode.getCameras();
      const device = pickRearCamera(cameras);
      if (!device?.id) {
        setPhase("error");
        setError("Keine Kamera gefunden. Bitte auf dem Smartphone öffnen.");
        return;
      }

      await scanner.start(
        device.id,
        { fps: 12, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
        (text) => {
          if (handled.current) return;
          let spotId = parseCheckinFromQr(text);
          if (!spotId && PREMIUM_SPOTS.some((s) => s.id === text)) spotId = text;
          if (!spotId) return;

          handled.current = true;
          scanner.stop().catch(() => {});
          const stamp = addStamp(spotId);
          setResult(stamp);
          setPhase("success");
          setTimeout(() => onSuccess?.(spotId, stamp), 1400);
        },
        () => {}
      );
    } catch (e) {
      setPhase("error");
      const msg = e?.message || String(e);
      if (/permission|notallowed/i.test(msg)) {
        setError("Kamera-Zugriff verweigert. Bitte in den Einstellungen erlauben und erneut versuchen.");
      } else {
        setError(msg);
      }
    }
  };

  useEffect(() => {
    return () => {
      const s = scannerRef.current;
      if (s?.isScanning) s.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[600] flex flex-col bg-[#0B1F3A]">
      <style>{`
        #${ELEMENT_ID} select, #${ELEMENT_ID} button, #${ELEMENT_ID} img { display: none !important; }
        #${ELEMENT_ID} video ~ video { display: none !important; }
        #${ELEMENT_ID} video { width: 100% !important; border-radius: 16px; object-fit: cover; }
      `}</style>

      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <h1 className="text-lg font-bold text-white">QR scannen</h1>
        <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center px-5 pb-8">
        <AnimatePresence mode="wait">
          {phase === "permission" && (
            <motion.div
              key="perm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center max-w-xs mt-8"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7C5CFF] to-[#42B8A6] mb-6">
                <Camera size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Kamera aktivieren</h2>
              <p className="text-sm text-white/65 mt-2 leading-relaxed">
                spotloop braucht Zugriff auf deine Kamera, um Händler-QR-Codes zu scannen.
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-8 w-full rounded-2xl py-3.5 font-semibold text-white bg-gradient-to-r from-[#7C5CFF] via-[#3B82F6] to-[#42B8A6] shadow-lg"
              >
                Kamera erlauben & scannen
              </button>
            </motion.div>
          )}

          {(phase === "scanning" || phase === "error") && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[300px]">
              <div className="relative">
                <div id={ELEMENT_ID} className="min-h-[280px] rounded-2xl overflow-hidden bg-black" />
                {phase === "scanning" && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-[220px] h-[220px] rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(11,31,58,0.55)]"
                    />
                  </div>
                )}
              </div>
              {phase === "error" ? (
                <p className="mt-4 text-center text-sm text-[#FCA5A5] leading-relaxed">{error}</p>
              ) : (
                <p className="mt-4 text-center text-sm text-white/60">QR-Code in den Rahmen halten</p>
              )}
              {phase === "error" && (
                <button type="button" onClick={startCamera} className="mt-4 w-full rounded-2xl py-3 font-semibold bg-white/10 text-white">
                  Erneut versuchen
                </button>
              )}
            </motion.div>
          )}

          {phase === "success" && result && (
            <motion.div
              key="ok"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center mt-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#42B8A6] to-[#3B82F6]"
              >
                <Check size={48} className="text-white" strokeWidth={3} />
              </motion.div>
              <h2 className="mt-6 text-2xl font-bold text-white">Besuch gezählt!</h2>
              <p className="text-white/70 mt-1">{result.spot?.name}</p>
              <p className="text-3xl font-black text-white mt-2">
                {result.points}/{result.maxPoints}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
