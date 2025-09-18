"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useInfiniteMoments,
  useToggleMomentFavorite,
  useDeleteMoment,
} from "@/hooks/useMoments";
import type { MomentCategory, MomentItem } from "@/types/moment";
import MomentCard from "./MomentCard";
import { useState } from "react";

export default function MomentsList({
  category,
  onEdit,
  onDeleted,
}: {
  category: MomentCategory | "All";
  onEdit?: (item: MomentItem) => void;
  onDeleted?: (id: string) => void;
}) {
  const pageSize = 3;
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteMoments({ pageSize, category });

  const toggleFav = useToggleMomentFavorite();
  const del = useDeleteMoment();

  // Delete confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    del.mutate(pendingDeleteId, {
      onSuccess: () => onDeleted?.(pendingDeleteId),
      onSettled: () => {
        setConfirmOpen(false);
        setPendingDeleteId(null);
      },
    });
  };

  const flat = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="relative">
      <div className="max-h-[60vh] overflow-y-auto pr-1">
        <div className="flex flex-col gap-3">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          )}

          {flat.map((m) => (
            <MomentCard
              key={m.id}
              data={m}
              onToggleFav={toggleFav.mutate}
              onEdit={onEdit}
              onDelete={(id) => requestDelete(id)}
            />
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this moment?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={del.isPending}
            >
              {del.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
