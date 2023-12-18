import { z } from "zod";

export const EditProfileValidator = z.object({
  backgroundPhoto: z.string().optional(),
  avatar: z.string().optional(),
  name: z.string().optional(),
  bio: z.string().optional(),
});
export type EditProfilePayload = z.infer<typeof EditProfileValidator>;
