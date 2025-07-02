"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

async function fetchAlbum(albumId: string) {
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
  const lastItem = previousPageData[previousPageData.length - 1];
  return { lastCreatedAt: lastItem.created_at, albumId };
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
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (lastCreatedAt) {
    query = query.lt("created_at", lastCreatedAt);
  }

  const { data: imagesData, error: imagesError } = await query;

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
  const { albumId } = useParams<{ albumId: string }>();

  const { data: album, mutate } = useSWR(albumId, fetchAlbum, {
    suspense: true,
  });

  const {
    data: imagesData,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPageData) =>
      getKey(pageIndex, previousPageData, albumId),
    fetchImages,
    {
      suspense: true,
      parallel: true,
    },
  );

  const images = imagesData ? imagesData.flat() : [];

  return (
    <>
      <div className="grid w-full">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-5 items-center gap-4">
            <Button variant="outline" asChild>
              <Link href={`/gallery`} className="flex items-center gap-2">
                <ArrowLeft className="size-4" /> Back to Gallery
              </Link>
            </Button>
            <Separator orientation="vertical" />
            <h3 className="w-full truncate overflow-hidden text-2xl font-bold whitespace-nowrap">
              {album.name}
            </h3>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        <div className="space-y-4">
          {images && images.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-shadow duration-200 hover:shadow-md"
                >
                  <Image
                    src={image.url}
                    alt={image.filename}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
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
        </div>
        <Button
          onClick={() => setSize(size + 1)}
          disabled={isLoading || isValidating}
        >
          Load more
        </Button>

        <Separator className="my-6" />
      </div>
    </>
  );
}

export default function AlbumPage() {
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
