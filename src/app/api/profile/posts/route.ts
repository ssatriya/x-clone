import { NextRequest } from "next/server";
import { aliasedTable, and, desc, eq, lte, or, sql } from "drizzle-orm";

import {
  likeTable,
  postTable,
  quoteTable,
  replyTable,
  repostTable,
  userTable,
} from "@/lib/db/schema";
import db from "@/lib/db";
import { ForYouFeedPost } from "@/types";
import { validateRequest } from "@/lib/auth/validate-request";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const username = req.nextUrl.searchParams.get("username") || undefined;

    if (!username) {
      return new Response("invalid params", { status: 400 });
    }

    const [user] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.username, `@${username}`));

    if (!user.id) {
      return new Response("user not found", { status: 404 });
    }

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const decodedCursor = cursor ? decodeURIComponent(cursor) : null;

    //   WITH RECURSIVE
    //     post_hierarchy AS (
    //       -- Base case: Select the root posts (posts with no parent)
    //       SELECT
    //         post.id AS "postId",
    //         post.content AS "postContent",
    //         post.parent_post_id AS "parentPostId",
    //         post.root_post_id AS "rootPostId",
    //         post.created_at AS "createdAt",
    //         post.media AS "postMedia",
    //         post.post_type AS "postType",
    //         "user".id AS "userId",
    //         "user".username,
    //         "user".name,
    //         "user".photo,
    //         post.user_id AS "authorId",
    //         post.created_at AS thread_start_time,
    //         1 AS depth,
    //         -- Include quoted post details if post is a repost or quote
    //         ogPost.id AS "originalPostId",
    //         ogPost.content AS "originalPostContent",
    //         ogPost.created_at AS "originalPostCreatedAt",
    //         ogPost.media AS "originalPostMedia",
    //         ogUser.id AS "originalUserId",
    //         ogUser.username AS "originalUsername",
    //         ogUser.name AS "originalName",
    //         ogUser.photo AS "originalPhoto",
    //         ogPost.root_post_id AS "originalRootPostId",
    //         -- Determine if the user replied to their own post
    //         CASE
    //           WHEN EXISTS (
    //             SELECT
    //               1
    //             FROM
    //               post replyPost
    //             WHERE
    //               replyPost.parent_post_id = post.id
    //               AND replyPost.user_id = post.user_id
    //           ) THEN true
    //           ELSE false
    //         END AS "showLine" -- Set showLine if there's a self-reply
    //       FROM
    //         post
    //         JOIN "user" ON post.user_id = "user".id
    //         -- Left join the original post data for repost/quote types
    //         LEFT JOIN post AS ogPost ON post.original_post_id = ogPost.id
    //         LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
    //       WHERE
    //         post.user_id = ${user.id} -- Fetch posts by the user
    //         AND post.parent_post_id IS NULL -- Only root posts
    //       UNION ALL
    //       -- Recursive case: Traverse down to fetch replies
    //       SELECT
    //         post.id AS "postId",
    //         post.content AS "postContent",
    //         post.parent_post_id AS "parentPostId",
    //         post.root_post_id AS "rootPostId",
    //         post.created_at AS "createdAt",
    //         post.media AS "postMedia",
    //         post.post_type AS "postType",
    //         "user".id AS "userId",
    //         "user".username,
    //         "user".name,
    //         "user".photo,
    //         post.user_id AS "authorId",
    //         post_hierarchy.thread_start_time,
    //         post_hierarchy.depth + 1 AS depth,
    //         ogPost.id AS "originalPostId",
    //         ogPost.content AS "originalPostContent",
    //         ogPost.created_at AS "originalPostCreatedAt",
    //         ogPost.media AS "originalPostMedia",
    //         ogUser.id AS "originalUserId",
    //         ogUser.username AS "originalUsername",
    //         ogUser.name AS "originalName",
    //         ogUser.photo AS "originalPhoto",
    //         ogPost.root_post_id AS "originalRootPostId",
    //         -- Determine if the user replied to their own post
    //         CASE
    //           WHEN post.post_type IN ('quote', 'post', 'reply') -- Only for quote or post types
    //           AND EXISTS (
    //             SELECT
    //               1
    //             FROM
    //               post replyPost
    //             WHERE
    //               replyPost.parent_post_id = post.id
    //               AND replyPost.user_id = post.user_id
    //           ) THEN true
    //           ELSE false
    //         END AS "showLine"
    //       FROM
    //         post
    //         JOIN "user" ON post.user_id = "user".id
    //         JOIN post_hierarchy ON post.parent_post_id = post_hierarchy."postId"
    //         LEFT JOIN post AS ogPost ON post.original_post_id = ogPost.id
    //         LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
    //       WHERE
    //         post.user_id = ${user.id}
    //     )
    //     -- Perform the aggregation after recursion is complete
    //   SELECT
    //     ph."postId",
    //     ph."postContent",
    //     ph."parentPostId",
    //     ph."rootPostId",
    //     ph."createdAt",
    //     ph."postMedia",
    //     ph."postType",
    //     ph."userId",
    //     ph.username,
    //     ph.name,
    //     ph.photo,
    //     ph.depth,
    //     ph.thread_start_time,
    //     ph."showLine", -- Include showLine in the result
    //     -- Fields for the original quoted or reposted post
    //     ph."originalPostId",
    //     ph."originalPostContent",
    //     ph."originalPostCreatedAt",
    //     ph."originalPostMedia",
    //     ph."originalUserId",
    //     ph."originalUsername",
    //     ph."originalName",
    //     ph."originalPhoto",
    //     ph."originalRootPostId",
    //     -- Aggregated JSON arrays for current post
    //     json_agg(
    //       DISTINCT jsonb_build_object(
    //         'userOriginId',
    //         repost.user_origin_id,
    //         'repostTargetId',
    //         repost.repost_target_id
    //       )
    //     ) FILTER (
    //       WHERE
    //         repost.repost_target_id = ph."postId"
    //         AND repost.repost_target_id IS NOT NULL
    //     ) AS repost,
    //     json_agg(
    //       DISTINCT jsonb_build_object(
    //         'userOriginId',
    //         quote.user_origin_id,
    //         'quoteTargetId',
    //         quote.quote_target_id
    //       )
    //     ) FILTER (
    //       WHERE
    //         quote.quote_target_id = ph."postId"
    //         AND quote.quote_target_id IS NOT NULL
    //     ) AS quote,
    //     json_agg(
    //       DISTINCT jsonb_build_object(
    //         'userOriginId',
    //         "like".user_origin_id,
    //         'likeTargetId',
    //         "like".like_target_id
    //       )
    //     ) FILTER (
    //       WHERE
    //         "like".like_target_id = ph."postId"
    //         AND "like".like_target_id IS NOT NULL
    //     ) AS "like",
    //     -- Aggregated JSON arrays for original post (if it's a repost or quote)
    //     json_agg(
    //       DISTINCT jsonb_build_object(
    //         'userOriginId',
    //         ogRepost.user_origin_id,
    //         'repostTargetId',
    //         ogRepost.repost_target_id
    //       )
    //     ) FILTER (
    //       WHERE
    //         ogRepost.repost_target_id = ph."originalPostId"
    //         AND ogRepost.repost_target_id IS NOT NULL
    //     ) AS originalRepost,
    //     json_agg(
    //       DISTINCT jsonb_build_object(
    //         'userOriginId',
    //         ogQuote.user_origin_id,
    //         'quoteTargetId',
    //         ogQuote.quote_target_id
    //       )
    //     ) FILTER (
    //       WHERE
    //         ogQuote.quote_target_id = ph."originalPostId"
    //         AND ogQuote.quote_target_id IS NOT NULL
    //     ) AS originalQuote,
    //     json_agg(
    //       DISTINCT jsonb_build_object(
    //         'userOriginId',
    //         ogLike.user_origin_id,
    //         'likeTargetId',
    //         ogLike.like_target_id
    //       )
    //     ) FILTER (
    //       WHERE
    //         ogLike.like_target_id = ph."originalPostId"
    //         AND ogLike.like_target_id IS NOT NULL
    //     ) AS originalLike,
    //     -- Counts of replies
    //     COUNT(DISTINCT reply.id) AS "replyCount",
    //     COUNT(DISTINCT ogReply.id) AS "originalReplyCount"
    //   FROM
    //     post_hierarchy ph
    //     LEFT JOIN reply ON ph."postId" = reply.reply_target_id
    //     LEFT JOIN repost ON ph."postId" = repost.repost_target_id
    //     LEFT JOIN "like" ON ph."postId" = "like".like_target_id
    //     LEFT JOIN quote ON ph."postId" = quote.quote_target_id
    //     -- Join for original post data
    //     LEFT JOIN reply AS ogReply ON ph."originalPostId" = ogReply.reply_target_id
    //     LEFT JOIN repost AS ogRepost ON ph."originalPostId" = ogRepost.repost_target_id
    //     LEFT JOIN "like" AS ogLike ON ph."originalPostId" = ogLike.like_target_id
    //     LEFT JOIN quote AS ogQuote ON ph."originalPostId" = ogQuote.quote_target_id
    //   WHERE COALESCE(${decodedCursor}::timestamp, NULL) IS NULL OR ph."createdAt" < ${decodedCursor}::timestamp
    //   GROUP BY
    //     ph."postId",
    //     ph."postContent",
    //     ph."parentPostId",
    //     ph."rootPostId",
    //     ph."createdAt",
    //     ph."postMedia",
    //     ph."postType",
    //     ph."userId",
    //     ph.username,
    //     ph.name,
    //     ph.photo,
    //     ph.depth,
    //     ph.thread_start_time,
    //     ph."showLine", -- Include showLine in GROUP BY clause
    //     ph."originalPostId",
    //     ph."originalPostContent",
    //     ph."originalPostCreatedAt",
    //     ph."originalPostMedia",
    //     ph."originalUserId",
    //     ph."originalUsername",
    //     ph."originalName",
    //     ph."originalPhoto",
    //     ph."originalRootPostId"
    //   ORDER BY
    //     ph.thread_start_time DESC,
    //     ph.depth,
    //     ph."createdAt"
    //   LIMIT ${pageSize};
    // `);

    // with sqlai.ai
    const posts = await db.execute(sql`
    WITH RECURSIVE post_hierarchy AS (
      -- Base case: Select the root posts (posts with no parent)
      SELECT
        post.id AS "postId",
        post.content AS "postContent",
        post.parent_post_id AS "parentPostId",
        post.root_post_id AS "rootPostId",
        post.created_at AS "createdAt",
        post.media AS "postMedia",
        post.post_type AS "postType",
        "user".id AS "userId",
        "user".username,
        "user".name,
        "user".photo,
        post.user_id AS "authorId",
        post.created_at AS thread_start_time,
        1 AS depth,
        -- Include quoted post details if post is a repost or quote
        ogPost.id AS "originalPostId",
        ogPost.content AS "originalPostContent",
        ogPost.created_at AS "originalPostCreatedAt",
        ogPost.media AS "originalPostMedia",
        ogUser.id AS "originalUserId",
        ogUser.username AS "originalUsername",
        ogUser.name AS "originalName",
        ogUser.photo AS "originalPhoto",
        ogPost.root_post_id AS "originalRootPostId",
        -- Determine if the user replied to their own post
        CASE
          WHEN replyPost.user_id IS NOT NULL THEN true
          ELSE false
        END AS "showLine"
      FROM
        post
        JOIN "user" ON post.user_id = "user".id
        -- Left join the original post data for repost/quote types
        LEFT JOIN post AS ogPost ON post.original_post_id = ogPost.id
        LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
        LEFT JOIN post AS replyPost ON replyPost.parent_post_id = post.id AND replyPost.user_id = post.user_id
      WHERE
        post.user_id = ${user.id} -- Fetch posts by the user
        AND post.parent_post_id IS NULL -- Only root posts

      UNION ALL

      -- Recursive case: Traverse down to fetch replies
      SELECT
        post.id AS "postId",
        post.content AS "postContent",
        post.parent_post_id AS "parentPostId",
        post.root_post_id AS "rootPostId",
        post.created_at AS "createdAt",
        post.media AS "postMedia",
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
        ogPost.media AS "originalPostMedia",
        ogUser.id AS "originalUserId",
        ogUser.username AS "originalUsername",
        ogUser.name AS "originalName",
        ogUser.photo AS "originalPhoto",
        ogPost.root_post_id AS "originalRootPostId",
        CASE
          WHEN post.post_type IN ('quote', 'post', 'reply')
          AND replyPost.user_id IS NOT NULL THEN true
          ELSE false
        END AS "showLine"
      FROM
        post
        JOIN "user" ON post.user_id = "user".id
        JOIN post_hierarchy ON post.parent_post_id = post_hierarchy."postId"
        LEFT JOIN post AS ogPost ON post.original_post_id = ogPost.id
        LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
        LEFT JOIN post AS replyPost ON replyPost.parent_post_id = post.id AND replyPost.user_id = post.user_id
      WHERE
        post.user_id = ${user.id}
    )
    SELECT
      ph."postId",
      ph."postContent",
      ph."parentPostId",
      ph."rootPostId",
      ph."createdAt",
      ph."postMedia",
      ph."postType",
      ph."userId",
      ph.username,
      ph.name,
      ph.photo,
      ph.depth,
      ph.thread_start_time,
      ph."showLine",
      -- Fields for the original quoted or reposted post
      ph."originalPostId",
      ph."originalPostContent",
      ph."originalPostCreatedAt",
      ph."originalPostMedia",
      ph."originalUserId",
      ph."originalUsername",
      ph."originalName",
      ph."originalPhoto",
      ph."originalRootPostId",
      -- Aggregated JSON arrays for current post
      (SELECT json_agg(
          DISTINCT jsonb_build_object(
            'userOriginId', repost.user_origin_id,
            'repostTargetId', repost.repost_target_id
          )
        ) FILTER (
          WHERE repost.repost_target_id = ph."postId"
        )
      FROM repost
      WHERE repost.repost_target_id = ph."postId") AS repost,
      (SELECT json_agg(
          jsonb_build_object(
            'userOriginId', quote.user_origin_id,
            'quoteTargetId', quote.quote_target_id
          )
        ) FILTER (
          WHERE quote.quote_target_id = ph."postId"
        )
      FROM quote
      WHERE quote.quote_target_id = ph."postId") AS quote,
      (SELECT json_agg(
          DISTINCT jsonb_build_object(
            'userOriginId', "like".user_origin_id,
            'likeTargetId', "like".like_target_id
          )
        ) FILTER (
          WHERE "like".like_target_id = ph."postId"
        )
      FROM "like"
      WHERE "like".like_target_id = ph."postId") AS "like",
      -- Aggregated JSON arrays for original post
      (SELECT json_agg(
          DISTINCT jsonb_build_object(
            'userOriginId', ogRepost.user_origin_id,
            'repostTargetId', ogRepost.repost_target_id
          )
        ) FILTER (
          WHERE ogRepost.repost_target_id = ph."originalPostId"
        )
      FROM repost ogRepost
      WHERE ogRepost.repost_target_id = ph."originalPostId") AS "originalRepost",
      (SELECT json_agg(
          DISTINCT jsonb_build_object(
            'userOriginId', ogQuote.user_origin_id,
            'quoteTargetId', ogQuote.quote_target_id
          )
        ) FILTER (
          WHERE ogQuote.quote_target_id = ph."originalPostId"
        )
      FROM quote ogQuote
      WHERE ogQuote.quote_target_id = ph."originalPostId") AS "originalQuote",
      (SELECT json_agg(
          DISTINCT jsonb_build_object(
            'userOriginId', ogLike.user_origin_id,
            'likeTargetId', ogLike.like_target_id
          )
        ) FILTER (
          WHERE ogLike.like_target_id = ph."originalPostId"
        )
      FROM "like" ogLike
      WHERE ogLike.like_target_id = ph."originalPostId") AS "originalLike",
      -- Counts of replies
      CAST(COUNT(DISTINCT reply.id) AS int) AS "replyCount",
      CAST(COUNT(DISTINCT ogReply.id) AS int) AS "originalReplyCount"
    FROM
      post_hierarchy ph
      LEFT JOIN reply ON ph."postId" = reply.reply_target_id
      LEFT JOIN repost ON ph."postId" = repost.repost_target_id
      LEFT JOIN "like" ON ph."postId" = "like".like_target_id
      LEFT JOIN quote ON ph."postId" = quote.quote_target_id
      -- Join for original post data
      LEFT JOIN reply AS ogReply ON ph."originalPostId" = ogReply.reply_target_id
      LEFT JOIN repost AS ogRepost ON ph."originalPostId" = ogRepost.repost_target_id
      LEFT JOIN "like" AS ogLike ON ph."originalPostId" = ogLike.like_target_id
      LEFT JOIN quote AS ogQuote ON ph."originalPostId" = ogQuote.quote_target_id
    WHERE COALESCE(${decodedCursor}::timestamp, NULL) IS NULL OR ph."createdAt" < ${decodedCursor}::timestamp
    GROUP BY
      ph."postId",
      ph."parentPostId",
      ph."rootPostId",
      ph."createdAt",
      ph."userId",
      ph.thread_start_time,
      ph."showLine",
      ph.depth,
      ph."originalPostId",
      ph."originalRootPostId",
      ph."postContent",
      ph."postMedia",
      ph."postType",
      ph.username,
      ph.name,
      ph.photo,
      ph."originalPostContent",
      ph."originalPostCreatedAt",
      ph."originalPostMedia",
      ph."originalUserId",
      ph."originalUsername",
      ph."originalName",
      ph."originalPhoto"
    ORDER BY
      ph.thread_start_time DESC,
      ph."createdAt"
    LIMIT ${pageSize};  
    `);

    const nextCursor =
      posts.length === pageSize ? posts[posts.length - 1].createdAt : null;

    return Response.json({ posts, nextCursor });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
