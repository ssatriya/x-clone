import { RepostType } from "@prisma/client";
import { z } from "zod";

export const RepostValidator = z.object({
  postId: z.string(),
  repostType: z.nativeEnum(RepostType),
  originalPostOwnerId: z.string(),
});
export type RepostPayload = z.infer<typeof RepostValidator>;
