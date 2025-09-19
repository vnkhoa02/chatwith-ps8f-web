"use client";

import useSignout from "@/hooks/useSignout";
import type { AuthState } from "@/types/auth";
import { readAuthFromStorage } from "@/utils/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  auth: AuthState;
  setAuthFromStorage: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { signOut } = useSignout();
  const [auth, setAuth] = useState<AuthState>(() =>
    typeof window !== "undefined"
      ? readAuthFromStorage()
      : {
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          idToken: null,
          tenantId: null,
        },
  );

  useEffect(() => {
    const onLogin = (ev: Event) => {
      // try to re-read storage after login event
      setAuth(readAuthFromStorage());
    };

    window.addEventListener("p8fs:login", onLogin);
    return () => window.removeEventListener("p8fs:login", onLogin);
  }, []);

  const value = useMemo(
    () => ({
      auth,
      signOut,
      setAuthFromStorage: () => setAuth(readAuthFromStorage()),
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
