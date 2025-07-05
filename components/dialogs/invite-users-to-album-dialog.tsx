"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
  const isDialogOpen = dialog.isOpen && dialog.type === "invite-members-to-album";

  const [userNames, setUserNames] = useState<string[]>([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const [isPending, startTransition] = useTransition();

  const addUserName = () => {
    const trimmed = currentUserName.trim();
    if (trimmed && !userNames.includes(trimmed)) {
      setUserNames((prev) => [...prev, trimmed]);
    }
    setCurrentUserName("");
  };

  const onInvite = () => {
    startTransition(() => {
      inviteMembersToAlbum(albumId, userNames)
        .then(() => {
          toast.success("Members invited");
          setUserNames([]);
          setCurrentUserName("");
          dialog.close();
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to invite members");
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
            <Label htmlFor="user-name">Invite User by Name</Label>
            <div className="flex gap-2">
              <Input
                id="user-name"
                placeholder="Enter user name"
                value={currentUserName}
                onChange={(e) => setCurrentUserName(e.target.value)}
              />
              <Button
                type="button"
                onClick={addUserName}
                className="cursor-pointer"
                disabled={!currentUserName.trim()}
              >
                +
              </Button>
            </div>
            {userNames.length > 0 && (
              <ul className="text-muted-foreground mt-2 list-disc pl-5 text-sm">
                {userNames.map((name) => (
                  <li key={name}>{name}</li>
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
              setUserNames([]);
              setCurrentUserName("");
              dialog.close();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending || userNames.length === 0}
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
