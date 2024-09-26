import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth/validate-request";
import { sleep } from "@/lib/utils";
import { postTable } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const postId = req.nextUrl.searchParams.get("postId");

    if (!postId) {
      return new Response("invalid search params", { status: 400 });
    }

    const descendants = await db.execute(sql`
WITH RECURSIVE
  descendants AS (
    -- Base case: Select the immediate replies to the root post
    SELECT
      post.id AS "postId",
      post.content,
      post.parent_post_id,
      post.root_post_id,
      post.created_at,
      post.post_type,
      "user".id AS "userId",
      "user".username,
      "user".name,
      "user".photo,
      post.parent_post_id AS original_parent_id,
      post.user_id AS author_id,
      1 AS depth,
      post.created_at AS thread_start_time,
      false AS is_alternating,
      ARRAY[post.user_id] AS participants, -- Track participants (array)
      post.root_post_id AS thread_root_post_id -- Store the root_post_id of the thread
    FROM
      post
      JOIN "user" ON post.user_id = "user".id
    WHERE
      post.parent_post_id = ${postId}
    UNION ALL
    -- Recursive case: Traverse down the reply chain
    SELECT
      post.id AS "postId",
      post.content,
      post.parent_post_id,
      post.root_post_id,
      post.created_at,
      post.post_type,
      "user".id AS "userId",
      "user".username,
      "user".name,
      "user".photo,
      descendants.original_parent_id,
      post.user_id AS author_id,
      descendants.depth + 1 AS depth,
      descendants.thread_start_time,
      CASE
        WHEN array_length(descendants.participants, 1) = 2
        AND NOT post.user_id = ANY (descendants.participants) THEN true
        ELSE descendants.is_alternating
      END AS is_alternating,
      CASE
        WHEN array_length(descendants.participants, 1) < 2 THEN array_append(descendants.participants, post.user_id)
        ELSE descendants.participants
      END AS participants,
      descendants.thread_root_post_id -- Propagate the thread_root_post_id
    FROM
      post
      JOIN "user" ON post.user_id = "user".id
      JOIN descendants ON post.parent_post_id = descendants."postId"
    WHERE
      (
        post.user_id = ANY (descendants.participants)
        OR
        (array_length(descendants.participants, 1) < 2)
      )
      AND descendants.is_alternating = false
  )
SELECT
  descendants.post_type AS "postType",
  descendants."postId",
  descendants.content,
  descendants.parent_post_id AS "parentPostId",
  descendants.root_post_id AS "rootPostId",
  descendants.created_at AS "createdAt",
  descendants.username,
  descendants."userId",
  descendants.name,
  descendants.photo,
  descendants.depth,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM descendants d2
      WHERE d2.parent_post_id = descendants."postId"
    ) THEN true
    ELSE false
  END AS "showLine",
  COUNT(DISTINCT reply.id) AS "replyCount",
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId', repost.user_origin_id,
      'repostTargetId', repost.repost_target_id
    )
  ) FILTER (WHERE repost.repost_target_id IS NOT NULL) AS repost,
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId', "like".user_origin_id,
      'likeTargetId', "like".like_target_id
    )
  ) FILTER (WHERE "like".like_target_id IS NOT NULL) AS like,
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId', quote.user_origin_id,
      'quoteTargetId', quote.quote_target_id
    )
  ) FILTER (WHERE quote.quote_target_id IS NOT NULL) AS quote,
   COALESCE(
    json_agg(
      json_build_object(
        'id', media.id,
        'url', media.url,
        'key', media.key,
        'size', media.size,
        'format', media.format,
        'width', media.width,
        'height', media.height
      )
    ) FILTER (WHERE media.id IS NOT NULL),
    '[]'
  ) AS media
FROM
  descendants
  LEFT JOIN reply ON descendants."postId" = reply.reply_target_id
  LEFT JOIN repost ON descendants."postId" = repost.repost_target_id
  LEFT JOIN "like" ON descendants."postId" = "like".like_target_id
  LEFT JOIN quote ON descendants."postId" = quote.quote_target_id
  LEFT JOIN media ON descendants."postId" = media.post_id
WHERE
  descendants.original_parent_id = ${postId}
  AND descendants.root_post_id = descendants.thread_root_post_id -- Ensure the root_post_id matches the thread's root
GROUP BY
  descendants."postId",
  descendants.content,
  descendants.parent_post_id,
  descendants.root_post_id,
  descendants.created_at,
  descendants.post_type,
  descendants.username,
  descendants.name,
  descendants."userId",
  descendants.photo,
  descendants.depth,
  descendants.thread_start_time
ORDER BY
  descendants.thread_start_time,
  descendants.created_at;  
    `);

    return Response.json({ descendants });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
