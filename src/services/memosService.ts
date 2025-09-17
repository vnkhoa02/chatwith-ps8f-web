import type { CreateMemoInput, Memo, MemoCategory, PaginatedMemos } from "@/types/memo";

// Simple in-memory mock DB. In real app, replace with API calls.
let memos: Memo[] = [];

function seed() {
  if (memos.length) return;
  const now = Date.now();
  const sample: Array<Partial<Memo> & { title: string }> = [
    {
      title: "Morning Thoughts - Project Planning",
      description:
        "Ideas about the new feature implementation and user experience improvements...",
      category: "Work",
      playCount: 342,
      isFavorite: true,
    },
    {
      title: "Meeting Notes - Client Call",
      description:
        "Key points discussed during the client presentation and feedback received...",
      category: "Meetings",
      playCount: 723,
      isFavorite: false,
    },
    {
      title: "Personal Reflection",
      description:
        "Thoughts on work-life balance and goals for the upcoming quarter...",
      category: "Personal",
      playCount: 517,
      isFavorite: false,
    },
    {
      title: "Quick Idea - App Feature",
      description:
        "Voice command integration for hands-free memo recording while driving...",
      category: "Ideas",
      playCount: 208,
      isFavorite: false,
    },
  ];
  memos = sample.map((m, i) => ({
    id: `seed-${i + 1}`,
    createdAt: new Date(now - i * 86400000).toISOString(),
    updatedAt: new Date(now - i * 86400000).toISOString(),
    category: (m.category as MemoCategory) ?? "Other",
    durationSec: Math.round(30 + Math.random() * 90),
    audioBase64: undefined,
    title: m.title,
    description: m.description,
    isFavorite: m.isFavorite ?? false,
    playCount: m.playCount ?? Math.round(100 + Math.random() * 800),
  }));
}
seed();

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export interface FetchMemosParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: MemoCategory | "All";
}

export const memosService = {
  async list(params: FetchMemosParams): Promise<PaginatedMemos> {
    await delay(250);
    const { page = 1, pageSize = 10, search, category } = params;
    let filtered = [...memos];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          (m.description?.toLowerCase().includes(s) ?? false),
      );
    }
    if (category && category !== "All") {
      filtered = filtered.filter((m) => m.category === category);
    }
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return { items, total, page, pageSize };
  },

  async create(input: CreateMemoInput): Promise<Memo> {
    await delay(300);
    const now = new Date().toISOString();
    const newMemo: Memo = {
      id: crypto.randomUUID(),
      title: input.title || "Untitled Memo",
      description: input.description,
      category: input.category ?? "Other",
      createdAt: now,
      updatedAt: now,
      audioBase64: input.audioBase64,
      durationSec: input.durationSec,
      playCount: 0,
      isFavorite: false,
    };
    memos.unshift(newMemo);
    return newMemo;
  },

  async toggleFavorite(id: string): Promise<Memo> {
    await delay(150);
    const m = memos.find((x) => x.id === id);
    if (!m) throw new Error("Not found");
    m.isFavorite = !m.isFavorite;
    m.updatedAt = new Date().toISOString();
    return m;
  },

  async delete(id: string): Promise<{ id: string }> {
    await delay(150);
    memos = memos.filter((m) => m.id !== id);
    return { id };
  },

  async incrementPlay(id: string): Promise<void> {
    const m = memos.find((x) => x.id === id);
    if (m) m.playCount += 1;
  },
};
