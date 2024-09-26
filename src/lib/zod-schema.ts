import { z } from "zod";

export const CreatePostSchema = z.object({
  content: z.string().optional(),
  postType: z.enum(["post", "repost", "reply", "quote"]),
  mediaId: z.string().array().optional(),
});
export type CreatePostPayload = z.infer<typeof CreatePostSchema>;

export const CreateReplySchema = z.object({
  content: z.string().optional(),
  postType: z.enum(["post", "repost", "reply", "quote"]),
  rootPostId: z.string(),
  parentPostId: z.string(),
  mediaId: z.string().array().optional(),
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
  postType: z.enum(["post", "repost", "reply", "quote"]),
  mediaId: z.string().array().optional(),
});
export type CreateQuotePayload = z.infer<typeof CreateQuoteSchema>;

export const CreateLikeSchema = z.object({
  likeTargetId: z.string(),
  userId: z.string(),
});
export type CreateLikePayload = z.infer<typeof CreateLikeSchema>;

export const CreateMediaSchema = z.object({
  postId: z.string().optional(),
  url: z.string(),
  key: z.string(),
  size: z.number(),
  format: z.string(),
  width: z.number(),
  height: z.number(),
});
export type CreateMediaSchema = z.infer<typeof CreateMediaSchema>;
