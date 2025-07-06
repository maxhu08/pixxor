"use client";

import { AlbumCard } from "@/components/albums/album-card";
import { CreateAlbumButton } from "@/components/albums/create-album-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import useSWR, { mutate } from "swr";

const PAGE_SIZE = 12;

function onAlbumCreated(userId: string) {
  mutate((key: string) => typeof key === "string" && key.startsWith(`user-albums:${userId}`));
}

async function fetchCurrentUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

async function fetchAlbums(key: string) {
  const [, userId, cursorData] = key.split(":");

  if (userId === "null") {
    return [];
  }

  const supabase = createClient();

  let query = supabase
    .from("album_members")
    .select(
      `
    album_id,
    albums:albums(
      id,
      name,
      created_at,
      images:images(
        id,
        url,
        created_at
      ),
      album_members:album_members!inner(
        user_id,
        role,
        users:users!album_members_user_id_fkey (
          id,
          name
        )
      )
    )
  `
    )
    .eq("user_id", userId)
    .order("created_at", { foreignTable: "albums", ascending: false })
    .limit(PAGE_SIZE);

  if (cursorData && cursorData !== "0") {
    try {
      const cursor = JSON.parse(cursorData);
      if (cursor.lastCreatedAt) {
        query = query.lt("albums.created_at", cursor.lastCreatedAt);
      }
    } catch {
      const page = parseInt(cursorData);
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    }
  }

  const { data: albums, error } = await query;

  if (error) {
    throw error;
  }

  return albums || [];
}

function processAlbums(albums: any[]) {
  return albums.map((membership) => {
    const album = Array.isArray(membership.albums) ? membership.albums[0] : membership.albums;

    const sortedImages = [...(album.images ?? [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const latestImage = sortedImages[0] ?? null;

    const members = (album.album_members ?? []).map((m: any) => ({
      id: m.user_id,
      name: m.users?.name ?? "Unknown",
      role: m.role
    }));

    return {
      id: album.id,
      name: album.name,
      latestImage: latestImage
        ? {
            id: latestImage.id,
            url: latestImage.url
          }
        : null,
      imageCount: album.images?.length ?? 0,
      latestImageTimestamp: latestImage?.created_at ?? null,
      members
    };
  });
}

function AlbumsErrorFallback({ error }: { error: Error }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">
          {error.message || "Error fetching albums. Please try again later."}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </main>
  );
}

function AlbumsSkeleton() {
  return (
    <main className="container mx-auto px-4 py-10 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </main>
  );
}

function AlbumsContent() {
  const { data: user } = useSWR("current-user", fetchCurrentUser, {
    suspense: true
  });

  const {
    data: albums,
    isLoading,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    loadMoreRef,
    error,
    mutate: mutateAlbums
  } = useInfiniteScroll(user ? `user-albums:${user.id}` : "user-albums:null", {
    fetcher: fetchAlbums,
    pageSize: PAGE_SIZE,
    suspense: true,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return null;
      const lastAlbum = lastPage[lastPage.length - 1];
      const album = Array.isArray(lastAlbum.albums) ? lastAlbum.albums[0] : lastAlbum.albums;
      return { lastCreatedAt: album.created_at };
    }
  });

  const [deletingAlbumId, setDeletingAlbumId] = useState<string | null>(null);

  const handleAlbumCreated = () => {
    if (user) {
      mutateAlbums();
      onAlbumCreated(user.id);
    }
  };

  const handleAlbumDeleted = (albumId: string) => {
    mutateAlbums((current: any[] = []) => {
      return current
        .map((page) =>
          Array.isArray(page)
            ? page.filter((membership) => {
                const album = Array.isArray(membership.albums)
                  ? membership.albums[0]
                  : membership.albums;
                return album && album.id !== albumId;
              })
            : page
        )
        .filter((page) => (Array.isArray(page) ? page.length > 0 : true));
    }, false);
  };

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Authentication Required</h1>
          <p className="text-muted-foreground">You must be logged in to view your albums.</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (error) {
    throw error;
  }

  const processedAlbums = processAlbums(albums);

  return (
    <main className="container mx-auto px-4 py-10 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Albums</h1>
        <CreateAlbumButton onSuccess={handleAlbumCreated} />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-semibold">No albums yet</h2>
            <p className="text-muted-foreground">
              Create your first album to start collecting and sharing memories.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {processedAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={{
                  id: album.id,
                  name: album.name,
                  latestImage: album.latestImage
                }}
                imageCount={album.imageCount}
                latestImageTimestamp={album.latestImageTimestamp}
                members={album.members}
                currentUserId={user.id}
                onDelete={() => handleAlbumDeleted(album.id)}
              />
            ))}
          </div>

          {!isReachingEnd && (
            <div ref={loadMoreRef} className="py-8 text-center">
              {isLoadingMore && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  <span className="text-sm text-gray-500">Loading more albums...</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function AlbumsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={AlbumsErrorFallback}>
      {mounted ? (
        <Suspense fallback={<AlbumsSkeleton />}>
          <AlbumsContent />
        </Suspense>
      ) : (
        <AlbumsSkeleton />
      )}
    </ErrorBoundary>
  );
}
