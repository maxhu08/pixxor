"use server";

import { createClient } from "@/lib/supabase/server";
import { createAlbumSchema } from "@/lib/validators/albums";
import { AlbumMemberRole } from "@/types";

export async function createAlbum(input: unknown) {
  const parsed = createAlbumSchema.parse(input);
  const { name, userIds } = parsed;

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthenticated");
  }

  const { data: album, error: albumError } = await supabase
    .from("albums")
    .insert({ name })
    .select("id")
    .single();

  if (albumError) {
    throw new Error(`Error creating album: ${albumError.message}`);
  }

  const albumId = album.id;

  const ownerEntry = {
    user_id: user.id,
    album_id: albumId,
    role: AlbumMemberRole.OWNER,
  };

  const memberEntries = userIds.map((userId) => ({
    user_id: userId,
    album_id: albumId,
    role: AlbumMemberRole.MEMBER,
  }));

  const allMembers = [ownerEntry, ...memberEntries];

  const { error: memberError } = await supabase
    .from("album_members")
    .insert(allMembers);

  if (memberError) {
    throw new Error(`Error adding members: ${memberError.message}`);
  }

  return albumId;
}
