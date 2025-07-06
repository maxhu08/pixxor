"use client";

import type { UUID } from "crypto";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialogStore } from "@/hooks/use-dialog-store";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, FileText, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import useSWR from "swr";

async function fetchAlbum(albumId: UUID) {
  const supabase = createClient();
  const { data: albumData, error: albumError } = await supabase
    .from("albums")
    .select("id, name")
    .eq("id", albumId)
    .single();

  if (albumError) throw new Error("Album not found");
  if (!albumData.name) throw new Error("Album name is missing");

  return albumData;
}

const PAGE_SIZE = 20;

async function fetchImages(key: string) {
  const [, albumId, cursorData] = key.split(":");
  const supabase = createClient();

  let query = supabase
    .from("album_image")
    .select(
      `
      images!inner(
        id,
        url,
        filename,
        created_at
      )
    `
    )
    .eq("album_id", albumId)
    .order("created_at", { foreignTable: "images", ascending: false })
    .limit(PAGE_SIZE);

  if (cursorData && cursorData !== "0") {
    try {
      const cursor = JSON.parse(cursorData);
      if (cursor.lastCreatedAt) {
        query = query.lt("images.created_at", cursor.lastCreatedAt);
      }
    } catch {
      const page = Number.parseInt(cursorData);
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    }
  }

  const { data: albumImagesData, error: imagesError } = await query;

  if (imagesError) throw imagesError;

  // Extract the images from the junction table response
  const images = (albumImagesData || [])
    .map((item: any) => item.images)
    .filter((image: any) => image !== null);

  return images;
}

function AlbumErrorFallback({ error }: { error: Error }) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-red-500">{error.message || "Album not found"}</p>
    </div>
  );
}

function AlbumSkeleton() {
  const getRandomHeight = () => {
    const heights = ["h-48", "h-56", "h-64", "h-72", "h-80", "h-96"];
    return heights[Math.floor(Math.random() * heights.length)];
  };

  return (
    <>
      <div className="mb-4 flex w-full items-center justify-between gap-4">
        <div className="flex h-8 min-w-0 items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div className="bg-border h-6 w-px" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Separator className="my-6" />
      <div className="space-y-6">
        <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              <Skeleton className={`w-full ${getRandomHeight()}`} />
            </div>
          ))}
        </div>
        <div className="py-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </>
  );
}

function AlbumContent() {
  const { albumId } = useParams<{ albumId: UUID }>();
  const { data: album } = useSWR(albumId, fetchAlbum, { suspense: true });
  const [userRole, setUserRole] = useState<string | null>(null);

  const [images, setImages] = useState<any[]>([]);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);

  useEffect(() => {
    async function fetchRole() {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: member, error } = await supabase
        .from("album_members")
        .select("role")
        .eq("album_id", albumId)
        .eq("user_id", user.id)
        .single();

      if (!error && member) setUserRole(member.role);
      else setUserRole(null);
    }

    fetchRole();
  }, [albumId]);

  useEffect(() => {
    let isMounted = true;
    async function fetchInitialImages() {
      const initialImages = await fetchImages(`album-images:${albumId}:0`);
      if (isMounted) {
        setImages(initialImages);
        setIsImagesLoaded(true);
      }
    }
    fetchInitialImages();
    return () => {
      isMounted = false;
    };
  }, [albumId]);

  function onImageUploaded(newImage: any) {
    setImages((prev) => [newImage, ...prev]);
  }

  const dialog = useDialogStore();

  return (
    <>
      <div className="mb-4 flex w-full items-center justify-between gap-4">
        <div className="flex h-8 min-w-0 items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/gallery">
              <ArrowLeft />
              Back to Gallery
            </Link>
          </Button>
          <Separator orientation="vertical" />
          <h3 className="max-w-[300px] truncate text-2xl font-bold">{album.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              dialog.open("upload-image-to-album", {
                uploadImageToAlbumData: {
                  albumId,
                  onSuccess: (newImage: any) => onImageUploaded(newImage)
                }
              })
            }
            disabled={userRole === "VIEWER"}
            className={userRole !== "VIEWER" ? "cursor-pointer" : ""}
          >
            <PlusCircle />
            Upload
          </Button>
          {userRole === "VIEWER" && (
            <span className="ml-2 text-xs text-red-500">
              You do not have permission to upload images to this album.
            </span>
          )}
        </div>
      </div>
      <Separator className="my-6" />
      <div className="space-y-6">
        {!isImagesLoaded ? (
          <AlbumSkeleton />
        ) : images.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-sm">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8">
                <FileText className="mx-auto size-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No images</h3>
                <p className="mt-2 text-sm text-gray-500">
                  This album doesn't contain any images yet.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="cursor-pointer columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
              {images.map((image) => (
                <div
                  key={`${image.id}-${image.fileHash}`}
                  onClick={() =>
                    dialog.open("view-photo", {
                      viewPhotoData: {
                        photoUrl: image.url,
                        photoId: image.id,
                        onAddEffects: () => {}
                      }
                    })
                  }
                  className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-shadow hover:shadow-md"
                >
                  <Image
                    src={image.ufsUrl ?? image.url ?? "/placeholder.svg"}
                    alt={image.filename ?? image.name}
                    width={400}
                    height={600}
                    className="h-auto w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 transition-all duration-200 group-hover:bg-black/10 group-hover:backdrop-blur-[1.5px]" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function AlbumPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <ErrorBoundary FallbackComponent={AlbumErrorFallback}>
                <Suspense fallback={<AlbumSkeleton />}>
                  <AlbumContent />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
