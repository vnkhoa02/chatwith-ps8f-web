export type ConversationType = "All" | "Text" | "Voice" | "Files";

export interface ConversationItem {
  id: string;
  title: string;
  lastMessageSnippet: string;
  messageCount: number;
  createdAt: number; // epoch ms
  lastActivityAt: number; // epoch ms
  isFavorite?: boolean;
  voiceMemoCount?: number;
  fileCount?: number;
  shared?: boolean;
}

export type TimeRange =
  | "All Time"
  | "Today"
  | "Yesterday"
  | "This Week"
  | "This Month"
  | "This Year";

export interface ConversationQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  type?: ConversationType;
  timeRange?: TimeRange;
}

export interface PaginatedConversations {
  items: ConversationItem[];
  total: number;
  page: number;
  pageSize: number;
}
