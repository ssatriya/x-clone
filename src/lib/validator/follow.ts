import { z } from "zod";

export const FollowValidator = z.object({
  currentUserId: z.string(),
  viewedUserId: z.string(),
});
export type FollowPayload = z.infer<typeof FollowValidator>;
