"use client";

import { CreateAlbumDialog } from "@/components/dialogs/create-album-dialog";
import { InviteMembersToAlbumDialog } from "@/components/dialogs/invite-users-to-album";
import { ManageAlbumDialog } from "@/components/dialogs/manage-album-dialog";
import { ManageAlbumMemberRoleDialog } from "@/components/dialogs/manage-album-member-role-dialog";
import { RemoveAlbumMemberDialog } from "@/components/dialogs/remove-album-member-dialog";
import { SignOutDialog } from "@/components/dialogs/sign-out-dialog";
import { UploadImageToAlbumDialog } from "@/components/dialogs/upload-image-to-album-dialog";
//
import { useDialogStore } from "@/hooks/use-dialog-store";
import { AlbumMember } from "@/types";
//
import { useEffect, useState } from "react";

export const DialogProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  const dialog = useDialogStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <SignOutDialog />
      <CreateAlbumDialog onSuccess={dialog.data.createAlbumData?.onSuccess} />
      <ManageAlbumDialog
        members={dialog.data.manageAlbumData?.members ?? []}
        albumId={dialog.data.manageAlbumData?.albumId as string}
      />
      {dialog.data.manageAlbumMemberRoleData?.member && (
        <ManageAlbumMemberRoleDialog
          albumId={dialog.data.manageAlbumMemberRoleData?.albumId as string}
          member={dialog.data.manageAlbumMemberRoleData?.member}
          currentRole={dialog.data.manageAlbumMemberRoleData?.currentRole}
        />
      )}
      <RemoveAlbumMemberDialog
        albumId={dialog.data.removeAlbumMemberData?.albumId as string}
        memberId={dialog.data.removeAlbumMemberData?.memberId as string}
        onAlbumMemberRemoved={
          dialog.data.removeAlbumMemberData?.onAlbumMemberRemoved as () => void
        }
      />
      <InviteMembersToAlbumDialog />
      <UploadImageToAlbumDialog
        albumId={dialog.data.uploadImageToAlbumData?.albumId as string}
        onSuccess={dialog.data.uploadImageToAlbumData?.onSuccess}
      />
    </>
  );
};
