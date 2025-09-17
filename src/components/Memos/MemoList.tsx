"use client";
import { MemoCard } from "./MemoCard";
import type { Memo } from "@/types/memo";

interface Props {
  memos: Memo[];
  view: "list" | "grid";
  onToggleFav(id: string): void;
  onDelete(id: string): void;
}

export function MemoList({ memos, view, onToggleFav, onDelete }: Props) {
  if (!memos.length) {
    return (
      <div className="bg-muted/30 text-muted-foreground rounded-md border p-8 text-center text-sm">
        No memos found.
      </div>
    );
  }
  return (
    <div className="relative">
      <div
        className={
          (view === "grid"
            ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            : "flex flex-col gap-3") + " max-h-[60vh] overflow-y-auto pr-1"
        }
      >
        {memos.map((m) => (
          <MemoCard
            key={m.id}
            data={m}
            view={view}
            onToggleFav={onToggleFav}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
