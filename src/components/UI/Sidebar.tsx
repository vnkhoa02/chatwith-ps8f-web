"use client";

import React from "react";
import { Plus } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-72 border-r bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">New Chat</div>
          <button className="p-1 rounded bg-blue-500 text-white">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-2">
          <div className="px-2 py-2 rounded hover:bg-gray-50">Chat History</div>
          <div className="px-2 py-2 rounded hover:bg-gray-50">Moments</div>
          <div className="px-2 py-2 rounded hover:bg-gray-50">Memos</div>
          <div className="px-2 py-2 rounded hover:bg-gray-50">Feeds</div>
        </nav>

        <div className="mt-6 text-sm text-gray-500">Recent</div>
        <ul className="mt-2 space-y-1">
          <li className="px-2 py-2 rounded hover:bg-gray-50">Project planning discussion</li>
          <li className="px-2 py-2 rounded hover:bg-gray-50">Creative writing ideas</li>
          <li className="px-2 py-2 rounded hover:bg-gray-50">Code review feedback</li>
        </ul>
      </div>
    </aside>
  );
}
