"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { AlbumMember } from "@/types";
import {
  Eye,
  ImageIcon,
  MoreHorizontal,
  Settings,
  Trash2,
  UserPlus,
} from "lucide-react";
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
  currentUserId: string;
  onDelete?: () => void;
}

export function AlbumCard({
  album,
  imageCount,
  latestImageTimestamp,
  members,
  currentUserId,
  onDelete,
}: AlbumCardProps) {
  const dialog = useDialogStore();

  const currentUserMember = members.find((m) => m.id === currentUserId);
  const currentUserRole = currentUserMember?.role ?? "MEMBER";

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div
        className="bg-muted relative mx-auto aspect-video overflow-hidden rounded-lg p-4"
        style={{ width: "calc(100% - 32px)" }}
      >
        {album.latestImage ? (
          <Image
            src={album.latestImage.url || "/placeholder.svg"}
            alt={`Cover image for ${album.name}`}
            fill
            className="rounded-md object-cover"
          />
        ) : (
          <div className="from-muted to-muted/50 text-muted-foreground flex h-full flex-col items-center justify-center rounded-md bg-gradient-to-br">
            <ImageIcon className="mb-2 h-8 w-8" />
            <p>No images yet</p>
          </div>
        )}
      </div>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="line-clamp-1">{album.name}</CardTitle>
        <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-medium">
          Your role: {currentUserRole}
        </span>
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
        <p className="text-muted-foreground text-sm">
          {(() => {
            const others = members.filter((m) => m.id !== currentUserId);
            if (members.length === 1) {
              return "You";
            }
            if (members.length === 2) {
              return `You and ${others[0].name}`;
            }
            return `You, ${others[0].name} and ${others.length - 1} more`;
          })()}
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
            Open
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="bg-transparent">
              <MoreHorizontal className="h-5 w-5 cursor-pointer" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                dialog.open("invite-members-to-album", {
                  inviteMembersToAlbumData: { albumId: album.id },
                })
              }
            >
              <UserPlus className="mr-2 h-4 w-4" /> Invite (WIP)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                dialog.open("manage-album", {
                  manageAlbumData: {
                    albumId: album.id,
                    members,
                  },
                })
              }
            >
              <Settings className="mr-2 h-4 w-4" /> Manage (WIP)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                dialog.open("delete-album", {
                  deleteAlbumData: {
                    albumId: album.id,
                    onAlbumDeleted: onDelete,
                  },
                })
              }
              className="text-destructive"
            >
              <Trash2 className="text-destructive mr-2 h-4 w-4" /> Delete Album
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
