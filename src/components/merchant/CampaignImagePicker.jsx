import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { C } from "../ui";
import { compressImageFile } from "../../lib/campaignImages";

export default function CampaignImagePicker({ imageUrl, onChange, onError }) {
  const inputRef = useRef(null);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      onError?.(err.message || "Bild konnte nicht verarbeitet werden.");
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.mid, marginBottom: 8 }}>
        Bild (optional)
      </div>

      {imageUrl ? (
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 8 }}>
          <img
            src={imageUrl}
            alt="Kampagnen-Vorschau"
            style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 32,
              height: 32,
              borderRadius: 10,
              border: "none",
              background: "rgba(0,0,0,.55)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Bild entfernen"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%",
            padding: "20px 16px",
            borderRadius: 14,
            border: `2px dashed ${C.border}`,
            background: C.bg,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ImagePlus size={28} color={C.muted} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>Foto hinzufügen</span>
          <span style={{ fontSize: 11, color: C.muted }}>JPG oder PNG · wird automatisch komprimiert</span>
        </button>
      )}

      {imageUrl && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.green,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Anderes Bild wählen
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/*" hidden onChange={pick} />
    </div>
  );
}
