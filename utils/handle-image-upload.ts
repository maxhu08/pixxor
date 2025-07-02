import { createClient } from "@/lib/supabase/server";
import type { UploadedFileData } from "uploadthing/types";

export async function handleImageUpload(
  file: UploadedFileData,
  userId: string,
) {
  const supabase = await createClient();

  if (!userId) {
    return { success: false };
  }

  let albumId: string | undefined;

  const { data: album, error: albumFetchError } = await supabase
    .from("albums")
    .select("id")
    .eq("name", "Unsorted")
    .single();

  if (albumFetchError && albumFetchError.code !== "PGRST116") {
    throw albumFetchError;
  }

  albumId = album?.id;

  if (!albumId) {
    const { data: newAlbum, error: albumCreateError } = await supabase
      .from("albums")
      .insert({ name: "Unsorted" })
      .select("id")
      .single();

    if (albumCreateError || !newAlbum) {
      throw albumCreateError;
    }

    albumId = newAlbum.id;

    const { error: memberError } = await supabase
      .from("album_members")
      .insert({ user_id: userId, album_id: albumId });

    if (memberError) {
      throw memberError;
    }
  }

  const { error: imageInsertError } = await supabase
    .from("images")
    .insert([
      {
        user_id: userId,
        album_id: albumId,
        url: file.ufsUrl,
        filename: file.name,
      },
    ]);

  if (imageInsertError) {
    throw imageInsertError;
  }

  return { success: true };
}
