"use client";

import { CreateAlbumDialog } from "@/components/dialogs/create-album-dialog";
import { InviteMembersToAlbumDialog } from "@/components/dialogs/invite-users-to-album";
import { ManageAlbumDialog } from "@/components/dialogs/manage-album";
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
      <CreateAlbumDialog />
      <ManageAlbumDialog
        members={dialog.data.manageAlbumData?.members as AlbumMember[]}
        albumId={dialog.data.manageAlbumData?.albumId as string}
      />
      <InviteMembersToAlbumDialog />
      <UploadImageToAlbumDialog
        albumId={dialog.data.uploadImageToAlbumData?.albumId as string}
        onSuccess={dialog.data.uploadImageToAlbumData?.onSuccess}
      />
    </>
  );
};
