import { createContext, useContext, useEffect, useState } from "react";
import { storeOnAuthStateChanged, storeSignOut } from "../lib/store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = storeOnAuthStateChanged((u, p, s) => {
      setUser(u);
      setProfile(p);
      setSession(s ?? null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = storeSignOut;

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
