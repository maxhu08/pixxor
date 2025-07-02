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

export function InviteMembersToAlbumDialog() {
  const dialog = useDialogStore();

  const isDialogOpen =
    dialog.isOpen && dialog.type === "invite-members-to-album";

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Members to Album Dialog (WIP)</DialogTitle>
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
