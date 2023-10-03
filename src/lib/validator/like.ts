import { z } from "zod";

export const LikeValidator = z.object({
  postId: z.string(),
});
export type LikePayload = z.infer<typeof LikeValidator>;
