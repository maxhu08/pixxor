import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { removeAlbumMember } from "@/lib/actions/album-actions";
import { LoaderCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function RemoveAlbumMemberDialog() {
  const dialog = useDialogStore();

  const isDialogOpen = dialog.isOpen && dialog.type === "remove-album-member";

  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    const memberId = dialog.data.removeAlbumMemberData?.memberId;
    const albumId = dialog.data.removeAlbumMemberData?.albumId;

    if (!memberId || !albumId) return;

    startTransition(async () => {
      try {
        await removeAlbumMember(albumId, memberId);
        toast.success("Member removed");
      } catch {
        toast.error("Failed to remove member");
      } finally {
        dialog.close();
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
          <Button variant="outline" onClick={dialog.close}>
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
                <LoaderCircle className="mr-2 size-4 animate-spin" />
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
