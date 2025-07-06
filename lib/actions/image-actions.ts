"use server";

import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";
import { UTApi } from "uploadthing/server";

export async function addEffect(photoId: string, effect: "monotone") {
  const supabase = await createClient();
  const { data: image, error } = await supabase
    .from("images")
    .select("url, filename, user_id, album_id")
    .eq("id", photoId)
    .single();

  if (error || !image) {
    throw new Error("Photo not found");
  }

  const url = image.url;
  const res = await fetch(url);

  if (!res.ok) throw new Error("Failed to fetch image from storage");

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // apply grayscale effect with sharp
  let processedBuffer: Buffer;
  if (effect === "monotone") {
    processedBuffer = await sharp(buffer).grayscale().png().toBuffer();
  } else {
    throw new Error("Unsupported effect");
  }

  const fileName = image.filename.replace(/(\.[^.]+)?$/, "-monotone$1");
  const file = new File([processedBuffer], fileName, { type: "image/png" });

  const utapi = new UTApi();
  const uploadRes = await utapi.uploadFiles([file]);
  const uploaded = uploadRes[0];
  const uploadedUrl = uploaded?.data?.url;
  if (!uploadedUrl) {
    throw new Error("Failed to upload processed image");
  }

  const { error: insertError } = await supabase.from("images").insert({
    album_id: image.album_id,
    user_id: image.user_id,
    filename: fileName,
    url: uploadedUrl
  });
  if (insertError) {
    throw new Error("Failed to save processed image");
  }

  return { success: true, url: uploadedUrl };
}

export async function deletePhoto(photoId: string) {
  const supabase = await createClient();

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
