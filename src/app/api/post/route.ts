import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import {
  likeTable,
  mediaTable,
  postTable,
  quoteTable,
  replyTable,
  repostTable,
  userTable,
} from "@/lib/db/schema";
import { sleep } from "@/lib/utils";
import { CreatePostSchema } from "@/lib/zod-schema";
import { aliasedTable, and, eq, inArray, sql } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const body = await req.json();
    const payload = CreatePostSchema.safeParse(body);

    if (!payload.success) {
      return new Response("invalid payload", { status: 400 });
    }

    const { content, postType, mediaId } = payload.data;

    const postId = generateIdFromEntropySize(10);

    if (mediaId && mediaId.length > 0) {
      await db.transaction(async (tx) => {
        await tx.insert(postTable).values({
          id: postId,
          postType: postType,
          userId: loggedInUser.id,
          rootPostId: postId,
          content: content,
        });

        await tx
          .update(mediaTable)
          .set({
            postId: postId,
          })
          .where(inArray(mediaTable.id, mediaId));
      });
      return new Response(null, { status: 201 });
    }

    await db.insert(postTable).values({
      id: postId,
      postType: postType,
      userId: loggedInUser.id,
      rootPostId: postId,
      content: content,
    });

    return new Response(null, { status: 201 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const username = req.nextUrl.searchParams.get("username");
    const postId = req.nextUrl.searchParams.get("postId");

    if (!username || !postId) {
      return new Response("invalid params", { status: 400 });
    }

    const ogPost = aliasedTable(postTable, "ogPost");
    const ogUser = aliasedTable(userTable, "ogUser");
    const ogMedia = aliasedTable(mediaTable, "ogMedia");

    const [post] = await db
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
        replyCount: sql<number>`count(DISTINCT ${replyTable})`.mapWith(Number),
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
                json_agg(
                  json_build_object(
                    'id', ${mediaTable.id},
                    'url', ${mediaTable.url},
                    'size', ${mediaTable.size},
                    'format', ${mediaTable.format},
                    'width', ${mediaTable.width},
                    'height', ${mediaTable.height}
                  )
                ) FILTER (WHERE ${mediaTable.id} IS NOT NULL),
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
              json_agg(
                json_build_object(
                  'id', ${ogMedia.id},
                  'url', ${ogMedia.url},
                  'size', ${ogMedia.size},
                  'format', ${ogMedia.format},
                  'width', ${ogMedia.width},
                  'height', ${ogMedia.height}
                )
              ) FILTER (WHERE ${ogMedia.id} IS NOT NULL),
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
      .leftJoin(mediaTable, eq(postTable.id, mediaTable.postId))
      .leftJoin(ogMedia, eq(ogPost.id, ogMedia.postId))
      .where(
        and(eq(postTable.id, postId), eq(userTable.username, `@${username}`))
      )
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
      );

    return Response.json(post);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
