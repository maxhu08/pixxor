"use client";

import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { PlusCircle } from "lucide-react";

export function CreateAlbumButton() {
  const dialog = useDialogStore();

  return (
    <Button
      asChild
      className="cursor-pointer"
      onClick={() => {
        dialog.open("create-album");
      }}
    >
      <div className="flex items-center">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Album
      </div>
    </Button>
  );
}
