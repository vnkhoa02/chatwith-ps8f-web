"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInfiniteMoments,
  useToggleMomentFavorite,
} from "@/hooks/useMoments";
import type { MomentCategory } from "@/types/moment";
import MomentCard from "./MomentCard";

export default function MomentsList({
  category,
}: {
  category: MomentCategory | "All";
}) {
  const pageSize = 3;
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteMoments({ pageSize, category });

  const toggleFav = useToggleMomentFavorite();

  const flat = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="relative">
      <div className="max-h-[60vh] overflow-y-auto pr-1">
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : null}

          {flat.map((m) => (
            <MomentCard key={m.id} data={m} onToggleFav={toggleFav.mutate} />
          ))}

          {hasNextPage && (
            <div className="flex justify-center pb-2">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load More Moments"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
