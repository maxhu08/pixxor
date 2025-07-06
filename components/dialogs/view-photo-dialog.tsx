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
import { Skeleton } from "@/components/ui/skeleton";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Wand2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

interface ViewPhotoDialogProps {
  photoId: string;
  photoUrl: string;
  onAddEffects: () => void;
}

export function ViewPhotoDialog({ photoId, photoUrl, onAddEffects }: ViewPhotoDialogProps) {
  const dialog = useDialogStore();
  const isDialogOpen = dialog.isOpen && dialog.type === "view-photo";
  const [isPending, startTransition] = useTransition();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [userRole, setUserRole] = useState<"OWNER" | "MEMBER" | "VIEWER" | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data: albumImageData, error: albumImageError } = await supabase
        .from("album_image")
        .select("album_id")
        .eq("image_id", photoId)
        .single();

      if (albumImageError || !albumImageData) return;

      const albumId = albumImageData.album_id;

      const { data: memberData, error: memberError } = await supabase
        .from("album_members")
        .select("role")
        .eq("album_id", albumId)
        .eq("user_id", user.id)
        .single();

      if (memberError || !memberData) return;

      setUserRole(memberData.role);
    };

    if (isDialogOpen) {
      setIsImageLoaded(false);
      fetchRole();
    }
  }, [isDialogOpen, photoId]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const isLoading = !isImageLoaded || isPending;

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>View Photo</DialogTitle>
          <DialogDescription>View your photo in full detail.</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          {isLoading && <Skeleton className="absolute inset-0 z-10 h-full w-full rounded-md" />}
          <Image
            src={photoUrl || "/placeholder.svg"}
            alt="photo"
            fill
            className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
            priority
            onLoad={handleImageLoad}
          />
        </div>
        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => dialog.close()} className="cursor-pointer">
              Close
            </Button>

            {userRole && userRole !== "VIEWER" && (
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  dialog.open("delete-photo", {
                    deletePhotoData: {
                      photoId
                    }
                  })
                }
                className="cursor-pointer"
                disabled={isPending}
              >
                <Trash2 />
                Delete Photo
              </Button>
            )}
          </div>

          {userRole && userRole !== "VIEWER" && (
            <Button
              type="button"
              onClick={() =>
                dialog.open("add-effects", {
                  addEffectsData: {
                    photoId,
                    onEffectsApplied: onAddEffects
                  }
                })
              }
              className="cursor-pointer"
              disabled={isPending}
            >
              <Wand2 />
              Add Effects
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
