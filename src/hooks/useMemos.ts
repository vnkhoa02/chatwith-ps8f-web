"use client";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { memosService } from "@/services/memosService";
import type { CreateMemoInput, MemoCategory } from "@/types/memo";

const keys = {
  list: (p: { page: number; pageSize: number; search?: string; category?: MemoCategory | "All" }) => [
    "memos",
    p.page,
    p.pageSize,
    p.search ?? "",
    p.category ?? "All",
  ],
};

export function useMemosList(params: {
  page: number;
  pageSize: number;
  search?: string;
  category?: MemoCategory | "All";
}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => memosService.list(params),
    staleTime: 1000 * 30,
  });
}

export function useCreateMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMemoInput) => memosService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memos"] });
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memosService.toggleFavorite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memos"] });
    },
  });
}

export function useDeleteMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memosService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memos"] });
    },
  });
}
