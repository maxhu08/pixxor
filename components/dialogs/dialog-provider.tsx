"use client";

import { CreateAlbumDialog } from "@/components/dialogs/create-album-dialog";
import { InviteMembersToAlbumDialog } from "@/components/dialogs/invite-users-to-album";
import { ManageAlbumDialog } from "@/components/dialogs/manage-album";
import { SignOutDialog } from "@/components/dialogs/sign-out-dialog";
//
import { useDialogStore } from "@/hooks/use-dialog-store";
//
import { useEffect, useState } from "react";

export const DialogProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  // const dialogStore = useDialogStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <SignOutDialog />
      <CreateAlbumDialog />
      <ManageAlbumDialog />
      <InviteMembersToAlbumDialog />
    </>
  );
};
