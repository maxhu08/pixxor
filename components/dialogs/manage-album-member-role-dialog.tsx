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
import { AlbumMemberRole } from "@/types";
import { useEffect, useState, useTransition } from "react";

const ROLE_OPTIONS = [
  { label: "Owner", value: AlbumMemberRole.OWNER },
  { label: "Member", value: AlbumMemberRole.MEMBER },
  { label: "Viewer", value: AlbumMemberRole.VIEWER },
];

interface ManageAlbumMemberRoleDialogProps {
  albumId: string;
  member: {
    id: string;
    name: string;
  };
  currentRole: AlbumMemberRole;
}

export function ManageAlbumMemberRoleDialog({
  albumId,
  member,
  currentRole,
}: ManageAlbumMemberRoleDialogProps) {
  const dialog = useDialogStore();
  const [isPending, startTransition] = useTransition();

  const isDialogOpen =
    dialog.isOpen && dialog.type === "manage-album-member-role";

  const [selectedRole, setSelectedRole] = useState<AlbumMemberRole>(
    currentRole ?? AlbumMemberRole.MEMBER,
  );

  useEffect(() => {
    if (currentRole !== undefined) {
      setSelectedRole(currentRole);
    }
  }, [currentRole]);

  function onSave() {
    startTransition(async () => {
      if (!albumId || !member) return;

      // TODO: make it actually work later

      dialog.close();
    });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {member
              ? `Manage Role for ${member.name} (WIP)`
              : "No member data available"}
          </DialogTitle>
        </DialogHeader>

        {member ? (
          <div className="mt-4">
            <label htmlFor="role-select" className="mb-2 block font-medium">
              Select Role
            </label>
            <select
              id="role-select"
              className="w-full rounded border border-gray-300 p-2"
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as AlbumMemberRole)
              }
              disabled={isPending}
            >
              {ROLE_OPTIONS.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-muted-foreground my-6 text-center">
            There is no member data to manage.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={dialog.close} disabled={isPending}>
            Cancel
          </Button>
          {member && (
            <Button onClick={onSave} disabled={isPending}>
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
