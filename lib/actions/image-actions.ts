"use server";

import { createClient } from "@/lib/supabase/server";
import { ImageEffect } from "@/types";
import sharp from "sharp";
import { UTApi } from "uploadthing/server";

export type EffectsInput = Partial<Record<ImageEffect, boolean>>;

export async function addEffect(photoId: string, effects: EffectsInput) {
  const supabase = await createClient();

  const { data: image, error } = await supabase
    .from("images")
    .select("url, filename, user_id")
    .eq("id", photoId)
    .single();

  if (error || !image) {
    throw new Error("Photo not found");
  }

  const { data: albumImage, error: albumImageError } = await supabase
    .from("album_image")
    .select("album_id")
    .eq("image_id", photoId)
    .single();
  if (albumImageError || !albumImage) {
    throw new Error("Album for photo not found");
  }
  const albumId = albumImage.album_id;

  const url = image.url;
  const res = await fetch(url);

  if (!res.ok) throw new Error("Failed to fetch image from storage");

  const arrayBuffer = await res.arrayBuffer();
  let processed = Buffer.from(arrayBuffer as ArrayBuffer);
  let sharpInstance = sharp(processed);

  if (effects["monotone"]) {
    sharpInstance = sharpInstance.grayscale();
  }
  if (effects["inverted"]) {
    sharpInstance = sharpInstance.negate();
  }
  if (effects["horizontal-flip"]) {
    sharpInstance = sharpInstance.flip();
  }
  if (effects["vertical-flip"]) {
    sharpInstance = sharpInstance.flop();
  }

  processed = Buffer.from(await sharpInstance.png().toBuffer());

  const suffix =
    Object.entries(effects)
      .filter(([_, v]) => v)
      .map(([k]) => k.replace(/-/g, ""))
      .join("-") || "effect";
  const fileName = image.filename.replace(/(\.[^.]+)?$/, `-${suffix}$1`);
  const file = new File([processed], fileName, { type: "image/png" });

  const utapi = new UTApi();
  const uploadRes = await utapi.uploadFiles([file]);
  const uploaded = uploadRes[0];
  const uploadedUrl = uploaded?.data?.url;
  if (!uploadedUrl) {
    throw new Error("Failed to upload processed image");
  }

  const { data: insertedImage, error: insertError } = await supabase
    .from("images")
    .insert({
      user_id: image.user_id,
      filename: fileName,
      url: uploadedUrl
    })
    .select("id")
    .single();
  if (insertError || !insertedImage) {
    throw new Error("Failed to save processed image");
  }

  const { error: albumImageInsertError } = await supabase.from("album_image").insert({
    album_id: albumId,
    image_id: insertedImage.id,
    user_id: image.user_id
  });
  if (albumImageInsertError) {
    throw new Error("Failed to link processed image to album");
  }

  return { success: true, url: uploadedUrl };
}

export async function deletePhoto(photoId: string) {
  const supabase = await createClient();

  const { error: albumImageError } = await supabase
    .from("album_image")
    .delete()
    .eq("image_id", photoId);
  if (albumImageError) {
    throw new Error("Failed to remove photo from album");
  }

  const { data: image, error } = await supabase
    .from("images")
    .select("id, url")
    .eq("id", photoId)
    .single();
  if (error || !image) {
    throw new Error("Photo not found");
  }

  const utapi = new UTApi();
  const key = image.url.split("/f/")[1];
  if (key) {
    await utapi.deleteFiles([key]);
  }
  const { error: dbError } = await supabase.from("images").delete().eq("id", photoId);
  if (dbError) {
    throw new Error("Failed to delete photo from database");
  }
  return { success: true };
}
