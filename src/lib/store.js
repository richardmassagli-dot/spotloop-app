// Unified auth adapter — uses localStorage when Supabase is not configured
import { localAuth } from "./localStore.js";
import { supabase } from "./supabase.js";
import { IS_LOCAL_MODE } from "./config.js";
import { translate, authErrorKey, getStoredLocale } from "../i18n/index.js";

const LOCAL = IS_LOCAL_MODE;
const AUTH_EVENT = "myspot-auth-change";

const profileFromUser = (rawUser) => ({
  uid:  rawUser.id,
  name: rawUser.user_metadata?.name || rawUser.email,
  role: rawUser.user_metadata?.role || "guest",
});

const userFromRaw = (rawUser) => ({ ...rawUser, uid: rawUser.id });

/** Push session/user into AuthContext immediately (local + Supabase). */
const emitAuth = (payload) => {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: payload }));
};

/** Für Passwort-Reset: Session nach dem E-Mail-Link an die App melden */
export const emitAuthFromSession = (session) => {
  emitAuth({ session });
};

/** Localized Supabase / local auth errors */
export const authErrorMessage = (error, context = "register", locale = getStoredLocale()) =>
  translate(locale, authErrorKey(error, context));

/** Ensure session is loaded and AuthContext is notified (Supabase). */
const finalizeSupabaseAuth = async (data) => {
  if (data?.session) {
    emitAuth({ session: data.session });
    return data;
  }
  const { data: refreshed, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (refreshed?.session) {
    emitAuth({ session: refreshed.session });
    return { ...data, session: refreshed.session };
  }
  const err = new Error("No session returned");
  err.code = "no_session";
  throw err;
};

const requireSession = (data) => finalizeSupabaseAuth(data);

export const storeSignIn = async (email, password) => {
  if (LOCAL) {
    const result = await localAuth.signIn(email, password);
    emitAuth({ user: result.user });
    return result;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed" || error.message?.includes("not confirmed")) {
      const confirmErr = new Error("Email confirmation required");
      confirmErr.code = "email_confirmation_required";
      throw confirmErr;
    }
    throw error;
  }
  return finalizeSupabaseAuth(data);
};

export const storeRegister = async (email, password, name, role, birthday) => {
  if (LOCAL) {
    const result = await localAuth.register(email, password, name, role, birthday);
    emitAuth({ user: result.user });
    return result;
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, birthday: birthday || null },
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
    },
  });
  if (error) {
    if (error.code === "over_email_send_rate_limit" || error.message?.includes("rate limit")) {
      const rateErr = new Error("Email rate limit");
      rateErr.code = "over_email_send_rate_limit";
      throw rateErr;
    }
    throw error;
  }

  const identities = data.user?.identities;
  if (data.user && Array.isArray(identities) && identities.length === 0) {
    const dup = new Error("User already registered");
    dup.code = "user_already_exists";
    throw dup;
  }

  if (data.session) return requireSession(data);

  // Konto angelegt, aber Supabase liefert keine Session bis die E-Mail bestätigt ist
  if (data.user) {
    const pending = new Error("Email confirmation required");
    pending.code = "email_confirmation_required";
    throw pending;
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    if (signInError.code === "email_not_confirmed" || signInError.message?.includes("not confirmed")) {
      const confirmErr = new Error("Email confirmation required");
      confirmErr.code = "email_confirmation_required";
      throw confirmErr;
    }
    throw signInError;
  }
  return requireSession(signInData);
};

export const storeSignOut = async () => {
  if (LOCAL) {
    localAuth.signOut();
    emitAuth({ user: null });
    return;
  }
  await supabase.auth.signOut();
  emitAuth({ session: null });
};

// cb(user profile, session?) — session ist null im Demo-Modus oder nach Logout
export const storeOnAuthStateChanged = (cb) => {
  if (LOCAL) {
    localAuth.onAuthStateChanged((u) => cb(u, u, null));
    const handler = (e) => {
      const u = e.detail.user ?? null;
      cb(u, u, null);
    };
    window.addEventListener(AUTH_EVENT, handler);
    return () => window.removeEventListener(AUTH_EVENT, handler);
  }

  const notifyFromSession = (session) => {
    const rawUser = session?.user ?? null;
    if (!rawUser) {
      cb(null, null, session ?? null);
      return;
    }
    cb(userFromRaw(rawUser), profileFromUser(rawUser), session);
  };

  const onExternal = (e) => {
    if ("session" in e.detail) notifyFromSession(e.detail.session);
  };
  window.addEventListener(AUTH_EVENT, onExternal);

  if (!supabase) {
    notifyFromSession(null);
    return () => window.removeEventListener(AUTH_EVENT, onExternal);
  }

  supabase.auth.getSession().then(({ data: { session } }) => notifyFromSession(session)).catch(() => notifyFromSession(null));

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    notifyFromSession(session);
  });

  return () => {
    window.removeEventListener(AUTH_EVENT, onExternal);
    subscription.unsubscribe();
  };
};
