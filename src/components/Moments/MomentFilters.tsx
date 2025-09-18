"use client";
import { Button } from "@/components/ui/button";
import type { MomentCategory } from "@/types/moment";

interface Props {
  category: MomentCategory | "All";
  setCategory: (c: MomentCategory | "All") => void;
}

const categories: Array<MomentCategory | "All"> = [
  "All",
  "Work",
  "Personal",
  "Learning",
];

export default function MomentFilters({ category, setCategory }: Props) {
  return (
    <div className="bg-card/50 flex items-center gap-2 rounded-md border p-3">
      {categories.map((c) => (
        <Button
          key={c}
          size="sm"
          variant={c === category ? "default" : "outline"}
          className="rounded-full text-xs"
          onClick={() => setCategory(c)}
        >
          {c}
        </Button>
      ))}
    </div>
  );
}
