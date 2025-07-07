"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";

export function UploadImageToAlbumDialog({
  albumId,
  onSuccess
}: {
  albumId: string;
  onSuccess: (newImage: any) => void;
}) {
  const dialog = useDialogStore();

  const isDialogOpen = dialog.isOpen && dialog.type === "upload-image-to-album";

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image to Album</DialogTitle>
        </DialogHeader>
        <UploadDropzone
          className="bg-background border-muted-foreground ut-upload-icon:text-muted-foreground ut-label:text-foreground ut-allowed-content:text-muted-foreground ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:cursor-pointer cursor-pointer"
          endpoint="imageUploader"
          headers={{ "x-album-id": albumId }}
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              onSuccess(res[0]);
              toast.success(`Upload completed to album ${albumId}!`);
            } else {
              toast.success(`Upload completed to album ${albumId}!`);
              onSuccess(null);
            }
            dialog.close();
          }}
          onUploadError={(error: Error) => {
            toast.error(`Upload failed: ${error.message}`);
          }}
        />
        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={() => dialog.close()}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
