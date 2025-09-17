export type MemoCategory = "Work" | "Meetings" | "Personal" | "Ideas" | "Other";

export interface Memo {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  durationSec?: number; // for audio memos
  audioBase64?: string; // pure base64 audio data (no data: prefix) optional
  category: MemoCategory;
  isFavorite: boolean;
  playCount: number;
}

export interface CreateMemoInput {
  title: string;
  description?: string;
  category?: MemoCategory;
  audioBase64?: string;
  durationSec?: number;
}

export interface MemoQueryParams {
  page?: number; // 1-based
  pageSize?: number;
  search?: string;
  category?: MemoCategory | "All";
  view?: "list" | "grid";
}

export interface PaginatedMemos {
  items: Memo[];
  total: number;
  page: number;
  pageSize: number;
}
