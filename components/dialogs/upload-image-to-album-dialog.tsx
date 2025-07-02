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

type UploadImageToAlbumDialogProps = {
  albumId: string;
};

export function UploadImageToAlbumDialog({
  albumId,
}: UploadImageToAlbumDialogProps) {
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
