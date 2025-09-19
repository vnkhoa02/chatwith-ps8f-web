"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConversationItem } from "@/types/chatHistory";
import {
  CalendarDays,
  Clock3,
  FileText,
  Headphones,
  MoreHorizontal,
  Star,
  StarOff,
} from "lucide-react";

export default function ChatHistoryItem({
  item,
  onToggleFav,
}: {
  item: ConversationItem;
  onToggleFav: (id: string) => void;
}) {
  const created = new Date(item.createdAt);
  const last = new Date(item.lastActivityAt);
  return (
    <div className="bg-card rounded-md border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{item.title}</h3>
            <Badge variant="secondary" className="text-[10px]">
              {item.messageCount} messages
            </Badge>
            {item.shared && (
              <Badge className="text-[10px]" variant="default">
                Shared
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
            Last message: "{item.lastMessageSnippet}"
          </p>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {last.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {created.toLocaleDateString()}
            </span>
            {item.voiceMemoCount ? (
              <span className="inline-flex items-center gap-1">
                <Headphones className="h-3.5 w-3.5" />
                {item.voiceMemoCount} voice memos
              </span>
            ) : null}
            {item.fileCount ? (
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {item.fileCount} files
              </span>
            ) : null}
          </div>
        </div>
        <div className="shrink-0">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={item.isFavorite ? "Unfavorite" : "Favorite"}
              onClick={() => onToggleFav(item.id)}
              className={
                item.isFavorite ? "text-yellow-500" : "text-muted-foreground"
              }
            >
              {item.isFavorite ? (
                <Star className="h-4 w-4 fill-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Open</DropdownMenuItem>
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
