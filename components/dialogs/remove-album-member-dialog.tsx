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
import { removeAlbumMember } from "@/lib/actions/album-actions";
import { LoaderCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface RemoveAlbumMemberDialogProps {
  memberId: string;
  albumId: string;
  onAlbumMemberRemoved: (memberId: string) => void;
}

export function RemoveAlbumMemberDialog({
  memberId,
  albumId,
  onAlbumMemberRemoved
}: RemoveAlbumMemberDialogProps) {
  const dialog = useDialogStore();

  const isDialogOpen = dialog.isOpen && dialog.type === "remove-album-member";

  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!memberId || !albumId) return;

    startTransition(async () => {
      try {
        await removeAlbumMember(albumId, memberId);
        toast.success("Member removed");
        onAlbumMemberRemoved(memberId);
      } catch {
        toast.error("Failed to remove member");
      } finally {
        dialog.open("manage-album");
      }
    });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this member from the album?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={dialog.close} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={isPending}
            className="cursor-pointer border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            {isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
