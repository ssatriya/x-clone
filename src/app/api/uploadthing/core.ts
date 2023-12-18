import getCurrentSession from "@/lib/getCurrentSession";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileCount: 4, maxFileSize: "4MB" } })
    .middleware(async (req) => {
      const session = await getCurrentSession();

      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {}),
  userPhoto: f({ blob: { maxFileCount: 1, maxFileSize: "8MB" } })
    .middleware(async (req) => {
      const session = await getCurrentSession();

      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
