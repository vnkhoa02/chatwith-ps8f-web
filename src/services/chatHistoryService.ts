import type {
  ConversationItem,
  ConversationQueryParams,
  PaginatedConversations,
  ConversationType,
  TimeRange,
} from "@/types/chatHistory";

const now = Date.now();

const seedTitles = [
  "Project Planning Discussion",
  "Code Review and Optimization",
  "UI/UX Design Consultation",
  "Database Architecture Planning",
  "API Integration Help",
  "Mobile App Development",
  "Bug Fixing Session",
  "Performance Tuning Meeting",
];

const seedSnippets = [
  "Thanks for the detailed breakdown of the user flow...",
  "The performance improvements look great. The load time has decreased...",
  "I love the new color scheme and layout...",
  "The schema design looks solid. Make sure to add proper indexing...",
  "The authentication flow is working correctly now...",
  "The mobile app is coming along nicely. The navigation feels intuitive...",
  "The bug was tricky, but we managed to isolate the issue to a memory leak...",
  "The performance tuning session really helped improve the response times...",
];

const mock: ConversationItem[] = Array.from({ length: 23 }).map((_, i) => {
  const title = seedTitles[i % seedTitles.length]!;
  const snippet = seedSnippets[i % seedSnippets.length]!;
  const created = now - (i + 1) * 24 * 3600_000;
  const last = created + (i % 5) * 3600_000;
  const voiceMemoCount = i % 3 === 0 ? (i % 5) + 1 : 0;
  const fileCount = i % 4 === 0 ? (i % 3) + 1 : 0;
  return {
    id: String(i + 1),
    title,
    lastMessageSnippet: snippet,
    messageCount: 10 + (i % 70),
    createdAt: created,
    lastActivityAt: last,
    isFavorite: i % 7 === 0,
    voiceMemoCount,
    fileCount,
    shared: i % 6 === 0,
  } satisfies ConversationItem;
});

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function matchesType(
  item: ConversationItem,
  type: ConversationType | undefined,
) {
  if (!type || type === "All") return true;
  if (type === "Voice") return (item.voiceMemoCount ?? 0) > 0;
  if (type === "Files") return (item.fileCount ?? 0) > 0;
  if (type === "Text")
    return (item.voiceMemoCount ?? 0) === 0 && (item.fileCount ?? 0) === 0;
  return true;
}

function matchesTimeRange(
  item: ConversationItem,
  range: TimeRange | undefined,
) {
  if (!range || range === "All Time") return true;
  const d = new Date(item.lastActivityAt);
  const nowD = new Date();
  const startOfDay = new Date(
    nowD.getFullYear(),
    nowD.getMonth(),
    nowD.getDate(),
  ).getTime();
  switch (range) {
    case "Today":
      return item.lastActivityAt >= startOfDay;
    case "Yesterday": {
      const yStart = startOfDay - 24 * 3600_000;
      return item.lastActivityAt >= yStart && item.lastActivityAt < startOfDay;
    }
    case "This Week": {
      const dow = nowD.getDay();
      const weekStart = startOfDay - ((dow + 6) % 7) * 24 * 3600_000; // Monday as start
      return item.lastActivityAt >= weekStart;
    }
    case "This Month": {
      const mStart = new Date(nowD.getFullYear(), nowD.getMonth(), 1).getTime();
      return item.lastActivityAt >= mStart;
    }
    case "This Year": {
      const yStart = new Date(nowD.getFullYear(), 0, 1).getTime();
      return item.lastActivityAt >= yStart;
    }
  }
}

export const chatHistoryService = {
  async list(
    params: ConversationQueryParams = {},
  ): Promise<PaginatedConversations> {
    const {
      page = 1,
      pageSize = 5,
      q = "",
      type = "All",
      timeRange = "All Time",
    } = params;
    await delay(250);
    let data = mock.slice();
    // Filters
    if (q.trim()) {
      const s = q.toLowerCase();
      data = data.filter(
        (c) =>
          c.title.toLowerCase().includes(s) ||
          c.lastMessageSnippet.toLowerCase().includes(s),
      );
    }
    data = data.filter(
      (c) => matchesType(c, type) && matchesTimeRange(c, timeRange),
    );
    // Sort by last activity desc
    data.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
    const total = data.length;
    const start = (page - 1) * pageSize;
    const items = data.slice(start, start + pageSize);
    return { items, total, page, pageSize };
  },

  async toggleFavorite(id: string) {
    await delay(100);
    const idx = mock.findIndex((c) => c.id === id);
    if (idx >= 0) {
      mock[idx] = { ...mock[idx]!, isFavorite: !mock[idx]!.isFavorite };
      return mock[idx];
    }
  },
};
