"use client";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MemoCategory } from "@/types/memo";
import { List, Grid3x3 } from "lucide-react";

interface Props {
  search: string;
  setSearch(v: string): void;
  category: MemoCategory | "All";
  setCategory(c: MemoCategory | "All"): void;
  view: "list" | "grid";
  setView(v: "list" | "grid"): void;
}

const categories: Array<MemoCategory | "All"> = [
  "All",
  "Work",
  "Meetings",
  "Personal",
  "Ideas",
  "Other",
];

export function MemoFilters({
  search,
  setSearch,
  category,
  setCategory,
  view,
  setView,
}: Props) {
  const catButtons = useMemo(
    () =>
      categories.map((c) => (
        <Button
          key={c}
          variant={c === category ? "default" : "outline"}
          size="sm"
          className="rounded-full text-xs"
          onClick={() => setCategory(c)}
        >
          {c}
        </Button>
      )),
    [category, setCategory],
  );

  return (
    <div className="bg-card/50 flex justify-between gap-4 rounded-md border p-4">
      <div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <Input
            placeholder="Search memos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-sm"
          />
          <div className="flex gap-2">{catButtons}</div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "list" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
