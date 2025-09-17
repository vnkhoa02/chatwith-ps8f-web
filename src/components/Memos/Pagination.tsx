"use client";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  total: number;
  pageSize: number;
  onPage(p: number): void;
}

export function Pagination({ page, total, pageSize, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      <Button size="sm" variant="outline" disabled={page === 1} onClick={() => onPage(page - 1)}>
        Prev
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: pages }).slice(0, 5).map((_, i) => {
          const p = i + 1;
          return (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "secondary" : "ghost"}
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          );
        })}
        {pages > 5 && <span className="px-1">...</span>}
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={page === pages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
