"use client";
import { chatHistoryService } from "@/services/chatHistoryService";
import type {
  ConversationQueryParams,
  PaginatedConversations,
} from "@/types/chatHistory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const qk = {
  list: (params: ConversationQueryParams) =>
    ["chatHistory", "list", params] as const,
};

export function useChatHistoryList(params: ConversationQueryParams) {
  return useQuery<PaginatedConversations>({
    queryKey: qk.list(params),
    queryFn: () => chatHistoryService.list(params),
  });
}

export function useToggleConversationFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatHistoryService.toggleFavorite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}
