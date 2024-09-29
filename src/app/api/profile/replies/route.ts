import { PAGE_SIZE } from "@/constants";
import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

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

    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);

    const posts = await db.execute(sql`
      WITH RECURSIVE
        user_posts AS (
          -- Get all posts by the user
          SELECT 
            id,
            parent_post_id,
            root_post_id,
            post_type,
            created_at
          FROM 
            post
          WHERE 
            user_id = ${user.id}
        ),
        conversation_roots AS (
          -- Get the root posts of conversations the user participated in
          SELECT DISTINCT
            COALESCE(p.root_post_id, p.id) AS root_id,
            FIRST_VALUE(p.created_at) OVER (
              PARTITION BY COALESCE(p.root_post_id, p.id)
              ORDER BY p.created_at
            ) AS conversation_start_time
          FROM
            user_posts up
            JOIN post p ON up.id = p.id OR up.id = p.parent_post_id
        ),
        post_hierarchy AS (
          -- Base case: Include root posts and direct children of user posts
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
            cr.conversation_start_time AS thread_start_time,
            0 AS depth,
            COALESCE(post.original_post_id, post.id) AS "displayPostId",
            ogPost.content AS "originalPostContent",
            ogPost.created_at AS "originalPostCreatedAt",
            ogUser.id AS "originalUserId",
            ogUser.username AS "originalUsername",
            ogUser.name AS "originalName",
            ogUser.photo AS "originalPhoto",
            ogPost.root_post_id AS "originalRootPostId",
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM post AS p
              WHERE p.parent_post_id = post.id
            ) THEN true
            ELSE false
          END AS "showLine"
          FROM
            post
            JOIN "user" ON post.user_id = "user".id
            JOIN conversation_roots cr ON post.id = cr.root_id
            LEFT JOIN post AS ogPost ON post.original_post_id = ogPost.id
            LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
            LEFT JOIN media ON media.post_id = post.id
            LEFT JOIN media AS ogMedia ON ogMedia.post_id = post.original_post_id
          UNION ALL
          
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
            ph.thread_start_time,
            ph.depth + 1 AS depth,
            COALESCE(post.original_post_id, post.id) AS "displayPostId",
            ogPost.content AS "originalPostContent",
            ogPost.created_at AS "originalPostCreatedAt",
            ogUser.id AS "originalUserId",
            ogUser.username AS "originalUsername",
            ogUser.name AS "originalName",
            ogUser.photo AS "originalPhoto",
            ogPost.root_post_id AS "originalRootPostId",
            CASE
              WHEN EXISTS (
                SELECT 1
                FROM post AS p
                WHERE p.parent_post_id = post.id
              ) THEN true
              WHEN post.post_type IN ('quote', 'repost')
              AND EXISTS (
                SELECT 1
                FROM post AS p
                WHERE p.parent_post_id = post.id
                  AND p.user_id = ${user.id}
              ) THEN true
              ELSE false
            END AS "showLine"
          FROM
            post
            JOIN "user" ON post.user_id = "user".id
            JOIN post_hierarchy ph ON post.parent_post_id = ph."postId"
            LEFT JOIN post AS ogPost ON post.original_post_id = ogPost.id
            LEFT JOIN "user" AS ogUser ON ogPost.user_id = ogUser.id
          WHERE
            post.id != ph."postId"
        )
      SELECT DISTINCT ON (ph.thread_start_time, ph."rootPostId", ph."createdAt", ph."postId")
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
        ph."displayPostId" AS "originalPostId",
        ph."originalPostContent",
        ph."originalPostCreatedAt",
        ph."originalUserId",
        ph."originalUsername",
        ph."originalName",
        ph."originalPhoto",
        ph."originalRootPostId",
        (
          SELECT
            json_agg(
              DISTINCT jsonb_build_object(
                'userOriginId',
                repost.user_origin_id,
                'repostTargetId',
                repost.repost_target_id
              )
            ) FILTER (
              WHERE
                repost.repost_target_id = ph."postId"
            )
          FROM
            repost
          WHERE
            repost.repost_target_id = ph."postId"
        ) AS repost,
        (
          SELECT
            json_agg(
              jsonb_build_object(
                'userOriginId',
                quote.user_origin_id,
                'quoteTargetId',
                quote.quote_target_id
              )
            ) FILTER (
              WHERE
                quote.quote_target_id = ph."postId"
            )
          FROM
            quote
          WHERE
            quote.quote_target_id = ph."postId"
        ) AS quote,
        (
          SELECT
            json_agg(
              DISTINCT jsonb_build_object(
                'userOriginId',
                "like".user_origin_id,
                'likeTargetId',
                "like".like_target_id
              )
            ) FILTER (
              WHERE
                "like".like_target_id = ph."postId"
            )
          FROM
            "like"
          WHERE
            "like".like_target_id = ph."postId"
        ) AS "like",
        (
          SELECT
            json_agg(
              DISTINCT jsonb_build_object(
                'userOriginId',
                ogRepost.user_origin_id,
                'repostTargetId',
                ogRepost.repost_target_id
              )
            ) FILTER (
              WHERE
                ogRepost.repost_target_id = ph."displayPostId"
            )
          FROM
            repost ogRepost
          WHERE
            ogRepost.repost_target_id = ph."displayPostId"
        ) AS "originalRepost",
        (
          SELECT
            json_agg(
              jsonb_build_object(
                'userOriginId',
                ogQuote.user_origin_id,
                'quoteTargetId',
                ogQuote.quote_target_id
              )
            ) FILTER (
              WHERE
                ogQuote.quote_target_id = ph."displayPostId"
            )
          FROM
            quote ogQuote
          WHERE
            ogQuote.quote_target_id = ph."displayPostId"
        ) AS "originalQuote",
        (
          SELECT
            json_agg(
              DISTINCT jsonb_build_object(
                'userOriginId',
                ogLike.user_origin_id,
                'likeTargetId',
                ogLike.like_target_id
              )
            ) FILTER (
              WHERE
                ogLike.like_target_id = ph."displayPostId"
            )
          FROM
            "like" ogLike
          WHERE
            ogLike.like_target_id = ph."displayPostId"
        ) AS "originalLike",
        (
          SELECT COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'id', media.id,
              'url', media.url,
              'size', media.size,
              'format', media.format,
              'width', media.width,
              'height', media.height
            )
          ) FILTER (WHERE media.id IS NOT NULL), '[]'::json)
          FROM media
          WHERE media.post_id = ph."postId"
        ) AS media,
        (
          SELECT COALESCE(json_agg(
            DISTINCT jsonb_build_object(
              'id', ogMedia.id,
              'url', ogMedia.url,
              'size', ogMedia.size,
              'format', ogMedia.format,
              'width', ogMedia.width,
              'height', ogMedia.height
            )
          ) FILTER (
            WHERE ogMedia.id IS NOT NULL AND ph."displayPostId" != ph."postId"
          ), '[]'::json)
          FROM media AS ogMedia
          WHERE ogMedia.post_id = ph."displayPostId"
        ) AS "originalMedia",
        (SELECT COUNT(*) FROM reply WHERE reply.reply_target_id = ph."postId") AS "replyCount",
        (SELECT COUNT(*) FROM reply WHERE reply.reply_target_id = ph."displayPostId") AS "originalReplyCount"
      FROM
        post_hierarchy ph
      ORDER BY
        ph.thread_start_time DESC,
        ph."rootPostId",
        ph."createdAt",
        ph."postId"
      LIMIT ${PAGE_SIZE} OFFSET ${offset};
  `);

    const nextOffset = posts.length === PAGE_SIZE ? offset + PAGE_SIZE : null;

    return Response.json({ posts, nextOffset });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
