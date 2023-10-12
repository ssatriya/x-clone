import { RepostType } from "@prisma/client";
import { z } from "zod";

export const QuoteValidator = z.object({
  postId: z.string(),
  repostType: z.nativeEnum(RepostType),
  originalPostOwnerId: z.string(),
  content: z.any(),
  imageUrl: z.string(),
});
export type QuotePayload = z.infer<typeof QuoteValidator>;
