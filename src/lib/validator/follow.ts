import { z } from "zod";

export const FollowValidator = z.object({
  userToFollowId: z.string(),
});
export type FollowPayload = z.infer<typeof FollowValidator>;
