import { AlbumPage } from "@/components/albums/album-page";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export async function generateMetadata({
  params
}: {
  params: Promise<{ albumId: string }>;
}): Promise<Metadata> {
  const { albumId } = await params;

  const supabase = await createClient();

  const { data: album, error } = await supabase
    .from("albums")
    .select("name")
    .eq("id", albumId)
    .single();

  if (error || !album) {
    return { title: "Album not found" };
  }

  return {
    title: album.name
  };
}

export default function Page() {
  return <AlbumPage />;
}
