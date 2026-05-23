import { useRef, useCallback, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check } from "lucide-react";
import { C } from "../../components/ui";
import { OFFLINE_QR_RULES } from "../../data/spotloopProductRules";

export default function MerchantQRSimple({ merchantId, spotName }) {
  const wrapRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const checkinUrl = `${window.location.origin}?checkin=${merchantId}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [checkinUrl]);

  const downloadPng = useCallback(() => {
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `spotloop-qr-${spotName || "spot"}.png`.replace(/\s+/g, "-").toLowerCase();
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  }, [spotName]);

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          background: C.white,
          borderRadius: 20,
          padding: 24,
          border: `1px solid ${C.border}`,
          display: "inline-block",
          marginBottom: 20,
        }}
      >
        <div ref={wrapRef}>
          <QRCodeSVG value={checkinUrl} size={220} fgColor={C.dark} level="H" includeMargin />
        </div>
      </div>

      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
        Stell den Code gut sichtbar auf — Gäste scannen und sammeln Besuche.
      </p>

      <button
        type="button"
        onClick={copyLink}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px 18px",
          borderRadius: 14,
          border: `1.5px solid ${C.border}`,
          background: C.white,
          color: C.dark,
          fontSize: 15,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "inherit",
          marginBottom: 10,
        }}
      >
        {copied ? <Check size={18} color={C.green} /> : <Copy size={18} />}
        {copied ? "Link kopiert" : "Link kopieren"}
      </button>

      <button
        type="button"
        onClick={downloadPng}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px 18px",
          borderRadius: 14,
          border: "none",
          background: C.green,
          color: "#fff",
          fontSize: 15,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <Download size={18} />
        Herunterladen
      </button>

      <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginTop: 16, textAlign: "left" }}>
        <strong style={{ color: C.dark }}>{OFFLINE_QR_RULES.title}:</strong> {OFFLINE_QR_RULES.body}
      </p>
    </div>
  );
}
