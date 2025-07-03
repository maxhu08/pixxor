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
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";

export function UploadImageToAlbumDialog({
  albumId,
  onSuccess,
}: {
  albumId: string;
  onSuccess?: () => void;
}) {
  const dialog = useDialogStore();

  const isDialogOpen = dialog.isOpen && dialog.type === "upload-image-to-album";

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image to Album</DialogTitle>
        </DialogHeader>
        <div className="my-4">
          <UploadButton
            endpoint="imageUploader"
            headers={{ "x-album-id": albumId }}
            onClientUploadComplete={() => {
              onSuccess?.();
              toast.success(`Upload completed to album ${albumId}!`);
              dialog.close();
            }}
            onUploadError={(error: Error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => dialog.close()}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
