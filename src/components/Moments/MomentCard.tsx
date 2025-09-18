"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MomentItem } from "@/types/moment";
import { MoreHorizontal, Star, StarOff, Trash2 } from "lucide-react";

export default function MomentCard({
  data,
  onToggleFav,
  onEdit,
  onDelete,
}: {
  data: MomentItem;
  onToggleFav: (id: string) => void;
  onEdit?: (item: MomentItem) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="bg-card relative rounded-md border p-4 text-sm shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="leading-tight font-medium">{data.title}</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            {data.description}
          </p>
          {/* Intentionally hide images and audio in list view as requested */}
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-[11px]">
            <span>{new Date(data.createdAt).toLocaleString()}</span>
            <span>{data.category}</span>
            <span>{data.activityMinutes} min activity</span>
            <div className="flex flex-wrap gap-1">
              {data.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={data.isFavorite ? "Unfavorite" : "Favorite"}
            onClick={() => onToggleFav(data.id)}
            className={
              data.isFavorite ? "text-yellow-500" : "text-muted-foreground"
            }
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
            aria-label="Edit"
            onClick={() => onEdit?.(data)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete"
              onClick={() => onDelete?.(data.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
