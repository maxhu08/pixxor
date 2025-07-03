import { AlbumCard } from "@/components/albums/album-card";
import { CreateAlbumButton } from "@/components/albums/create-album-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AlbumsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Authentication Required
          </h1>
          <p className="text-muted-foreground">
            You must be logged in to view your albums.
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  const { data: albums, error } = await supabase
    .from("album_members")
    .select(
      `
      album_id,
      albums:albums(
        id,
        name,
        created_at,
        images(
          id,
          url,
          created_at
        ),
        album_members:album_members!inner(
          user_id,
          users:users!album_members_user_id_fkey (
            id,
            name,
            avatar_url
          )
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { foreignTable: "albums", ascending: false });

  if (error) {
    console.error("Failed to fetch albums", error);
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            Error fetching albums. Please try again later.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </main>
    );
  }

  const processedAlbums = albums.map((membership) => {
    const album = Array.isArray(membership.albums)
      ? membership.albums[0]
      : membership.albums;

    const sortedImages = [...(album.images ?? [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const latestImage = sortedImages[0] ?? null;

    const members = (album.album_members ?? []).map((m: any) => ({
      id: m.user_id,
      name: m.users?.name ?? "Unknown",
      avatar_url: m.users?.avatar_url ?? null,
      role: m.role,
    }));

    return {
      id: album.id,
      name: album.name,
      latestImage: latestImage
        ? {
            id: latestImage.id,
            url: latestImage.url,
          }
        : null,
      imageCount: album.images?.length ?? 0,
      latestImageTimestamp: latestImage?.created_at ?? null,
      members,
    };
  });

  return (
    <main className="container mx-auto px-4 py-10 md:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Albums</h1>
        <CreateAlbumButton />
      </div>
      {processedAlbums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-semibold">No albums yet</h2>
            <p className="text-muted-foreground">
              Create your first album to start collecting and sharing memories.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {processedAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={{
                id: album.id,
                name: album.name,
                latestImage: album.latestImage,
              }}
              imageCount={album.imageCount}
              latestImageTimestamp={album.latestImageTimestamp}
              members={album.members}
            />
          ))}
        </div>
      )}
    </main>
  );
}
