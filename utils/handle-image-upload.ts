import type { UUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { AlbumMemberRole } from "@/types";
import type { UploadedFileData } from "uploadthing/types";

export async function insertImage(file: UploadedFileData, userId: UUID) {
  const supabase = await createClient();

  const { data: insertedImage, error: imageInsertError } = await supabase
    .from("images")
    .insert([
      {
        user_id: userId,
        url: file.ufsUrl,
        filename: file.name
      }
    ])
    .select("id")
    .single();

  if (imageInsertError) {
    throw imageInsertError;
  }

  return insertedImage;
}

export async function canUploadToAlbum(userId: UUID, albumId: UUID): Promise<boolean> {
  const supabase = await createClient();

  const { data: memberEntry, error: memberFetchError } = await supabase
    .from("album_members")
    .select("role")
    .eq("album_id", albumId)
    .eq("user_id", userId)
    .single();

  return (
    !memberFetchError &&
    memberEntry &&
    (memberEntry.role === AlbumMemberRole.OWNER || memberEntry.role === AlbumMemberRole.MEMBER)
  );
}

export async function addImageToAlbum(imageId: UUID, albumId: UUID, userId: UUID) {
  const supabase = await createClient();

  if (!(await canUploadToAlbum(userId, albumId))) {
    return { success: false, error: "User does not have permission to upload to this album." };
  }

  const { error: albumImageInsertError } = await supabase
    .from("album_images")
    .insert({ album_id: albumId, image_id: imageId, user_id: userId });

  if (albumImageInsertError) {
    throw albumImageInsertError;
  }
}

export async function uploadImageToAlbum(userId: UUID, file: UploadedFileData, albumId: UUID) {
  const supabase = await createClient();

  if (!(await canUploadToAlbum(userId, albumId))) {
    return { success: false, error: "User does not have permission to upload to this album." };
  }

  const imageId = await insertImage(file, userId);

  await addImageToAlbum(imageId.id, albumId, userId);

  return { success: true };
}
