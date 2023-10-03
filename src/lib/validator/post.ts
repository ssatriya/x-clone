import { z } from "zod";

export const PostValidator = z.object({
  content: z
    .string()
    .min(1)
    .max(280, { message: "Post can't be more than 280 characters." }),
  imageUrl: z.string().optional(),
});
export type PostPayload = z.infer<typeof PostValidator>;
