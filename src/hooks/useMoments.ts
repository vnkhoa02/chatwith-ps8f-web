"use client";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { momentsService } from "@/services/momentsService";
import type { MomentCategory } from "@/types/moment";

const keys = {
  list: (p: {
    page: number;
    pageSize: number;
    category?: MomentCategory | "All";
  }) => ["moments", p.page, p.pageSize, p.category ?? "All"],
};

export function useMomentsList(params: {
  page: number;
  pageSize: number;
  category?: MomentCategory | "All";
}) {
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => momentsService.list(params),
    staleTime: 30_000,
  });
}

export function useInfiniteMoments(params: {
  pageSize: number;
  category?: MomentCategory | "All";
}) {
  const { pageSize, category = "All" } = params;
  return useInfiniteQuery({
    queryKey: ["moments", "infinite", pageSize, category],
    queryFn: ({ pageParam }) =>
      momentsService.list({
        page: typeof pageParam === "number" ? pageParam : 1,
        pageSize,
        category,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    staleTime: 30_000,
  });
}

export function useToggleMomentFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => momentsService.toggleFavorite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moments"] });
    },
  });
}

export function useCreateMoment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: momentsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moments"] }),
  });
}

export function useUpdateMoment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      momentsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moments"] }),
  });
}

export function useDeleteMoment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => momentsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moments"] }),
  });
}
