"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDialogStore } from "@/hooks/use-dialog-store";

export function ManageAlbumDialog() {
  const dialog = useDialogStore();

  const isDialogOpen = dialog.isOpen && dialog.type === "manage-album";

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Album Dialog (WIP)</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="mt-4 mr-auto cursor-pointer"
            onClick={() => dialog.close()}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
