import { useLocale } from "../context/LocaleContext";

/** Compact DE | EN toggle */
export function LanguageToggle({ className = "" }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        background: "#F0EFEB",
        borderRadius: 12,
        padding: 3,
        border: "1px solid #E8E8E4",
      }}
      role="group"
      aria-label="Language"
    >
      {[
        { id: "de", label: "DE" },
        { id: "en", label: "EN" },
      ].map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setLocale(id)}
          style={{
            padding: "6px 14px",
            borderRadius: 9,
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            background: locale === id ? "#0B1F3A" : "transparent",
            color: locale === id ? "#fff" : "#5A6478",
            transition: "all .15s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Profile settings row */
export function LanguageSettingRow() {
  const { t, locale, setLocale, locales } = useLocale();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderBottom: "1px solid #E8ECEF",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#EFF6FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        🌐
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0A1628" }}>{t("language.title")}</div>
        <div style={{ fontSize: 11, color: "#8A96A8" }}>{t("language.subtitle")}</div>
      </div>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#1B4FD8",
          border: "1px solid #E2E8F5",
          borderRadius: 10,
          padding: "8px 10px",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        {locales.map((l) => (
          <option key={l.id} value={l.id}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
