export type MomentCategory = "Work" | "Personal" | "Learning";

export interface MomentItem {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO timestamp
  category: MomentCategory;
  tags: string[];
  activityMinutes: number;
  isFavorite: boolean;
  images?: string[];
  audioBase64?: string;
}

export interface MomentQueryParams {
  page?: number; // 1-based
  pageSize?: number;
  category?: MomentCategory | "All";
}

export interface PaginatedMoments {
  items: MomentItem[];
  total: number;
  page: number;
  pageSize: number;
}
