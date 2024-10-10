import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import db from "@/lib/db";
import { followerTable } from "@/lib/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const pageSize = 10;
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);

    const followedUser = await db
      .select({ followerId: followerTable.followerId })
      .from(followerTable)
      .where(eq(followerTable.followingId, loggedInUser.id));

    const followerArray = followedUser.flatMap((userId) => userId.followerId);
    const followerArrayForSQL = [...followerArray, loggedInUser.id]
      .map((id) => `'${id}'`)
      .join(",");

    const followedPosts = await db.execute(sql`
WITH RECURSIVE post_hierarchy AS (
  -- Base case: Root posts
  SELECT
    post.id AS "postId",
    post.content AS "postContent",
    post.parent_post_id AS "parentPostId",
    post.root_post_id AS "rootPostId",
    post.created_at AT TIME ZONE 'UTC' AS "createdAt",
    post.post_type AS "postType",
    "user".id AS "userId",
    "user".username,
    "user".name,
    "user".photo,
    post.user_id AS "authorId",
    post.created_at AS thread_start_time,
    1 AS depth,
    ogPost.id AS "originalPostId",
    ogPost.content AS "originalPostContent",
    ogPost.created_at AS "originalPostCreatedAt",
    ogUser.id AS "originalUserId",
    ogUser.username AS "originalUsername",
    ogUser.name AS "originalName",
    ogUser.photo AS "originalPhoto",
    ogPost.root_post_id AS "originalRootPostId",
    CASE
      WHEN post.post_type IN ('quote', 'post', 'reply') 
      AND EXISTS (
        SELECT 1
        FROM post childPost
        WHERE childPost.parent_post_id = post.id
      ) THEN true
      ELSE false
    END AS "showLine"
  FROM
    post
  JOIN "user" ON post.user_id = "user".id
  LEFT JOIN post AS ogPost ON post.original_post_id = ogPost.id
  LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
  WHERE post.user_id IN (${sql.raw(followerArrayForSQL)})
  AND post.parent_post_id IS NULL
  
  UNION ALL
  
  -- Recursive case: Fetch replies
  SELECT
    post.id AS "postId",
    post.content AS "postContent",
    post.parent_post_id AS "parentPostId",
    post.root_post_id AS "rootPostId",
    post.created_at AS "createdAt",
    post.post_type AS "postType",
    "user".id AS "userId",
    "user".username,
    "user".name,
    "user".photo,
    post.user_id AS "authorId",
    post_hierarchy.thread_start_time,
    post_hierarchy.depth + 1 AS depth,
    ogPost.id AS "originalPostId",
    ogPost.content AS "originalPostContent",
    ogPost.created_at AS "originalPostCreatedAt",
    ogUser.id AS "originalUserId",
    ogUser.username AS "originalUsername",
    ogUser.name AS "originalName",
    ogUser.photo AS "originalPhoto",
    ogPost.root_post_id AS "originalRootPostId",
    CASE
        WHEN post.post_type IN ('quote', 'post', 'reply') 
        AND EXISTS (
          SELECT 1
          FROM post childPost
          WHERE childPost.parent_post_id = post.id
        ) 
        AND (
          -- Check if the user who replied (childPost.user_id) is in the follower list
          EXISTS (
            SELECT 1
            FROM post childPost
            WHERE childPost.parent_post_id = post.id
            AND childPost.user_id IN (${sql.raw(followerArrayForSQL)})
          )
        )
        THEN true
        ELSE false
    END AS "showLine"
  FROM
    post
  JOIN "user" ON post.user_id = "user".id
  JOIN post_hierarchy ON post.parent_post_id = post_hierarchy."postId"
  LEFT JOIN post AS ogPost ON post.original_post_id = ogPost.id
  LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
  WHERE post.user_id IN (${sql.raw(followerArrayForSQL)})
)
-- Perform all the final aggregation in the main SELECT statement
SELECT
  ph."postId",
  ph."postContent",
  ph."userId",
  ph."showLine",
  ph."parentPostId",
  ph."rootPostId",
  ph."createdAt",
  ph."postType",
  ph.username,
  ph.name,
  ph.photo,
  ph.depth,
  ph.thread_start_time,
  ph."originalPostId",
  ph."originalPostContent",
  ph."originalPostCreatedAt",
  ph."originalUserId",
  ph."originalUsername",
  ph."originalName",
  ph."originalPhoto",
  ph."originalRootPostId",

  -- Aggregated reposts for this post
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId', repost.user_origin_id,
      'repostTargetId', repost.repost_target_id
    )
  ) FILTER (WHERE repost.repost_target_id = ph."postId") AS repost,

  -- Aggregated quotes for this post
  json_agg(
    jsonb_build_object(
      'userOriginId', quote.user_origin_id,
      'quoteTargetId', quote.quote_target_id
    )
  ) FILTER (WHERE quote.quote_target_id = ph."postId") AS quote,

  -- Aggregated likes for this post
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId', "like".user_origin_id,
      'likeTargetId', "like".like_target_id
    )
  ) FILTER (WHERE "like".like_target_id = ph."postId") AS "like",

  -- Aggregated reposts for the original post
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId', ogRepost.user_origin_id,
      'repostTargetId', ogRepost.repost_target_id
    )
  ) FILTER (WHERE ogRepost.repost_target_id = ph."originalPostId") AS "originalRepost",

  -- Aggregated quotes for the original post
  json_agg(
    jsonb_build_object(
      'userOriginId', ogQuote.user_origin_id,
      'quoteTargetId', ogQuote.quote_target_id
    )
  ) FILTER (WHERE ogQuote.quote_target_id = ph."originalPostId") AS "originalQuote",

  -- Aggregated likes for the original post
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId', ogLike.user_origin_id,
      'likeTargetId', ogLike.like_target_id
    )
  ) FILTER (WHERE ogLike.like_target_id = ph."originalPostId") AS "originalLike",

  -- Counts of replies for this post
  COUNT(DISTINCT reply.id) AS "replyCount",

  -- Counts of replies for the original post
  COUNT(DISTINCT ogReply.id) AS "originalReplyCount",

  -- Aggregated media for this post
  COALESCE(
    (
      SELECT json_agg(media)
      FROM (
        SELECT 
          media.id,
          media.url,
          media.size,
          media.format,
          media.width,
          media.height
        FROM media
        WHERE media.post_id = ph."postId"
        ORDER BY media.created_at ASC  -- Order by created_at
      ) as media
    ),
    '[]'
  ) AS media,

  -- Aggregated media for the original post
  COALESCE(
    (
      SELECT json_agg(originalMedia)
      FROM (
        SELECT 
          ogMedia.id,
          ogMedia.url,
          ogMedia.size,
          ogMedia.format,
          ogMedia.width,
          ogMedia.height
        FROM media ogMedia
        WHERE ogMedia.post_id = ph."originalPostId"
        ORDER BY ogMedia.created_at ASC  -- Order by created_at
      ) as originalMedia
    ),
    '[]'
  ) AS "originalMedia"
FROM 
  post_hierarchy ph
LEFT JOIN repost ON repost.repost_target_id = ph."postId"
LEFT JOIN quote ON quote.quote_target_id = ph."postId"
LEFT JOIN "like" ON "like".like_target_id = ph."postId"
LEFT JOIN repost ogRepost ON ogRepost.repost_target_id = ph."originalPostId"
LEFT JOIN quote ogQuote ON ogQuote.quote_target_id = ph."originalPostId"
LEFT JOIN "like" ogLike ON ogLike.like_target_id = ph."originalPostId"
LEFT JOIN post reply ON reply.parent_post_id = ph."postId"
LEFT JOIN post ogReply ON ogReply.parent_post_id = ph."originalPostId"
LEFT JOIN media ON media.post_id = ph."postId"
LEFT JOIN media ogMedia ON ogMedia.post_id = ph."originalPostId"
GROUP BY 
  ph."postId",
  ph."postContent",
  ph."parentPostId",
  ph."rootPostId",
  ph."createdAt",
  ph."postType",
  ph."userId",
  ph.username,
  ph.name,
  ph.photo,
  ph.depth,
  ph.thread_start_time,
  ph."showLine",
  ph."originalPostId",
  ph."originalPostContent",
  ph."originalPostCreatedAt",
  ph."originalUserId",
  ph."originalUsername",
  ph."originalName",
  ph."originalPhoto",
  ph."originalRootPostId"
ORDER BY 
  ph.thread_start_time DESC, 
  ph."createdAt"
LIMIT ${pageSize} OFFSET ${offset};
    `);

    const nextOffset =
      followedPosts.length === pageSize ? offset + pageSize : null;

    return Response.json({ followedPosts, nextOffset });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
