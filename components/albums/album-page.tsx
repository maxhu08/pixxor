"use client";

import { UUID } from "crypto";
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
import { useInView } from "react-intersection-observer";
import useSWR, { mutate } from "swr";
import useSWRInfinite, { unstable_serialize } from "swr/infinite";

function onUploadSuccess(albumId: UUID) {
  const keyPrefix = unstable_serialize((pageIndex, previousPageData) =>
    getKey(pageIndex, previousPageData, albumId),
  );

  mutate(keyPrefix);
}

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

function getKey(pageIndex: number, previousPageData: any, albumId: string) {
  if (previousPageData && !previousPageData.length) return null;
  if (pageIndex === 0) return { lastCreatedAt: null, albumId };
  return { lastCreatedAt: previousPageData.at(-1).created_at, albumId };
}

async function fetchImages({
  lastCreatedAt,
  albumId,
}: {
  lastCreatedAt: string | null;
  albumId: string;
}) {
  const supabase = createClient();

  let query = supabase
    .from("images")
    .select("id, url, filename, created_at")
    .eq("album_id", albumId)
    .order("created_at", { ascending: false });

  if (lastCreatedAt) {
    query = query.lt("created_at", lastCreatedAt);
  }

  const { data: imagesData, error: imagesError } = await query.limit(PAGE_SIZE);

  if (imagesError) throw imagesError;

  return imagesData;
}

function AlbumErrorFallback({ error }: { error: Error }) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-red-500">{error.message || "Album not found"}</p>
    </div>
  );
}

function AlbumSkeleton() {
  return (
    <>
      <Skeleton className="mx-auto h-8 w-1/2" />
      <Separator />
      <div className="space-y-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </>
  );
}

function AlbumContent() {
  const { albumId } = useParams<{ albumId: UUID }>();
  const { data: album } = useSWR(albumId, fetchAlbum, { suspense: true });

  const {
    data: imagesData,
    size,
    setSize,
    isLoading,
  } = useSWRInfinite(
    (pageIndex, previousPageData) =>
      getKey(pageIndex, previousPageData, albumId),
    fetchImages,
    { suspense: true },
  );

  const images = imagesData ? imagesData.flat() : [];
  const isEmpty = imagesData?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (imagesData && imagesData[imagesData.length - 1]?.length < PAGE_SIZE);

  const { ref: loadMoreRef, inView } = useInView({ rootMargin: "100px" });

  useEffect(() => {
    if (inView && !isLoading && !isReachingEnd) {
      setSize((prev) => prev + 1);
    }
  }, [inView, isLoading, isReachingEnd, setSize]);

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
          <h3 className="max-w-[300px] truncate text-2xl font-bold">
            {album.name}
          </h3>
        </div>

        <Button
          onClick={() =>
            dialog.open("upload-image-to-album", {
              uploadImageToAlbumData: {
                albumId,
                onSuccess: () => onUploadSuccess(albumId),
              },
            })
          }
        >
          <PlusCircle />
          Upload
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        {images && images.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-shadow hover:shadow-md"
              >
                <Image
                  src={image.url}
                  alt={image.filename}
                  width={400}
                  height={600}
                  className="h-auto w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-sm">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8">
                <FileText className="mx-auto size-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No images
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  This album doesn't contain any images yet.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isReachingEnd && (
          <div ref={loadMoreRef} className="py-4 text-center">
            {isLoading && (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                <span className="text-sm text-gray-500">Loading more...</span>
              </div>
            )}
          </div>
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

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <ErrorBoundary FallbackComponent={AlbumErrorFallback}>
                {mounted ? (
                  <Suspense fallback={<AlbumSkeleton />}>
                    <AlbumContent />
                  </Suspense>
                ) : (
                  <AlbumSkeleton />
                )}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
