import { z } from "zod";

export const ReplyValidator = z.object({
  postRepliedToId: z.string(),
  content: z.any(),
  originalPostOwnerId: z.string(),
  imageUrl: z.string().optional(),
});
export type ReplyPayload = z.infer<typeof ReplyValidator>;
