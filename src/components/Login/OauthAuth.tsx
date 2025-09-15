"use client";

import { AUTH_CONFIG } from "@/config/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OauthAuthProps {
  code: string;
  state: string;
}

export default function OauthAuth({ code }: OauthAuthProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!code) {
        setError("Missing authorization code");
        setStatus("error");
        return;
      }

      setStatus("loading");

      try {
        const url = `${AUTH_CONFIG.BASE_URL.replace(/\/$/, "")}/oauth/token`;
        const body = new URLSearchParams();
        body.set("client_id", "p8-node-desktop");
        body.set("grant_type", "authorization_code");
        body.set(
          "code_verifier",
          "YvbpnOOFD_iq-YuDT7l8FSz0GIQi6x9T77dyWd0_hrgNkyNqEgjOseLb8OtAtTBE",
        );
        body.set("code", code);
        body.set("scope", "read write sync");

        const resp = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        const data = await resp.json();
        if (!resp.ok) {
          setError(JSON.stringify(data));
          setStatus("error");
          return;
        }

        try {
          // Store tokens in cookies instead of localStorage so middleware can read them server-side
          if (data.access_token) {
            try {
              const maxAge = data.expires_in ? Number(data.expires_in) : undefined;
              const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
              // set access token
              const accessCookie = `p8fs_access=${encodeURIComponent(String(data.access_token))}; Path=/; SameSite=Lax${secure}${maxAge ? `; Max-Age=${maxAge}` : ""}`;
              document.cookie = accessCookie;

              // set expires timestamp explicitly so client-side code can read it
              if (data.expires_in) {
                const expiresAt = Date.now() + Number(data.expires_in) * 1000;
                const expiresCookie = `p8fs_expires=${expiresAt}; Path=/; SameSite=Lax${secure}${maxAge ? `; Max-Age=${maxAge}` : ""}`;
                document.cookie = expiresCookie;
              }
            } catch (e) {
              console.warn("Setting auth cookie failed", e);
            }
          }

          if (data.refresh_token) {
            try {
              const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
              const refreshCookie = `p8fs_refresh=${encodeURIComponent(String(data.refresh_token))}; Path=/; SameSite=Lax${secure};`;
              document.cookie = refreshCookie;
            } catch (e) {
              console.warn("Setting refresh cookie failed", e);
            }
          }
          if (data.id_token) {
            localStorage.setItem(
              AUTH_CONFIG.STORAGE_KEYS.ID_TOKEN,
              String(data.id_token),
            );
          }
          if (data.tenant_id) {
            localStorage.setItem(
              AUTH_CONFIG.STORAGE_KEYS.TENANT_ID,
              String(data.tenant_id),
            );
          }
        } catch (e) {
          console.error("Storing tokens failed", e);
        }

        try {
          const ev = new CustomEvent("p8fs:login", {
            detail: { tokens: data },
          });
          window.dispatchEvent(ev);
        } catch (e) {
          console.error("Dispatching login event failed", e);
        }

        setStatus("success");
        setTimeout(() => router.push("/"), 800);
      } catch (e: any) {
        setError(String(e?.message ?? e));
        setStatus("error");
      }
    };

    run();
  }, [router, code]);

  if (!code) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white p-6">
      <style>{`
        @keyframes draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
      `}</style>

      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
          <div>Authorizing…</div>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <svg
            className="h-16 w-16 text-green-500"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="26" cy="26" r="25" stroke="#D1FAE5" strokeWidth="2" />
            <path
              d="M14 27 L22 34 L38 18"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: 100,
                animation: "draw 500ms ease forwards",
              }}
            />
          </svg>
          <div>Signed in — redirecting…</div>
        </div>
      )}

      {status === "error" && <div className="text-red-600">Error: {error}</div>}
    </div>
  );
}
