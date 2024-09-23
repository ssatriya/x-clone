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

    // #startregion
    // This query apply alternating conversation within different user
    // Also make a conversation with the same user if
    // that user keep replying to their own reply
    // const descendants = await db.execute(sql`
    //     WITH RECURSIVE descendants AS (
    //         -- Base case: Select the immediate replies to the root post
    //         SELECT
    //             post.id AS "postId",
    //             post.content,
    //             post.parent_post_id,
    //             post.root_post_id,
    //             post.created_at,
    //             post.media,
    //             post.post_type,
    //             "user".id AS "userId",
    //             "user".username,
    //             "user".name,
    //             "user".photo,
    //             post.parent_post_id AS original_parent_id,
    //             post.user_id AS author_id,
    //             1 AS depth,
    //             post.created_at AS thread_start_time,
    //             false AS is_alternating -- Start with no alternating conversation
    //         FROM
    //             post
    //             JOIN "user" ON post.user_id = "user".id
    //         WHERE
    //             post.parent_post_id = ${postId}
    //         UNION ALL
    //         -- Recursive case: Traverse down the reply chain
    //         SELECT
    //             post.id AS "postId",
    //             post.content,
    //             post.parent_post_id,
    //             post.root_post_id,
    //             post.created_at,
    //             post.media,
    //             post.post_type,
    //             "user".id AS "userId",
    //             "user".username,
    //             "user".name,
    //             "user".photo,
    //             descendants.original_parent_id,
    //             post.user_id AS author_id,
    //             descendants.depth + 1 AS depth,
    //             descendants.thread_start_time,
    //             -- Detect if alternating conversation exists
    //             CASE
    //                 WHEN descendants.author_id != post.user_id THEN true -- Alternating conversation starts
    //                 ELSE descendants.is_alternating -- Propagate alternation flag
    //             END AS is_alternating
    //         FROM
    //             post
    //             JOIN "user" ON post.user_id = "user".id
    //             JOIN descendants ON post.parent_post_id = descendants."postId"
    //         WHERE
    //             -- Include replies if:
    //             (
    //                 -- Either from a different user (continue the conversation)
    //                 post.user_id != descendants.author_id
    //                 OR
    //                 -- Or no alternating conversation has started yet
    //                 descendants.is_alternating = false
    //             )
    //     )
    //     SELECT
    //         descendants.post_type AS "postType",
    //         descendants."postId",
    //         descendants.content,
    //         descendants.parent_post_id AS "parentPostId",
    //         descendants.root_post_id AS "rootPostId",
    //         descendants.created_at AS "createdAt",
    //         descendants.media,
    //         descendants.username,
    //         descendants."userId",
    //         descendants.name,
    //         descendants.photo,
    //         CASE WHEN EXISTS (
    //             SELECT 1
    //             FROM descendants d2
    //             WHERE d2.parent_post_id = descendants."postId"
    //         ) THEN true ELSE false END AS "showLine",
    //         COUNT(DISTINCT reply.id) AS "replyCount",
    //         json_agg(
    //             DISTINCT jsonb_build_object(
    //                 'userOriginId', repost.user_origin_id,
    //                 'repostTargetId', repost.repost_target_id
    //             )
    //         ) FILTER (WHERE repost.repost_target_id IS NOT NULL) AS repost,
    //         json_agg(
    //             DISTINCT jsonb_build_object(
    //                 'userOriginId', "like".user_origin_id,
    //                 'likeTargetId', "like".like_target_id
    //             )
    //         ) FILTER (WHERE "like".like_target_id IS NOT NULL) AS like,
    //         json_agg(
    //             DISTINCT jsonb_build_object(
    //                 'userOriginId', quote.user_origin_id,
    //                 'quoteTargetId', quote.quote_target_id
    //             )
    //         ) FILTER (WHERE quote.quote_target_id IS NOT NULL) AS quote
    //     FROM
    //         descendants
    //         LEFT JOIN reply ON descendants."postId" = reply.reply_target_id
    //         LEFT JOIN repost ON descendants."postId" = repost.repost_target_id
    //         LEFT JOIN "like" ON descendants."postId" = "like".like_target_id
    //         LEFT JOIN quote ON descendants."postId" = quote.quote_target_id
    //     WHERE
    //         descendants.original_parent_id = ${postId}
    //     GROUP BY
    //         descendants."postId",
    //         descendants.content,
    //         descendants.parent_post_id,
    //         descendants.root_post_id,
    //         descendants.created_at,
    //         descendants.media,
    //         descendants.post_type,
    //         descendants.username,
    //         descendants.name,
    //         descendants."userId",
    //         descendants.photo,
    //         descendants.depth,
    //         descendants.thread_start_time
    //     ORDER BY
    //         descendants.thread_start_time,
    //         descendants.depth,
    //         descendants.created_at;
    // `);
    // #endregion

    // WORKED QUERY 16/09/2024 16:01 PM
    // const descendants = await db.execute(sql`
    // WITH RECURSIVE
    //   descendants AS (
    //     -- Base case: Select the immediate replies to the root post
    //     SELECT
    //       post.id AS "postId",
    //       post.content,
    //       post.parent_post_id,
    //       post.root_post_id,
    //       post.created_at,
    //       post.media,
    //       post.post_type,
    //       "user".id AS "userId",
    //       "user".username,
    //       "user".name,
    //       "user".photo,
    //       post.parent_post_id AS original_parent_id,
    //       post.user_id AS author_id,
    //       1 AS depth,
    //       post.created_at AS thread_start_time,
    //       false AS is_alternating,
    //       ARRAY[post.user_id] AS participants -- Track participants (array)
    //     FROM
    //       post
    //       JOIN "user" ON post.user_id = "user".id
    //     WHERE
    //       post.parent_post_id = ${postId}
    //     UNION ALL
    //     -- Recursive case: Traverse down the reply chain
    //     SELECT
    //       post.id AS "postId",
    //       post.content,
    //       post.parent_post_id,
    //       post.root_post_id,
    //       post.created_at,
    //       post.media,
    //       post.post_type,
    //       "user".id AS "userId",
    //       "user".username,
    //       "user".name,
    //       "user".photo,
    //       descendants.original_parent_id,
    //       post.user_id AS author_id,
    //       descendants.depth + 1 AS depth,
    //       descendants.thread_start_time,
    //       -- Detect if the conversation is between the same two users
    //       CASE
    //         WHEN array_length(descendants.participants, 1) = 2
    //           AND NOT post.user_id = ANY(descendants.participants) THEN true -- Mark as alternating once a third user is involved
    //         ELSE descendants.is_alternating -- Continue with the current two-user conversation
    //       END AS is_alternating,
    //       CASE
    //         -- Keep the two participants in the conversation
    //         WHEN array_length(descendants.participants, 1) < 2 THEN array_append(descendants.participants, post.user_id)
    //         ELSE descendants.participants
    //       END AS participants
    //     FROM
    //       post
    //       JOIN "user" ON post.user_id = "user".id
    //       JOIN descendants ON post.parent_post_id = descendants."postId"
    //     WHERE
    //       -- Continue if:
    //       (
    //         -- The post is made by one of the two participants
    //         post.user_id = ANY(descendants.participants)
    //         OR
    //         -- Allow a second participant to join the conversation
    //         (array_length(descendants.participants, 1) < 2)
    //       )
    //       -- Exclude third participants until the main two-user conversation ends
    //       AND descendants.is_alternating = false
    //   )
    // SELECT
    //   descendants.post_type AS "postType",
    //   descendants."postId",
    //   descendants.content,
    //   descendants.parent_post_id AS "parentPostId",
    //   descendants.root_post_id AS "rootPostId",
    //   descendants.created_at AS "createdAt",
    //   descendants.media,
    //   descendants.username,
    //   descendants."userId",
    //   descendants.name,
    //   descendants.photo,
    //   CASE
    //     WHEN EXISTS (
    //       SELECT
    //         1
    //       FROM
    //         descendants d2
    //       WHERE
    //         d2.parent_post_id = descendants."postId"
    //     ) THEN true
    //     ELSE false
    //   END AS "showLine",
    //   COUNT(DISTINCT reply.id) AS "replyCount",
    //   json_agg(
    //     DISTINCT jsonb_build_object(
    //       'userOriginId',
    //       repost.user_origin_id,
    //       'repostTargetId',
    //       repost.repost_target_id
    //     )
    //   ) FILTER (
    //     WHERE
    //       repost.repost_target_id IS NOT NULL
    //   ) AS repost,
    //   json_agg(
    //     DISTINCT jsonb_build_object(
    //       'userOriginId',
    //       "like".user_origin_id,
    //       'likeTargetId',
    //       "like".like_target_id
    //     )
    //   ) FILTER (
    //     WHERE
    //       "like".like_target_id IS NOT NULL
    //   ) AS like,
    //   json_agg(
    //     DISTINCT jsonb_build_object(
    //       'userOriginId',
    //       quote.user_origin_id,
    //       'quoteTargetId',
    //       quote.quote_target_id
    //     )
    //   ) FILTER (
    //     WHERE
    //       quote.quote_target_id IS NOT NULL
    //   ) AS quote
    // FROM
    //   descendants
    //   LEFT JOIN reply ON descendants."postId" = reply.reply_target_id
    //   LEFT JOIN repost ON descendants."postId" = repost.repost_target_id
    //   LEFT JOIN "like" ON descendants."postId" = "like".like_target_id
    //   LEFT JOIN quote ON descendants."postId" = quote.quote_target_id
    // WHERE
    //   descendants.original_parent_id = ${postId}
    // AND (
    //   -- Include the row if it's the original post (depth = 1)
    //   descendants.depth >= 1
    //   OR
    //   -- Or if there are any posts using this post's ID as rootPostId
    //   EXISTS (
    //     SELECT 1
    //     FROM post
    //     WHERE post.root_post_id = descendants."postId"
    //   )
    // )
    // GROUP BY
    //   descendants."postId",
    //   descendants.content,
    //   descendants.parent_post_id,
    //   descendants.root_post_id,
    //   descendants.created_at,
    //   descendants.media,
    //   descendants.post_type,
    //   descendants.username,
    //   descendants.name,
    //   descendants."userId",
    //   descendants.photo,
    //   descendants.depth,
    //   descendants.thread_start_time
    // ORDER BY
    //   descendants.thread_start_time,
    //   descendants.created_at;
    //   `);
    // ORDER BY
    //   descendants.thread_start_time,
    //   descendants.depth,
    //   descendants.created_at;

    // await sleep(500);

    //     const descendants = await db.execute(sql`
    //         WITH RECURSIVE
    //   descendants AS (
    //     -- Base case: Select the immediate replies to the root post
    //     SELECT
    //       post.id AS "postId",
    //       post.content,
    //       post.parent_post_id,
    //       post.root_post_id,
    //       post.created_at,
    //       post.media,
    //       post.post_type,
    //       "user".id AS "userId",
    //       "user".username,
    //       "user".name,
    //       "user".photo,
    //       post.parent_post_id AS original_parent_id,
    //       post.user_id AS author_id,
    //       1 AS depth,
    //       post.created_at AS thread_start_time,
    //       false AS is_alternating,
    //       ARRAY[post.user_id] AS participants -- Track participants (array)
    //     FROM
    //       post
    //       JOIN "user" ON post.user_id = "user".id
    //     WHERE
    //       post.parent_post_id = ${postId}
    //     UNION ALL
    //     -- Recursive case: Traverse down the reply chain
    //     SELECT
    //       post.id AS "postId",
    //       post.content,
    //       post.parent_post_id,
    //       post.root_post_id,
    //       post.created_at,
    //       post.media,
    //       post.post_type,
    //       "user".id AS "userId",
    //       "user".username,
    //       "user".name,
    //       "user".photo,
    //       descendants.original_parent_id,
    //       post.user_id AS author_id,
    //       descendants.depth + 1 AS depth,
    //       descendants.thread_start_time,
    //       -- Detect if the conversation is between the same two users
    //       CASE
    //         WHEN array_length(descendants.participants, 1) = 2
    //           AND NOT post.user_id = ANY(descendants.participants) THEN true -- Mark as alternating once a third user is involved
    //         ELSE descendants.is_alternating -- Continue with the current two-user conversation
    //       END AS is_alternating,
    //       CASE
    //         -- Keep the two participants in the conversation
    //         WHEN array_length(descendants.participants, 1) < 2 THEN array_append(descendants.participants, post.user_id)
    //         ELSE descendants.participants
    //       END AS participants
    //     FROM
    //       post
    //       JOIN "user" ON post.user_id = "user".id
    //       JOIN descendants ON post.parent_post_id = descendants."postId"
    //     WHERE
    //       -- Continue if:
    //       (
    //         -- The post is made by one of the two participants
    //         post.user_id = ANY(descendants.participants)
    //         OR
    //         -- Allow a second participant to join the conversation
    //         (array_length(descendants.participants, 1) < 2)
    //       )
    //       -- Exclude third participants until the main two-user conversation ends
    //       AND descendants.is_alternating = false
    //       -- Exclude posts with a different root_post_id
    //       AND post.root_post_id = ${postId}
    //   )
    // SELECT
    //   descendants.post_type AS "postType",
    //   descendants."postId",
    //   descendants.content,
    //   descendants.parent_post_id AS "parentPostId",
    //   descendants.root_post_id AS "rootPostId",
    //   descendants.created_at AS "createdAt",
    //   descendants.media,
    //   descendants.username,
    //   descendants."userId",
    //   descendants.name,
    //   descendants.photo,
    //   CASE
    //     WHEN EXISTS (
    //       SELECT
    //         1
    //       FROM
    //         descendants d2
    //       WHERE
    //         d2.parent_post_id = descendants."postId"
    //     ) THEN true
    //     ELSE false
    //   END AS "showLine",
    //   COUNT(DISTINCT reply.id) AS "replyCount",
    //   json_agg(
    //     DISTINCT jsonb_build_object(
    //       'userOriginId',
    //       repost.user_origin_id,
    //       'repostTargetId',
    //       repost.repost_target_id
    //     )
    //   ) FILTER (
    //     WHERE
    //       repost.repost_target_id IS NOT NULL
    //   ) AS repost,
    //   json_agg(
    //     DISTINCT jsonb_build_object(
    //       'userOriginId',
    //       "like".user_origin_id,
    //       'likeTargetId',
    //       "like".like_target_id
    //     )
    //   ) FILTER (
    //     WHERE
    //       "like".like_target_id IS NOT NULL
    //   ) AS like,
    //   json_agg(
    //     DISTINCT jsonb_build_object(
    //       'userOriginId',
    //       quote.user_origin_id,
    //       'quoteTargetId',
    //       quote.quote_target_id
    //     )
    //   ) FILTER (
    //     WHERE
    //       quote.quote_target_id IS NOT NULL
    //   ) AS quote
    // FROM
    //   descendants
    //   LEFT JOIN reply ON descendants."postId" = reply.reply_target_id
    //   LEFT JOIN repost ON descendants."postId" = repost.repost_target_id
    //   LEFT JOIN "like" ON descendants."postId" = "like".like_target_id
    //   LEFT JOIN quote ON descendants."postId" = quote.quote_target_id
    // WHERE
    //   descendants.original_parent_id = ${postId}
    // GROUP BY
    //   descendants."postId",
    //   descendants.content,
    //   descendants.parent_post_id,
    //   descendants.root_post_id,
    //   descendants.created_at,
    //   descendants.media,
    //   descendants.post_type,
    //   descendants.username,
    //   descendants.name,
    //   descendants."userId",
    //   descendants.photo,
    //   descendants.depth,
    //   descendants.thread_start_time
    // ORDER BY
    //   descendants.thread_start_time,
    //   descendants.depth,
    //   descendants.created_at;
    //     `);

    // =======================================
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
      post.media,
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
      post.media,
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
  descendants.media,
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
  ) FILTER (WHERE quote.quote_target_id IS NOT NULL) AS quote
FROM
  descendants
  LEFT JOIN reply ON descendants."postId" = reply.reply_target_id
  LEFT JOIN repost ON descendants."postId" = repost.repost_target_id
  LEFT JOIN "like" ON descendants."postId" = "like".like_target_id
  LEFT JOIN quote ON descendants."postId" = quote.quote_target_id
WHERE
  descendants.original_parent_id = ${postId}
  AND descendants.root_post_id = descendants.thread_root_post_id -- Ensure the root_post_id matches the thread's root
GROUP BY
  descendants."postId",
  descendants.content,
  descendants.parent_post_id,
  descendants.root_post_id,
  descendants.created_at,
  descendants.media,
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
