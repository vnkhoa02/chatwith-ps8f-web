"use client";

import { Bell } from "lucide-react";

export default function NavBar() {
  return (
    <header className="w-full border-b bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">PS8F Chat</div>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded p-2 hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
