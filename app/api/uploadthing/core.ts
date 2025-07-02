import { createClient } from "@/lib/supabase/server";
import { handleImageUpload } from "@/utils/handle-image-upload";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

async function auth(req: Request) {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return null;
  }

  return { id: authData.user.id };
}

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);

      if (!user) throw new UploadThingError("Unauthorized");

      const albumId = req.headers.get("x-album-id");

      if (!albumId) {
        throw new UploadThingError("Missing album ID header");
      }

      return { userId: user.id, albumId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await handleImageUpload(file, metadata.userId, metadata.albumId);

      return {
        uploadedBy: metadata.userId,
        albumId: metadata.albumId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
