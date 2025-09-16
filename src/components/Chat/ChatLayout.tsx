"use client";

import React from "react";
import NavBar from "@/components/ui/NavBar";
import Sidebar from "@/components/ui/Sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex h-screen flex-col">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="bg-card flex flex-1 flex-col overflow-hidden border-l">
          {children}
        </main>
      </div>
    </div>
  );
}
