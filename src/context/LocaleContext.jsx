import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import {
  LOCALES,
  getStoredLocale,
  saveLocale,
  translate,
  dateLocale,
  authErrorKey,
} from "../i18n";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(getStoredLocale);

  const setLocale = useCallback((next) => {
    if (next !== "de" && next !== "en") return;
    saveLocale(next);
    setLocaleState(next);
    document.documentElement.lang = next;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback((key, params) => translate(locale, key, params), [locale]);

  const formatDate = useCallback(
    (date, options) =>
      new Date(date).toLocaleDateString(dateLocale(locale), options),
    [locale]
  );

  const authError = useCallback(
    (error, context = "register") => t(authErrorKey(error, context)),
    [t]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, formatDate, locales: LOCALES, authError }),
    [locale, setLocale, t, formatDate, authError]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale requires LocaleProvider");
  return ctx;
}
