"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { createAlbum } from "@/lib/actions/album-actions";
import { createAlbumSchema } from "@/lib/validators/albums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormValues = z.infer<typeof createAlbumSchema>;

export function CreateAlbumDialog() {
  const dialog = useDialogStore();
  const isDialogOpen = dialog.isOpen && dialog.type === "create-album";

  const [userIds, setUserIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(createAlbumSchema),
    defaultValues: {
      name: "",
      userIds: [],
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(() => {
      createAlbum({
        name: data.name,
        userIds,
      }).then(() => {
        reset();
        setUserIds([]);
        dialog.close();
        toast.success("Album created successfully");
      });
    });
  };

  const addUserId = () => {
    try {
      const parsed = z.string().uuid().parse(currentUserId);
      if (!userIds.includes(parsed)) {
        setUserIds((prev) => [...prev, parsed]);
      }
      setCurrentUserId("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialog.close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Album</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Album Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-id">Invite User</Label>
            <div className="flex gap-2">
              <Input
                id="user-id"
                placeholder="Paste user ID"
                value={currentUserId}
                onChange={(e) => setCurrentUserId(e.target.value)}
              />
              <Button
                type="button"
                onClick={addUserId}
                disabled={!currentUserId.trim()}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </Button>
            </div>
            {userIds.length > 0 && (
              <ul className="text-muted-foreground mt-2 list-disc pl-5 text-sm">
                {userIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="mr-auto cursor-pointer"
              onClick={() => {
                reset();
                setUserIds([]);
                dialog.close();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Creating..." : "Create Album"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
