import { NextRequest } from "next/server";
import { aliasedTable, and, desc, eq, lte, or, sql } from "drizzle-orm";

import {
  likeTable,
  mediaTable,
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

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const decodedCursor = cursor ? decodeURIComponent(cursor) : undefined;

    const ogPost = aliasedTable(postTable, "ogPost");
    const ogUser = aliasedTable(userTable, "ogUser");

    let filter = or(
      eq(postTable.postType, "post"),
      eq(postTable.postType, "quote")
    );

    if (decodedCursor) {
      filter = and(
        or(eq(postTable.postType, "post"), eq(postTable.postType, "quote")),
        lte(postTable.createdAt, new Date(decodedCursor))
      );
    }

    const posts: Awaited<ForYouFeedPost[]> = await db
      .select({
        post: {
          postId: postTable.id,
          postContent: postTable.content,
          postCreatedAt: postTable.createdAt,
          postParentPostId: postTable.parentPostId,
          postRootPostId: postTable.rootPostId,
          postType: postTable.postType,
          postOriginalPostId: postTable.originalPostId,
          userId: userTable.id,
          username: userTable.username,
          name: userTable.name,
          photo: userTable.photo,
        },
        quoted: {
          originalPostId: ogPost.id,
          originalPostContent: ogPost.content,
          originalPostCreatedAt: ogPost.createdAt,
          originalUserId: ogUser.id,
          originalUsername: ogUser.username,
          originalName: ogUser.name,
          originalPhoto: ogUser.photo,
        },
        replyCount: sql<number>`count(DISTINCT${replyTable})`.mapWith(Number),
        repost: sql<
          { user_origin_id: string; repost_target_id: string }[]
        >`json_agg(
          DISTINCT jsonb_build_object(
            'userOriginId', ${repostTable.userOriginId},
            'repostTargetId', ${repostTable.repostTargetId}
          )
        ) FILTER (WHERE ${repostTable.repostTargetId} IS NOT NULL)`,
        quote: sql<
          { user_origin_id: string; quote_target_id: string }[]
        >`json_agg(
        jsonb_build_object(
            'userOriginId', ${quoteTable.userOriginId},
            'quoteTargetId', ${quoteTable.quoteTargetId}
          )
        ) FILTER (WHERE ${quoteTable.quoteTargetId} IS NOT NULL)`,
        like: sql<
          { user_origin_id: string; like_target_id: string }[]
        >`json_agg(
          DISTINCT jsonb_build_object(
            'userOriginId', ${likeTable.userOriginId},
            'likeTargetId', ${likeTable.likeTargetId}
          )
		    ) FILTER (WHERE ${likeTable.likeTargetId} IS NOT NULL)`,
        media: sql<
          {
            id: string;
            url: string;
            size: number;
            format: string;
            width: number;
            height: number;
          }[]
        >`
        COALESCE(
          (
            SELECT json_agg(media)
            FROM (
              SELECT DISTINCT
                ${mediaTable.id} as id,
                ${mediaTable.url} as url,
                ${mediaTable.size} as size,
                ${mediaTable.format} as format,
                ${mediaTable.width} as width,
                ${mediaTable.height} as height
              FROM ${mediaTable}
              WHERE ${mediaTable.postId} = ${postTable.id}
            ) as media
          ),
          '[]'
        )
      `,
        ogMedia: sql<
          {
            id: string;
            url: string;
            size: number;
            format: string;
            width: number;
            height: number;
          }[]
        >`
        COALESCE(
          (
            SELECT json_agg(media)
            FROM (
             SELECT DISTINCT
                ${mediaTable.id} as id,
                ${mediaTable.url} as url,
                ${mediaTable.size} as size,
                ${mediaTable.format} as format,
                ${mediaTable.width} as width,
                ${mediaTable.height} as height
              FROM ${mediaTable}
              WHERE ${mediaTable.postId} = ${ogPost.id}
            ) as media
          ),
          '[]'
        )
      `,
      })
      .from(postTable)
      .innerJoin(userTable, eq(postTable.userId, userTable.id))
      .leftJoin(replyTable, eq(postTable.id, replyTable.replyTargetId))
      .leftJoin(ogPost, eq(postTable.originalPostId, ogPost.id))
      .leftJoin(ogUser, eq(ogPost.userId, ogUser.id))
      .leftJoin(repostTable, eq(postTable.id, repostTable.repostTargetId))
      .leftJoin(quoteTable, eq(postTable.id, quoteTable.quoteTargetId))
      .leftJoin(likeTable, eq(postTable.id, likeTable.likeTargetId))
      .where(filter)
      .groupBy(
        postTable.id,
        userTable.id,
        userTable.name,
        userTable.username,
        userTable.photo,
        ogPost.id,
        ogPost.content,
        ogPost.createdAt,
        ogUser.id,
        ogUser.name,
        ogUser.username,
        ogUser.photo
      )
      .orderBy(desc(postTable.createdAt))
      .limit(pageSize);

    const nextCursor =
      posts.length === pageSize
        ? posts[posts.length - 1].post.postCreatedAt
        : null;

    return Response.json({ posts, nextCursor });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
