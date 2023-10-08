import { z } from "zod";

export const PostValidator = z.object({
  content: z.string().optional(),
  imageUrl: z.string().optional(),
});
export type PostPayload = z.infer<typeof PostValidator>;
