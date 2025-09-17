"use client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateMemo,
  useDeleteMemo,
  useMemosList,
  useToggleFavorite,
} from "@/hooks/useMemos";
import type { MemoCategory } from "@/types/memo";
import { useCallback, useState } from "react";
import { MemoFilters } from "./MemoFilters";
import { MemoList } from "./MemoList";
import { Pagination } from "./Pagination";
import { QuickRecord } from "./QuickRecord";

export function MemosScreen() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MemoCategory | "All">("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const [title, setTitle] = useState("");
  const { data, isLoading } = useMemosList({
    page,
    pageSize,
    search,
    category,
  });

  const create = useCreateMemo();
  const toggleFav = useToggleFavorite();
  const del = useDeleteMemo();

  const handleRecorded = useCallback(
    (base64: string, durationSec: number) => {
      if (!title.trim()) return console.error("Title required");
      create.mutate(
        {
          title: title.trim(),
          audioBase64: base64,
          durationSec,
          category: "Ideas",
        },
        {
          onSuccess: () => {
            setTitle("");
            console.log("Memo saved");
          },
          onError: (e: any) =>
            console.error(e.message || "Failed to save memo"),
        },
      );
    },
    [create, title],
  );

  const onToggleFav = (id: string) => toggleFav.mutate(id);
  const onDelete = (id: string) => del.mutate(id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:p-6">
      <QuickRecord
        title={title}
        setTitle={setTitle}
        onRecorded={handleRecorded}
        creating={create.isPending}
      />
      <MemoFilters
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        category={category}
        setCategory={(c) => {
          setCategory(c);
          setPage(1);
        }}
        view={view}
        setView={setView}
      />
      <div className="flex flex-col gap-4">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        )}
        {!isLoading && data && (
          <>
            <MemoList
              memos={data.items}
              view={view}
              onToggleFav={onToggleFav}
              onDelete={onDelete}
            />
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onPage={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
