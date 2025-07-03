"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { AlbumMember } from "@/types";
import { Eye, Settings, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AlbumCardProps {
  album: {
    id: string;
    name: string;
    latestImage?: {
      id: string;
      url: string;
    } | null;
  };
  imageCount: number;
  latestImageTimestamp: string | null;
  members: AlbumMember[];
}

export function AlbumCard({
  album,
  imageCount,
  latestImageTimestamp,
  members,
}: AlbumCardProps) {
  const dialog = useDialogStore();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="bg-muted relative aspect-video overflow-hidden">
        {album.latestImage ? (
          <Image
            src={album.latestImage.url || "/placeholder.svg"}
            alt={`Cover image for ${album.name}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="from-muted to-muted/50 flex h-full items-center justify-center bg-gradient-to-br">
            <p className="text-muted-foreground">No images yet</p>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{album.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pb-2">
        <p className="text-muted-foreground text-sm">
          {imageCount} photo{imageCount !== 1 ? "s" : ""}
        </p>
        <p className="text-muted-foreground text-sm">
          {latestImageTimestamp
            ? `Last updated ${new Date(latestImageTimestamp).toLocaleString()}`
            : "No uploads yet"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-0">
        <Button
          asChild
          variant="default"
          size="sm"
          className="flex-1 cursor-pointer"
        >
          <Link href={`/album/${album.id}`}>
            <Eye className="mr-1 h-4 w-4" />
            View
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 cursor-pointer bg-transparent"
          onClick={() => dialog.open("invite-members-to-album")}
        >
          <div>
            <UserPlus className="mr-1 h-4 w-4" />
            Invite (WIP)
          </div>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 cursor-pointer bg-transparent"
          onClick={() =>
            dialog.open("manage-album", {
              manageAlbumData: {
                albumId: album.id,
                members,
              },
            })
          }
        >
          <div>
            <Settings className="mr-1 h-4 w-4" />
            Manage (WIP)
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
}
