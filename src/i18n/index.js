import { translations, LOCALES } from "./translations";

const STORAGE_KEY = "spotloop_locale";

export { LOCALES };

export function detectLocale() {
  if (typeof navigator !== "undefined") {
    const lang = (navigator.language || "de").toLowerCase();
    if (lang.startsWith("de")) return "de";
    if (lang.startsWith("en")) return "en";
  }
  return "de";
}

export function getStoredLocale() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "de" || v === "en") return v;
  } catch {
    /* ignore */
  }
  return detectLocale();
}

export function saveLocale(locale) {
  localStorage.setItem(STORAGE_KEY, locale);
}

function getNested(obj, path) {
  return path.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : null), obj);
}

/** {{name}} interpolation */
export function translate(locale, key, params = {}) {
  const loc = translations[locale] ? locale : "de";
  let str = getNested(translations[loc], key);
  if (str == null) str = getNested(translations.de, key) ?? key;
  if (typeof str !== "string") return key;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    params[k] != null ? String(params[k]) : `{{${k}}}`
  );
}

export function dateLocale(locale) {
  return locale === "en" ? "en-US" : "de-DE";
}

export function authErrorKey(error, context = "register") {
  const code = error?.code || "";
  const msg = error?.message || "";
  if (code === "email_confirmation_required") return "auth.errors.emailConfirmRequired";
  if (code === "user_already_exists" || msg.includes("already registered")) return "auth.errors.userExists";
  if (code === "email_address_invalid") return "auth.errors.emailInvalid";
  if (code === "over_email_send_rate_limit") return "auth.errors.rateLimit";
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) return "auth.errors.emailNotConfirmed";
  if (code === "invalid_credentials") return "auth.errors.invalidCredentials";
  if (code === "weak_password") return "auth.errors.weakPassword";
  if (code === "no_session") return "auth.errors.noSession";
  return context === "login" ? "auth.errors.loginFailed" : "auth.errors.registerFailed";
}
