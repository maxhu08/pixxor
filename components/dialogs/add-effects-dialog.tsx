"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { addEffect } from "@/lib/actions/image-actions";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface AddEffectsDialogProps {
  photoId: string;
  onEffectsApplied?: () => void;
}

const EFFECTS = [{ label: "Monotone (Grayscale)", value: "monotone" }];

export function AddEffectsDialog({ photoId, onEffectsApplied }: AddEffectsDialogProps) {
  const dialog = useDialogStore();
  const isDialogOpen = dialog.isOpen && dialog.type === "add-effects";
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleToggleEffect = (effect: string) => {
    setSelectedEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  };

  const handleApplyEffects = () => {
    startTransition(async () => {
      try {
        for (const effect of selectedEffects) {
          await addEffect(photoId, effect as any);
        }
        toast.success("Effects applied!");
        dialog.close();
        onEffectsApplied?.();
      } catch (err: any) {
        toast.error(err?.message || "Failed to apply effects");
      }
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Effects</DialogTitle>
          <DialogDescription>Select one or more effects to apply to your photo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {EFFECTS.map((effect) => (
            <label key={effect.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedEffects.includes(effect.value)}
                onChange={() => handleToggleEffect(effect.value)}
                disabled={isPending}
              />
              {effect.label}
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => dialog.close()} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApplyEffects}
            className="cursor-pointer"
            disabled={isPending || selectedEffects.length === 0}
          >
            {isPending ? "Applying..." : "Apply Effects"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
