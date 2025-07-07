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
import { signOutAction } from "@/lib/actions/account-actions";
import { LoaderCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function SignOutDialog() {
  const dialog = useDialogStore();

  const isDialogOpen = dialog.isOpen && dialog.type === "sign-out";

  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      try {
        signOutAction();
      } catch {
        toast.error("Failed to sign out");
      } finally {
        dialog.close();
      }
    });
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Out</DialogTitle>
          <DialogDescription>Are you sure you want to sign out?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => dialog.close()} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            disabled={isPending}
            className="cursor-pointer border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Signing out...
              </>
            ) : (
              "Sign Out"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
