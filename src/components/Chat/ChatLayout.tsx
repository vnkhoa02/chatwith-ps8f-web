"use client";

import React from "react";
import NavBar from "@/components/UI/NavBar";
import Sidebar from "@/components/UI/Sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[18rem_1fr] gap-6 mt-6">
          <Sidebar />
          <main className="bg-white rounded shadow-sm min-h-[72vh] overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
