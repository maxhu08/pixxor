"use server";

import { createClient } from "@/lib/supabase/server";
import { createAlbumSchema } from "@/lib/validators/albums";
import { AlbumMemberRole } from "@/types";

export async function createAlbum(input: { name: string; userNames: string[] }) {
  const parsed = createAlbumSchema.parse({ name: input.name, userIds: [] });
  const { name, userNames } = { name: input.name, userNames: input.userNames };

  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthenticated");
  }

  // Fetch user IDs for the given userNames
  let memberEntries: any[] = [];
  if (userNames && userNames.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name")
      .in("name", userNames);
    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }
    if (!users || users.length !== userNames.length) {
      throw new Error("One or more invited users do not exist.");
    }
    memberEntries = users.map((u) => ({
      user_id: u.id,
      album_id: undefined, // will set after album is created
      role: AlbumMemberRole.MEMBER
    }));
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
    role: AlbumMemberRole.OWNER
  };

  memberEntries = memberEntries.map((entry) => ({ ...entry, album_id: albumId }));
  const allMembers = [ownerEntry, ...memberEntries];

  const { error: memberError } = await supabase.from("album_members").insert(allMembers);

  if (memberError) {
    throw new Error(`Error adding members: ${memberError.message}`);
  }

  return albumId;
}

export async function inviteMembersToAlbum(albumId: string, userNames: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthenticated");
  }

  const { data: ownerEntry, error: ownerError } = await supabase
    .from("album_members")
    .select("role")
    .eq("album_id", albumId)
    .eq("user_id", user.id)
    .single();

  if (ownerError || !ownerEntry || ownerEntry.role !== AlbumMemberRole.OWNER) {
    throw new Error("Only the album owner can invite members.");
  }

  // Fetch user IDs for the given userNames
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name")
    .in("name", userNames);
  if (usersError) {
    throw new Error(`Error fetching users: ${usersError.message}`);
  }
  if (!users || users.length !== userNames.length) {
    throw new Error("One or more invited users do not exist.");
  }

  const { data: existingMembers, error: existingError } = await supabase
    .from("album_members")
    .select("user_id")
    .eq("album_id", albumId);

  if (existingError) {
    throw new Error(`Failed to fetch current members: ${existingError.message}`);
  }

  const existingUserIds = new Set(existingMembers.map((m) => m.user_id));
  const newMembers = users
    .filter((u) => !existingUserIds.has(u.id))
    .map((u) => ({
      user_id: u.id,
      album_id: albumId,
      role: AlbumMemberRole.MEMBER
    }));

  if (newMembers.length === 0) {
    return { success: true, message: "No new users to invite" };
  }

  const { error: insertError } = await supabase.from("album_members").insert(newMembers);

  if (insertError) {
    throw new Error(`Failed to invite members: ${insertError.message}`);
  }

  return { success: true };
}

export async function removeAlbumMember(albumId: string, userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthenticated");
  }

  const { data: ownerEntry, error: ownerError } = await supabase
    .from("album_members")
    .select("role")
    .eq("album_id", albumId)
    .eq("user_id", user.id)
    .single();

  if (ownerError || !ownerEntry || ownerEntry.role !== AlbumMemberRole.OWNER) {
    throw new Error("Only the album owner can remove members.");
  }

  const { data: targetEntry, error: targetError } = await supabase
    .from("album_members")
    .select("role")
    .eq("album_id", albumId)
    .eq("user_id", userId)
    .single();

  if (targetError || !targetEntry) {
    throw new Error("Could not find the target member.");
  }

  if (targetEntry.role === AlbumMemberRole.OWNER) {
    throw new Error("Cannot remove the album owner.");
  }

  const { error: removeError } = await supabase
    .from("album_members")
    .delete()
    .eq("album_id", albumId)
    .eq("user_id", userId);

  if (removeError) {
    throw new Error(`Error removing member: ${removeError.message}`);
  }

  return { success: true };
}

export async function changeAlbumMemberRole(
  albumId: string,
  userId: string,
  newRole: AlbumMemberRole
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthenticated");
  }

  const { data: ownerEntry, error: ownerError } = await supabase
    .from("album_members")
    .select("role")
    .eq("album_id", albumId)
    .eq("user_id", user.id)
    .single();

  if (ownerError || !ownerEntry || ownerEntry.role !== AlbumMemberRole.OWNER) {
    throw new Error("Only the album owner can change member roles.");
  }

  if (userId === user.id) {
    throw new Error("Owner cannot change their own role.");
  }

  if (newRole === AlbumMemberRole.OWNER) {
    throw new Error("Cannot assign OWNER role to another user.");
  }

  const { data: targetEntry, error: targetError } = await supabase
    .from("album_members")
    .select("role")
    .eq("album_id", albumId)
    .eq("user_id", userId)
    .single();

  if (targetError || !targetEntry) {
    throw new Error("Could not find the target member.");
  }

  const { error: updateError } = await supabase
    .from("album_members")
    .update({ role: newRole })
    .eq("album_id", albumId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(`Error changing member role: ${updateError.message}`);
  }

  return { success: true };
}

export async function deleteAlbum(albumId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthenticated");
  }

  const { data: ownerEntry, error: ownerError } = await supabase
    .from("album_members")
    .select("role")
    .eq("album_id", albumId)
    .eq("user_id", user.id)
    .single();

  if (ownerError || !ownerEntry || ownerEntry.role !== AlbumMemberRole.OWNER) {
    throw new Error("Only the album owner can delete the album.");
  }

  const { error: deleteError } = await supabase.from("albums").delete().eq("id", albumId);

  if (deleteError) {
    throw new Error(`Error deleting album: ${deleteError.message}`);
  }

  return { success: true };
}
