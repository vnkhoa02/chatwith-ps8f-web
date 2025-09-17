"use client";

import { AUTH_CONFIG } from "@/config/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useCallback, useState } from "react";

interface PresignResponse {
  url: string;
  key: string;
}

interface UploadArgs {
  file: File;
  onProgress?: (pct: number, sent: number, total: number) => void;
  signal?: AbortSignal;
}

interface UploadResult {
  key: string;
  url: string; // final object URL (without query)
  size: number;
  mimeType: string;
  fileName: string;
}

interface UseUploadOptions {
  /** react-query invalidate keys after success */
  invalidateKeys?: any[];
  /** custom bucket prefix or transform for file names */
  transformFileName?: (original: string) => string;
}

/**
 * useUpload - high-level hook wrapping the presign + PUT upload sequence.
 *
 * Flow:
 * 1. Call POST /api/upload/presign with file name + mimeType
 * 2. Receive presigned URL + key
 * 3. Perform PUT upload with progress events (via XMLHttpRequest for progress)
 */
export function useUpload(options?: UseUploadOptions) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number>(0);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  const doUpload = useCallback(
    async ({ file, onProgress, signal }: UploadArgs): Promise<UploadResult> => {
      const token = Cookies.get(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error("Not authenticated: missing access token");

      const fileName = options?.transformFileName
        ? options.transformFileName(file.name)
        : file.name;

      // Step 1: presign
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName, mimeType: file.type }),
        signal,
      });
      if (!presignRes.ok) {
        throw new Error(`Presign failed: ${presignRes.status}`);
      }
      const { url, key } = (await presignRes.json()) as PresignResponse;
      setCurrentKey(key);
      setUploadUrl(url);

      // Step 2: PUT upload using XHR to get progress
      const total = file.size;
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setProgress(pct);
            onProgress?.(pct, evt.loaded, evt.total);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve();
          } else {
            reject(new Error(`Upload error: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload aborted"));
        if (signal) {
          // Bridge abort signal to XHR
          const onAbort = () => {
            xhr.abort();
          };
          signal.addEventListener("abort", onAbort, { once: true });
        }
        xhr.send(file);
      });

      // Strip query params for final object URL
      const finalUrl = url?.split("?")[0] || url; // ensure string

      return {
        key,
        url: finalUrl,
        size: total,
        mimeType: file.type,
        fileName,
      };
    },
    [options?.transformFileName],
  );

  const mutation = useMutation<UploadResult, Error, UploadArgs>({
    mutationFn: async (args) => doUpload(args),
    onSuccess: (_data) => {
      // Optional cache invalidation after success
      if (options?.invalidateKeys) {
        for (const k of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: k });
        }
      }
    },
  });

  const start = useCallback(
    (file: File, onProgress?: UploadArgs["onProgress"], signal?: AbortSignal) =>
      mutation.mutate({ file, onProgress, signal }),
    [mutation],
  );

  const startAsync = useCallback(
    (file: File, onProgress?: UploadArgs["onProgress"], signal?: AbortSignal) =>
      mutation.mutateAsync({ file, onProgress, signal }),
    [mutation],
  );

  const reset = () => {
    setProgress(0);
    setCurrentKey(null);
    setUploadUrl(null);
    mutation.reset();
  };

  return {
    start,
    startAsync,
    reset,
    progress,
    key: currentKey,
    presignedUrl: uploadUrl,
    uploading: mutation.status === "pending",
    error: mutation.error,
    data: mutation.data,
    mutation,
  };
}

export type UseUploadReturn = ReturnType<typeof useUpload>;
