"use client";

import { AUTH_CONFIG } from "@/config/auth";
import qrPairingService from "@/services/QrPairingService";
import type { IDevicePollingStatus, ILoginSession } from "@/types/login";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export default function useLogin() {
  const sessionMutation = useMutation<ILoginSession>({
    mutationFn: async () => {
      const deviceCode = await qrPairingService.getDeviceCode();
      const qrSession = await qrPairingService.createQRSession();
      return {
        ...deviceCode,
        ...qrSession,
      };
    },
  });

  const session = sessionMutation.data;

  const tokenQuery = useQuery<IDevicePollingStatus>({
    queryKey: ["device-token", session?.device_code],
    queryFn: async () => {
      if (!session?.device_code) throw new Error("no device code");
      return await qrPairingService.checkDeviceToken(session.device_code);
    },
    enabled: !!session?.device_code,
    refetchInterval: (query) => {
      // `query.state.data` contains the last returned value from checkDeviceToken
      const d = query.state.data as { success?: boolean };
      if (d?.success) return false as const;
      return (session?.interval ?? 5) * 1000;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const [secondsLeft, setSecondsLeft] = useState<number>(
    session?.expires_in ?? 0,
  );

  useEffect(() => {
    if (!session) return;
    setSecondsLeft(session.expires_in ?? 0);
  }, [session?.expires_in, session]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    const status = tokenQuery.data?.status;
    if (status === "approved") {
      const redirect_uri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;
      const params = new URLSearchParams();
      params.append("client_id", "p8-node-desktop");
      params.append("response_type", "code");
      params.append("scope", "read write sync");
      params.append("state", "xcoiv98y2kd22vusuye3kch");
      params.append(
        "code_challenge",
        "Dosch7lYwKvPoPilkhmCE8wb5KAwKtofOfy-qdQG8tY",
      );
      params.append("code_challenge_method", "S256");
      if (redirect_uri) params.append("redirect_uri", redirect_uri);
      const url = `${AUTH_CONFIG.BASE_URL}/oauth/authorize?scope=read write sync&${params.toString()}`;
      window.location.href = url;
      return;
    }
  }, [tokenQuery.data?.status]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  const status = tokenQuery.data?.status;
  const error =
    tokenQuery.data?.message ?? sessionMutation.error?.message ?? null;

  return {
    session,
    status,
    error,
    secondsLeft,
    formattedTime,
    // expose a callable start function that triggers the mutation when invoked
    start: () => sessionMutation.mutate(),
    tokenQuery,
    sessionMutation,
  };
}
