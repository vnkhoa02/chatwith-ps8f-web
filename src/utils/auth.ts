import { AUTH_CONFIG } from "@/config/auth";
import type { AuthState } from "@/types/auth";
import Cookies from "js-cookie";

export function readAuthFromStorage(): AuthState {
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

export function clearStoredTokens() {
  try {
    // clear cookies
    Cookies.remove(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    Cookies.remove(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    Cookies.remove(AUTH_CONFIG.STORAGE_KEYS.EXPIRES_AT);
    localStorage.clear();
  } catch (e) {
    console.error("clearStoredTokens error", e);
  }
}
