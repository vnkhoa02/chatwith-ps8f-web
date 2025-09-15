"use client";

import { AUTH_CONFIG } from "@/config/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  idToken: string | null;
  tenantId: string | null;
};

type AuthContextValue = {
  auth: AuthState;
  setAuthFromStorage: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readAuthFromStorage(): AuthState {
  try {
    // prefer cookies (set by OauthAuth) so middleware/server can also rely on them
    const accessToken =
      Cookies.get(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN) ??
      localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken =
      Cookies.get(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN) ??
      localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    const expiresAtRaw =
      Cookies.get(AUTH_CONFIG.STORAGE_KEYS.EXPIRES_AT) ??
      localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.EXPIRES_AT);
    const idToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ID_TOKEN);
    const tenantId = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TENANT_ID);

    return {
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      expiresAt: expiresAtRaw ? Number(expiresAtRaw) : null,
      idToken: idToken ?? null,
      tenantId: tenantId ?? null,
    };
  } catch (e) {
    return {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      idToken: null,
      tenantId: null,
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
    () => ({ auth, setAuthFromStorage: () => setAuth(readAuthFromStorage()) }),
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
