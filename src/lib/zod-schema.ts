import { z } from "zod";

export const CreatePostSchema = z.object({
  content: z.string().optional(),
  postType: z.enum(["post", "repost", "reply", "quote"]),
  media: z.string().optional(),
});
export type CreatePostPayload = z.infer<typeof CreatePostSchema>;

export const CreateReplySchema = z.object({
  content: z.string().optional(),
  media: z.string().optional(),
  postType: z.enum(["post", "repost", "reply", "quote"]),
  rootPostId: z.string(),
  parentPostId: z.string(),
});
export type CreateReplyPayload = z.infer<typeof CreateReplySchema>;

export const CreateRepostSchema = z.object({
  repostTargetId: z.string(),
  postType: z.enum(["post", "repost", "reply", "quote"]),
});
export type CreateRepostPayload = z.infer<typeof CreateRepostSchema>;

export const CreateQuoteSchema = z.object({
  quoteTargetId: z.string(),
  content: z.string(),
  media: z.string().optional(),
  postType: z.enum(["post", "repost", "reply", "quote"]),
});
export type CreateQuotePayload = z.infer<typeof CreateQuoteSchema>;

export const CreateLikeSchema = z.object({
  likeTargetId: z.string(),
  userId: z.string(),
});
export type CreateLikePayload = z.infer<typeof CreateLikeSchema>;
