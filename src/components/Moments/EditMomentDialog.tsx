"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import MomentForm, { type MomentFormValues } from "./MomentForm";

export default function EditMomentDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Partial<MomentFormValues> & { id: string };
  onSubmit: (id: string, payload: MomentFormValues) => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Moment</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <MomentForm
            initial={initial}
            onSubmit={async (payload) => {
              await onSubmit(initial.id, payload);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
