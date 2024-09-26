import { NextRequest } from "next/server";

import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { sql } from "drizzle-orm";
import { sleep } from "@/lib/utils";

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

    const ancestors = await db.execute(sql`
WITH RECURSIVE
  ancestors AS (
    SELECT
      t.id AS "postId",
      t.content,
      t.post_type,
      t.parent_post_id,
      t.root_post_id,
      t.original_post_id,
      t.created_at,
      u.id AS "userId",
      u.name,
      u.username,
      u.photo,
      CASE
        WHEN t.parent_post_id IS NULL THEN true
        ELSE true
      END AS "showLine"
    FROM
      post t
      JOIN "user" u ON t.user_id = u.id
    WHERE
      t.id = (
        SELECT
          parent_post_id
        FROM
          post
        WHERE
          id = ${postId}
      )
    UNION ALL
    SELECT
      t.id AS "postId",
      t.content,
      t.post_type,
      t.parent_post_id,
      t.root_post_id,
      t.original_post_id,
      t.created_at,
      u.id AS "userId",
      u.name,
      u.username,
      u.photo,
      true AS "showLine"
    FROM
      post t
      JOIN "user" u ON t.user_id = u.id
      JOIN ancestors a ON t.id = a.parent_post_id
  )
SELECT
  ancestors.post_type AS "postType",
  ancestors."postId",
  ancestors.content,
  ancestors.parent_post_id AS "parentPostId",
  ancestors.root_post_id AS "rootPostId",
  ancestors.original_post_id AS "originalPostId",
  ancestors.created_at AS "createdAt",
  ancestors."userId",
  ancestors.name,
  ancestors.username,
  ancestors.photo,
  ancestors."showLine",
  ogPost.content AS "originalPostContent",
  ogPost.created_at AS "originalPostCreatedAt",
  ogUser.id AS "originalUserId",
  ogUser.username AS "originalUsername",
  ogUser.name AS "originalName",
  ogUser.photo AS "originalPhoto",
  COUNT(DISTINCT reply.id) AS "replyCount",
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId',
      repost.user_origin_id,
      'repostTargetId',
      repost.repost_target_id
    )
  ) FILTER (
    WHERE
      repost.repost_target_id IS NOT NULL
  ) AS repost,
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId',
      "like".user_origin_id,
      'likeTargetId',
      "like".like_target_id
    )
  ) FILTER (
    WHERE
      "like".like_target_id IS NOT NULL
  ) AS like,
  json_agg(
    DISTINCT jsonb_build_object(
      'userOriginId',
      quote.user_origin_id,
      'quoteTargetId',
      quote.quote_target_id
    )
  ) FILTER (
    WHERE
      quote.quote_target_id IS NOT NULL
  ) AS quote,
  COALESCE(
    json_agg(
      json_build_object(
        'id', media.id,
        'url', media.url,
        'size', media.size,
        'format', media.format,
        'width', media.width,
        'height', media.height
      )
    ) FILTER (WHERE media.id IS NOT NULL),
    '[]'
  ) AS media
FROM
  ancestors
  LEFT JOIN post AS ogPost ON ancestors.original_post_id = ogPost.id
  LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
  LEFT JOIN reply ON ancestors."postId" = reply.reply_target_id
  LEFT JOIN repost ON ancestors."postId" = repost.repost_target_id
  LEFT JOIN "like" ON ancestors."postId" = "like".like_target_id
  LEFT JOIN quote ON ancestors."postId" = quote.quote_target_id
  LEFT JOIN media ON ancestors."postId" = media.post_id
GROUP BY
  ancestors.post_type,
  ancestors."postId",
  ancestors.content,
  ancestors.parent_post_id,
  ancestors.root_post_id,
  ancestors.original_post_id,
  ancestors.created_at,
  ancestors."userId",
  ancestors.name,
  ancestors.username,
  ancestors.photo,
  ancestors."showLine",
  ogPost.content,
  ogPost.created_at,
  ogUser.id,
  ogUser.username,
  ogUser.name,
  ogUser.photo
ORDER BY
  ancestors.created_at;
    `);

    // await sleep(500);

    return Response.json({ ancestors });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
