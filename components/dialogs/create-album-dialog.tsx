"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
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

export function CreateAlbumDialog({ onSuccess }: { onSuccess?: () => void }) {
  const dialog = useDialogStore();
  const isDialogOpen = dialog.isOpen && dialog.type === "create-album";

  const [userNames, setUserNames] = useState<string[]>([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(createAlbumSchema),
    defaultValues: {
      name: "",
      userIds: []
    }
  });

  const onSubmit = (data: FormValues) => {
    startTransition(() => {
      createAlbum({
        name: data.name,
        userNames
      })
        .then(() => {
          reset();
          setUserNames([]);
          dialog.close();
          onSuccess?.();
          toast.success("Album created successfully");
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to create album");
        });
    });
  };

  const addUserName = () => {
    const trimmed = currentUserName.trim();
    if (trimmed && !userNames.includes(trimmed)) {
      setUserNames((prev) => [...prev, trimmed]);
    }
    setCurrentUserName("");
  };

  const removeUserName = (name: string) => {
    setUserNames((prev) => prev.filter((n) => n !== name));
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
            <Input id="name" {...register("name")} autoComplete="off" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="user-name">Invite User</Label>
            <div className="flex gap-2">
              <Input
                id="user-name"
                placeholder="Enter user name"
                value={currentUserName}
                onChange={(e) => setCurrentUserName(e.target.value)}
                autoComplete="off"
              />
              <Button
                type="button"
                onClick={addUserName}
                disabled={!currentUserName.trim()}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </Button>
            </div>
            {userNames.length > 0 && (
              <ul className="text-muted-foreground mt-2 list-disc pl-5 text-sm">
                {userNames.map((name) => (
                  <li key={name} className="flex items-center gap-2">
                    <span>{name}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 p-0 text-red-500"
                      onClick={() => removeUserName(name)}
                      aria-label={`Remove ${name}`}
                    >
                      ×
                    </Button>
                  </li>
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
                setUserNames([]);
                dialog.close();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              {isPending ? "Creating..." : "Create Album"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
