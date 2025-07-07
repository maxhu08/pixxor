import { z } from "zod";

export const createAlbumSchema = z.object({
  name: z.string().min(1, "Album name is required"),
  userIds: z.array(z.string().uuid())
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
