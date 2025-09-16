"use client";

import React from "react";
import { Bell, LogOut, Settings } from "lucide-react";

export default function NavBar() {
  return (
    <header className="w-full border-b bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">PS8F Chat</div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
