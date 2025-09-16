"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LogOut, Plus, Settings, User } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const chats = [
    { id: "1", title: "Project planning discussion" },
    { id: "2", title: "Creative writing ideas" },
    { id: "3", title: "Code review feedback" },
    { id: "4", title: "Voice memo concept" },
  ];

  return (
    <aside
      className={
        "group/sidebar bg-sidebar text-sidebar-foreground relative flex h-full flex-col border-r transition-all " +
        (collapsed ? "w-14" : "w-72")
      }
    >
      <div className="flex items-center gap-2 px-3 pt-3">
        <Button
          size="sm"
          variant="secondary"
          className="col-span-5 w-full justify-start gap-2"
          onClick={() => {
            /* new chat action */
          }}
        >
          <Plus className="h-4 w-4" />
          <span>New chat</span>
        </Button>
      </div>
      <Separator className="my-3" />
      <div className="text-muted-foreground mb-2 px-3 text-xs font-medium tracking-wide">
        {!collapsed ? "RECENTS" : "R"}
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-1 pb-8">
          {chats.map((c) => (
            <button
              key={c.id}
              className="hover:bg-accent/60 data-[active=true]:bg-accent rounded-md px-3 py-2 text-left text-sm transition-colors data-[active=true]:font-medium"
              data-active={c.id === "1"}
            >
              {collapsed ? c.title.slice(0, 1).toUpperCase() : c.title}
            </button>
          ))}
        </div>
      </ScrollArea>
      <div className="flex flex-col gap-1 border-t p-2">
        <Button variant="ghost" className="justify-start gap-2" size="sm">
          <User className="h-4 w-4" />
          {!collapsed && <span>Account</span>}
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-2"
            size="sm"
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Settings</span>}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
