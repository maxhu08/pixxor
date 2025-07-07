import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { deleteAlbum } from "@/lib/actions/album-actions";
import { LoaderCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface DeleteAlbumDialogProps {
  albumId: string;
  onAlbumDeleted: () => void;
}

export function DeleteAlbumDialog({ albumId, onAlbumDeleted }: DeleteAlbumDialogProps) {
  const dialog = useDialogStore();
  const isDialogOpen = dialog.isOpen && dialog.type === "delete-album";
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!albumId) return;
    startTransition(async () => {
      try {
        await deleteAlbum(albumId);
        toast.success("Album deleted");
        onAlbumDeleted();
      } catch {
        toast.error("Failed to delete album");
      } finally {
        dialog.close();
      }
    });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Album</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this album? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => dialog.close()} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isPending}
            className="cursor-pointer border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            {isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
