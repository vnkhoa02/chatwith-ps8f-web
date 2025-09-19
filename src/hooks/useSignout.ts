"use client";

import { AUTH_CONFIG } from "@/config/auth";
import { clearStoredTokens, readAuthFromStorage } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";

const useSignout = () => {
  const queryClient = useQueryClient();

  const signOut = async (): Promise<void> => {
    try {
      const keys = readAuthFromStorage();

      if (keys.refreshToken) {
        try {
          const body = new URLSearchParams({ token: keys.refreshToken });
          await fetch(`${AUTH_CONFIG.BASE_URL}/oauth/revoke`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
          });
        } catch (error) {
          console.warn("Token revocation failed:", error);
        }
      }
    } finally {
      clearStoredTokens();
      queryClient.clear();
      window.location.href = "/login";
    }
  };
  return {
    signOut,
  };
};

export default useSignout;
