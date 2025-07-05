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
import { AlbumMember, AlbumMemberRole } from "@/types";
import { useEffect, useState, useTransition } from "react";

interface ManageAlbumDialogProps {
  members: AlbumMember[];
  albumId: string;
}

export function ManageAlbumDialog({
  members,
  albumId,
}: ManageAlbumDialogProps) {
  const dialog = useDialogStore();
  const [isPending, startTransition] = useTransition();
  const [localMembers, setLocalMembers] = useState<AlbumMember[]>(members);

  const isDialogOpen = dialog.isOpen && dialog.type === "manage-album";

  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  function removeLocalAlbumMember(memberId: string) {
    setLocalMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  function updateLocalMemberRole(memberId: string, newRole: AlbumMemberRole) {
    setLocalMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              role: newRole,
            }
          : m,
      ),
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Album Members</DialogTitle>
        </DialogHeader>
        <div className="max-h-72 space-y-4 overflow-y-auto">
          {localMembers.length === 0 && <p>No members in this album.</p>}
          {localMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded border p-2"
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-muted-foreground text-sm">
                  Role: {member.role}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  className="cursor-pointer"
                  onClick={() =>
                    dialog.open("manage-album-member-role", {
                      manageAlbumMemberRoleData: {
                        albumId,
                        member: {
                          id: member.id,
                          name: member.name,
                        },
                        currentRole: member.role,
                        onAlbumMemberRoleUpdated: updateLocalMemberRole,
                      },
                    })
                  }
                >
                  Change Role
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  className="cursor-pointer"
                  onClick={() => {
                    dialog.open("remove-album-member", {
                      removeAlbumMemberData: {
                        albumId,
                        memberId: member.id,
                        onAlbumMemberRemoved: () =>
                          removeLocalAlbumMember(member.id),
                      },
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
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
