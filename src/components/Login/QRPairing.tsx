"use client";

import useLogin from "@/hooks/useLogin";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect } from "react";

export default function QRPairing() {
  const { session, status, formattedTime, error, start } = useLogin();
  console.log("session", session);
  useEffect(() => {
    start();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xl text-center">
        <h2 className="text-lg font-semibold text-gray-700">
          Scan QR Code to Login
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Open the Voice Memo Chat app on your mobile device
        </p>

        <div className="mt-8 flex justify-center">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex h-56 w-56 items-center justify-center rounded-md bg-gray-800">
              {session ? (
                <QRCodeCanvas
                  value={JSON.stringify(session)}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0f1724"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-300">
                  Loading…
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          QR Code expires in {formattedTime}
        </div>

        <div className="mt-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span
              className={`h-2 w-2 rounded-full ${status === "approved" ? "bg-green-500" : status === "error" ? "bg-red-400" : "bg-gray-400"}`}
            ></span>
            <span>
              {status === "pending"
                ? "Waiting for scan..."
                : status === "not_found" && `Error: ${error}`}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <div className="space-y-3">
            <a
              className="block rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              href="#"
            >
              Download on Apple Store
            </a>
            <a
              className="block rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              href="#"
            >
              Download on Google Play
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
