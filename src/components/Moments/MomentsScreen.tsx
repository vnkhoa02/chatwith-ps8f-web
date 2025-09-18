"use client";

import { Button } from "@/components/ui/button";
import { useCreateMoment, useUpdateMoment } from "@/hooks/useMoments";
import type { MomentCategory, MomentItem } from "@/types/moment";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddMomentDialog from "./AddMomentDialog";
import EditMomentDialog from "./EditMomentDialog";
import MomentFilters from "./MomentFilters";
import MomentsList from "./MomentsList";

export default function MomentsScreen() {
  const [category, setCategory] = useState<MomentCategory | "All">("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editState, setEditState] = useState<{
    id: string;
    title?: string;
    description?: string;
    tags?: string[];
    label?: string;
    images?: string[];
    audioBase64?: string;
  } | null>(null);

  const createMut = useCreateMoment();
  const updateMut = useUpdateMoment();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Your Moments</h1>
          <p className="text-muted-foreground text-sm">
            AI-generated insights from your daily activities and thoughts
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Moment
        </Button>
      </div>
      <MomentFilters category={category} setCategory={setCategory} />
      <MomentsList
        category={category}
        onEdit={(item: MomentItem) => {
          console.log("Editing item", item);
          setEditState({
            id: item.id,
            title: item.title,
            description: item.description,
            tags: item.tags,
            images: item.images,
            audioBase64: item.audioBase64,
          });
        }}
        onDeleted={() => {
          /* Nothing required here; query invalidation in hook refreshes list */
        }}
      />

      {/* Add Dialog */}
      <AddMomentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={async (payload) => {
          await createMut.mutateAsync({ ...payload });
        }}
      />

      {/* Edit Dialog */}
      {editState ? (
        <EditMomentDialog
          open={!!editState}
          onOpenChange={(v) => !v && setEditState(null)}
          initial={editState}
          onSubmit={async (id, payload) => {
            await updateMut.mutateAsync({ id, data: payload });
          }}
        />
      ) : null}
    </div>
  );
}
