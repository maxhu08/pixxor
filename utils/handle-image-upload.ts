import { createClient } from "@/lib/supabase/server";
import { AlbumMemberRole } from "@/types";
import type { UploadedFileData } from "uploadthing/types";

export async function handleImageUpload(
  file: UploadedFileData,
  userId: string,
  albumId?: string,
) {
  const supabase = await createClient();

  if (!userId) {
    return { success: false };
  }

  let targetAlbumId = albumId;

  if (!targetAlbumId) {
    const { data: album, error: albumFetchError } = await supabase
      .from("albums")
      .select("id")
      .eq("name", "Unsorted")
      .single();

    if (albumFetchError && albumFetchError.code !== "PGRST116") {
      throw albumFetchError;
    }

    targetAlbumId = album?.id;

    if (!targetAlbumId) {
      const { data: newAlbum, error: albumCreateError } = await supabase
        .from("albums")
        .insert({ name: "Unsorted" })
        .select("id")
        .single();

      if (albumCreateError || !newAlbum) {
        throw albumCreateError;
      }

      targetAlbumId = newAlbum.id;

      const { error: memberError } = await supabase
        .from("album_members")
        .insert({
          user_id: userId,
          album_id: targetAlbumId,
          role: AlbumMemberRole.OWNER,
        });

      if (memberError) {
        throw memberError;
      }
    }
  } else {
    const { data: memberEntry, error: memberFetchError } = await supabase
      .from("album_members")
      .select("role")
      .eq("album_id", targetAlbumId)
      .eq("user_id", userId)
      .single();

    if (memberFetchError || !memberEntry) {
      return { success: false, error: "User is not a member of this album." };
    }

    if (
      memberEntry.role !== AlbumMemberRole.OWNER &&
      memberEntry.role !== AlbumMemberRole.MEMBER
    ) {
      return {
        success: false,
        error: "User does not have permission to upload to this album.",
      };
    }
  }

  const { error: imageInsertError } = await supabase.from("images").insert([
    {
      user_id: userId,
      album_id: targetAlbumId,
      url: file.ufsUrl,
      filename: file.name,
    },
  ]);

  if (imageInsertError) {
    throw imageInsertError;
  }

  return { success: true };
}
