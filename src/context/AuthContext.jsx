import { createContext, useContext, useEffect, useState, useRef } from "react";
import { storeOnAuthStateChanged, storeSignOut } from "../lib/store";
import { hasLikelyStoredSession } from "../lib/authBoot";

const defaultAuth = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  logout: async () => {},
};

const AuthContext = createContext(defaultAuth);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(hasLikelyStoredSession);
  const profileKeyRef = useRef("");

  useEffect(() => {
    let initialLoadDone = false;

    const finishInitialLoad = () => {
      if (initialLoadDone) return;
      initialLoadDone = true;
      setLoading(false);
    };

    const applyAuth = (u, p, s) => {
      setUser(u);
      if (!p) {
        profileKeyRef.current = "";
        setProfile(null);
      } else {
        const nextKey = `${p.uid}:${p.role}:${p.name ?? ""}`;
        if (nextKey !== profileKeyRef.current) {
          profileKeyRef.current = nextKey;
          setProfile(p);
        }
      }
      setSession(s ?? null);
      finishInitialLoad();
    };

    const unsub = storeOnAuthStateChanged(applyAuth);
    const timeout = setTimeout(finishInitialLoad, 1500);

    return () => {
      clearTimeout(timeout);
      unsub();
    };
  }, []);

  const logout = storeSignOut;

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext) ?? defaultAuth;
