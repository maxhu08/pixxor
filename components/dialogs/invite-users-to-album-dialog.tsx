"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { inviteMembersToAlbum } from "@/lib/actions/album-actions";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";

export function InviteMembersToAlbumDialog({ albumId }: { albumId: string }) {
  const dialog = useDialogStore();
  const isDialogOpen =
    dialog.isOpen && dialog.type === "invite-members-to-album";

  const [userIds, setUserIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isPending, startTransition] = useTransition();

  const addUserId = () => {
    try {
      const parsed = z.string().uuid().parse(currentUserId.trim());
      if (!userIds.includes(parsed)) {
        setUserIds((prev) => [...prev, parsed]);
      }
      setCurrentUserId("");
    } catch {
      toast.error("Invalid user ID format");
    }
  };

  const onInvite = () => {
    startTransition(() => {
      inviteMembersToAlbum(albumId, userIds)
        .then(() => {
          toast.success("Members invited");
          setUserIds([]);
          setCurrentUserId("");
          dialog.close();
        })
        .catch(() => {
          toast.error("Failed to invite members");
        });
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-id">Invite User by ID</Label>
            <div className="flex gap-2">
              <Input
                id="user-id"
                placeholder="Paste user ID"
                value={currentUserId}
                onChange={(e) => setCurrentUserId(e.target.value)}
              />
              <Button
                type="button"
                onClick={addUserId}
                className="cursor-pointer"
                disabled={!currentUserId.trim()}
              >
                +
              </Button>
            </div>
            {userIds.length > 0 && (
              <ul className="text-muted-foreground mt-2 list-disc pl-5 text-sm">
                {userIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            className="mr-auto cursor-pointer"
            onClick={() => {
              setUserIds([]);
              setCurrentUserId("");
              dialog.close();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending || userIds.length === 0}
            className="cursor-pointer"
            onClick={onInvite}
          >
            {isPending ? "Inviting..." : "Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
