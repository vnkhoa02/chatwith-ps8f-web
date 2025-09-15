"use client";

import qrPairingService from "@/services/QrPairingService";
import type { IDevicePollingStatus } from "@/types/login";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export default function useLogin() {
  const sessionMutation = useMutation({
    mutationFn: () => qrPairingService.createDeviceSession(),
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

  // expose qrData, status and countdown
  const qrData = session?.deepLink ?? session?.user_code;

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

  const formattedTime = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  const status = tokenQuery.data?.status;
  const error =
    tokenQuery.error?.message ?? sessionMutation.error?.message ?? null;

  return {
    session,
    qrData,
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
