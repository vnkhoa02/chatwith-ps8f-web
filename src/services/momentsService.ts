import type {
  MomentCategory,
  MomentItem,
  MomentQueryParams,
  PaginatedMoments,
} from "@/types/moment";

// In-memory mock dataset
const mockData: MomentItem[] = (() => {
  const now = Date.now();
  const base: Array<{
    title: string;
    description: string;
    category: MomentCategory;
    tags: string[];
    minutes: number;
  }> = [
    {
      title: "Creative Breakthrough",
      description:
        "You had an interesting discussion about AI creativity patterns while working on your project. The conversation revealed new perspectives on machine learning applications in creative fields.",
      category: "Personal",
      tags: ["Creative", "AI", "Learning"],
      minutes: 15,
    },
    {
      title: "Problem Solving Session",
      description:
        "Deep focus session on debugging a complex algorithm. You demonstrated strong analytical thinking and persistence in solving the recursive function issue.",
      category: "Work",
      tags: ["Programming", "Focus", "Problem-solving"],
      minutes: 45,
    },
    {
      title: "Team Collaboration",
      description:
        "Productive brainstorming session with the team about upcoming product features. Your contributions on user experience design were particularly insightful.",
      category: "Work",
      tags: ["Teamwork", "UX", "Strategy"],
      minutes: 30,
    },
  ];

  // Generate 24 items with slight variations
  return Array.from({ length: 24 }).map((_, i) => {
    const src = base[i % base.length]!;
    return {
      id: String(i + 1),
      title: src.title,
      description: src.description,
      createdAt: new Date(now - i * 3600_000).toISOString(),
      category: src.category,
      tags: src.tags,
      activityMinutes: src.minutes,
      isFavorite: i % 7 === 0,
    } satisfies MomentItem;
  });
})();

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export const momentsService = {
  async list(params: MomentQueryParams = {}): Promise<PaginatedMoments> {
    const { page = 1, pageSize = 10, category = "All" } = params;
    await delay(300); // simulate latency
    let data = mockData.slice();
    if (category !== "All") {
      data = data.filter((m) => m.category === category);
    }
    const total = data.length;
    const start = (page - 1) * pageSize;
    const items = data.slice(start, start + pageSize);
    return { items, total, page, pageSize };
  },

  async toggleFavorite(id: string): Promise<MomentItem | undefined> {
    await delay(150);
    const idx = mockData.findIndex((m) => m.id === id);
    if (idx >= 0) {
      mockData[idx] = {
        ...mockData[idx]!,
        isFavorite: !mockData[idx]!.isFavorite,
      };
      return mockData[idx];
    }
  },
};
