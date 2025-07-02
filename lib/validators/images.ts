import { z } from "zod";

export const uploadImageToAlbumSchema = z.object({
  albumId: z.string().min(1, "Album ID is required"),
});
