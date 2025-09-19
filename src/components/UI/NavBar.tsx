"use client";

import { Bell, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/ui/Sidebar";
import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="w-full border-b bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button className="rounded p-2 hover:bg-gray-100" aria-label="Open menu">
                    <Menu className="h-5 w-5 text-gray-700" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <Sidebar variant="sheet" />
                </SheetContent>
              </Sheet>
            </div>
            <div className="text-lg font-semibold">PS8F Chat</div>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded p-2 hover:bg-gray-100" aria-label="Notifications">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
