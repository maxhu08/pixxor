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
import { changeAlbumMemberRole } from "@/lib/actions/album-actions";
import { AlbumMemberRole } from "@/types";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

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
  onAlbumMemberRoleUpdated: (
    memberId: string,
    newRole: AlbumMemberRole,
  ) => void;
}

export function ManageAlbumMemberRoleDialog({
  albumId,
  member,
  currentRole,
  onAlbumMemberRoleUpdated,
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

  async function onSave() {
    if (!albumId || !member) return;

    startTransition(async () => {
      try {
        await changeAlbumMemberRole(albumId, member.id, selectedRole);
        toast.success("Member role updated");
        onAlbumMemberRoleUpdated(member.id, selectedRole);

        dialog.open("manage-album");
      } catch (error) {
        toast.error("Failed to update member role");
      }
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
          <Button
            variant="outline"
            onClick={dialog.close}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          {member && (
            <Button
              onClick={onSave}
              disabled={isPending}
              className="cursor-pointer"
            >
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
