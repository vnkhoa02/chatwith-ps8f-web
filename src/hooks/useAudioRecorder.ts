"use client";
import { useCallback, useRef, useState } from "react";

interface AudioState {
  isRecording: boolean;
  durationSec: number;
  base64?: string; // pure base64 (no data: prefix)
  mimeType?: string; // detected/selected audio mime type
}

/**
 * Reusable audio recorder hook.
 * Normalizes mime type selection and returns base64 once stopped.
 */
export function useAudioRecorder() {
  const [state, setState] = useState<AudioState>({
    isRecording: false,
    durationSec: 0,
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const durationTimerRef = useRef<number | null>(null);

  const pickMime = () => {
    const preferred = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
    ];
    return preferred.find((t) =>
      (window as any).MediaRecorder?.isTypeSupported?.(t),
    );
  };

  const start = useCallback(async () => {
    if (mediaRecorderRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chosen = pickMime();
    const mr = new MediaRecorder(
      stream,
      chosen ? { mimeType: chosen } : undefined,
    );
    chunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    mr.start();
    mediaRecorderRef.current = mr;
    startedAtRef.current = Date.now();
    setState({
      isRecording: true,
      durationSec: 0,
      mimeType: mr.mimeType || chosen,
    });
    durationTimerRef.current = window.setInterval(() => {
      if (startedAtRef.current) {
        const dur = Math.round((Date.now() - startedAtRef.current) / 1000);
        setState((s) => ({ ...s, durationSec: dur }));
      }
    }, 1000);
  }, []);

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => {
        const result = r.result as string;
        const pure = result.split(",", 2)[1] || result; // strip data url
        resolve(pure);
      };
      r.onerror = reject;
      r.readAsDataURL(blob);
    });

  const stop = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state === "inactive") return;

    await new Promise<void>((resolve) => {
      mr.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, {
            type: mr.mimeType || "audio/webm",
          });
          const base64 = await blobToBase64(blob);
          const durationSec = Math.round(
            startedAtRef.current
              ? (Date.now() - startedAtRef.current) / 1000
              : 0,
          );
          setState((s) => ({
            isRecording: false,
            base64,
            durationSec,
            mimeType: s.mimeType || mr.mimeType || "audio/webm",
          }));
        } finally {
          if (durationTimerRef.current)
            window.clearInterval(durationTimerRef.current);
          mediaRecorderRef.current = null;
          startedAtRef.current = null;
          resolve();
        }
      };
      try {
        if (typeof mr.requestData === "function") mr.requestData();
        mr.stop();
      } catch (e) {
        console.error("stop error", e);
        mr.onstop?.(new Event("stop"));
      }
    });
  }, []);

  const reset = useCallback(() => {
    setState({ isRecording: false, durationSec: 0, base64: undefined });
  }, []);

  return {
    ...state,
    start,
    stop,
    reset,
  };
}
