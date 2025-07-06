"use client";

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
import { Wand2 } from "lucide-react";
import Image from "next/image";

interface ViewPhotoDialogProps {
  photoUrl: string;
  onAddEffects?: () => void;
}

export function ViewPhotoDialog({ photoUrl, onAddEffects = () => {} }: ViewPhotoDialogProps) {
  const dialog = useDialogStore();
  const isDialogOpen = dialog.isOpen && dialog.type === "view-photo";

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>View Photo</DialogTitle>
          <DialogDescription>View your photo in full detail.</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          <Image src={photoUrl} alt="photo" fill className="object-cover" priority />
        </div>
        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={() => dialog.close()} className="cursor-pointer">
            Close
          </Button>
          <Button type="button" onClick={onAddEffects} className="cursor-pointer">
            <Wand2 className="mr-2 size-4" />
            Add Effects
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
