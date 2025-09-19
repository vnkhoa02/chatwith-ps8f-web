"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatHistoryList,
  useToggleConversationFavorite,
} from "@/hooks/useChatHistory";
import type { ConversationType, TimeRange } from "@/types/chatHistory";
import { Download, Filter, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import ChatHistoryItem from "./ChatHistoryItem";

export default function ChatHistoryIndex() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<ConversationType>("All");
  const [timeRange, setTimeRange] = useState<TimeRange>("All Time");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const params = useMemo(
    () => ({ q, type, timeRange, page, pageSize }),
    [q, type, timeRange, page],
  );
  const { data, isLoading, isFetching } = useChatHistoryList(params);
  const toggleFav = useToggleConversationFavorite();

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1;

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Chat History</h1>
          <p className="text-muted-foreground text-sm">
            Review and search through your previous conversations
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-1 items-center gap-2 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search conversations..."
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <div className="relative">
            <Filter className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
            <select
              className="bg-background ring-offset-background focus:ring-ring w-full appearance-none rounded-md border px-8 py-2 text-sm focus:ring-2 focus:ring-offset-2"
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value as TimeRange);
                setPage(1);
              }}
            >
              {(
                [
                  "All Time",
                  "Today",
                  "Yesterday",
                  "This Week",
                  "This Month",
                  "This Year",
                ] as TimeRange[]
              ).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <select
            className="bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2"
            value={type}
            onChange={(e) => {
              setType(e.target.value as ConversationType);
              setPage(1);
            }}
          >
            {(["All", "Text", "Voice", "Files"] as ConversationType[]).map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}
        {data?.items.map((it) => (
          <ChatHistoryItem
            key={it.id}
            item={it}
            onToggleFav={toggleFav.mutate}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          {data
            ? `Showing ${(data.page - 1) * data.pageSize + 1}-${Math.min(data.page * data.pageSize, data.total)} of ${data.total} conversations`
            : "\u00A0"}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
          >
            Prev
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isFetching}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
