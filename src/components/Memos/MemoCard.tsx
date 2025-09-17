"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Memo as MemoType } from "@/types/memo";
import { Star, StarOff, Trash2 } from "lucide-react";
import { memo } from "react";

interface Props {
  data: MemoType;
  onToggleFav(id: string): void;
  onDelete(id: string): void;
  view: "list" | "grid";
}

export const MemoCard = memo(function MemoCard({
  data,
  onToggleFav,
  onDelete,
  view,
}: Props) {
  return (
    <div
      className={cn(
        "group bg-card relative rounded-md border p-4 text-sm shadow-sm transition hover:shadow",
        view === "grid" ? "flex flex-col gap-2" : "flex flex-col gap-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="leading-tight font-medium">{data.title}</h3>
          {data.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {data.description}
            </p>
          )}
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-[11px]">
            <span>{new Date(data.createdAt).toLocaleDateString()}</span>
            {data.category && <span>{data.category}</span>}
            {data.durationSec ? <span>{data.durationSec}s</span> : null}
            <span>{data.playCount} plays</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={data.isFavorite ? "Unfavorite" : "Favorite"}
            onClick={() => onToggleFav(data.id)}
            className={cn(
              data.isFavorite ? "text-yellow-500" : "text-muted-foreground",
              "hover:text-yellow-500",
            )}
          >
            {data.isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete"
            onClick={() => onDelete(data.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
