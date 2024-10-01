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
import { ProfilePostLikes } from "@/types";
import { aliasedTable, and, eq, lte, ne, sql, SQL } from "drizzle-orm";
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

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const decodedCursor = cursor ? decodeURIComponent(cursor) : null;

    let filter = and(
      eq(likeTable.userOriginId, user.id),
      ne(postTable.userId, user.id)
    ) as SQL<unknown> | undefined;

    if (decodedCursor) {
      filter = and(
        eq(likeTable.userOriginId, user.id),
        ne(postTable.userId, user.id),
        lte(likeTable.createdAt, new Date(decodedCursor))
      );
    }

    const ogPost = aliasedTable(postTable, "ogPost");
    const ogUser = aliasedTable(userTable, "ogUser");
    const ogLike = aliasedTable(likeTable, "ogLike");
    const ogReply = aliasedTable(replyTable, "ogReply");
    const ogMedia = aliasedTable(mediaTable, "ogMedia");
    const ogQuote = aliasedTable(quoteTable, "ogQuote");
    const ogRepost = aliasedTable(repostTable, "ogRepost");
    const likeTableAgg = aliasedTable(likeTable, "likeTableAgg");

    const likedPosts: Awaited<ProfilePostLikes[]> = await db
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
          originalRootPostId: ogPost.rootPostId,
          originalReplyCount: sql<number>`count(DISTINCT${ogReply})`.mapWith(
            Number
          ),
          originalLike: sql<
            { user_origin_id: string; like_target_id: string }[]
          >`json_agg(
              DISTINCT jsonb_build_object(
                'userOriginId', ${ogLike.userOriginId},
                'likeTargetId', ${ogLike.likeTargetId}
              )
            ) FILTER (WHERE ${ogLike.likeTargetId} IS NOT NULL)`,
          originalRepost: sql<
            { user_origin_id: string; repost_target_id: string }[]
          >`json_agg(
            DISTINCT jsonb_build_object(
              'userOriginId', ${ogRepost.userOriginId},
              'repostTargetId', ${ogRepost.repostTargetId}
            )
          ) FILTER (WHERE ${ogRepost.repostTargetId} IS NOT NULL)`,
          originalQuote: sql<
            { user_origin_id: string; quote_target_id: string }[]
          >`json_agg(
          DISTINCT jsonb_build_object(
              'userOriginId', ${ogQuote.userOriginId},
              'quoteTargetId', ${ogQuote.quoteTargetId}
            )
          ) FILTER (WHERE ${ogQuote.quoteTargetId} IS NOT NULL)`,
        },
        likeCreatedAt: likeTable.createdAt,
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
        DISTINCT jsonb_build_object(
            'userOriginId', ${quoteTable.userOriginId},
            'quoteTargetId', ${quoteTable.quoteTargetId}
          )
        ) FILTER (WHERE ${quoteTable.quoteTargetId} IS NOT NULL)`,
        like: sql<
          { user_origin_id: string; like_target_id: string }[]
        >`json_agg(
          DISTINCT jsonb_build_object(
            'userOriginId', ${likeTableAgg.userOriginId},
            'likeTargetId', ${likeTableAgg.likeTargetId}
          )
		    ) FILTER (WHERE ${likeTableAgg.likeTargetId} IS NOT NULL)`,
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
      .from(likeTable)
      .innerJoin(postTable, eq(likeTable.likeTargetId, postTable.id))
      .leftJoin(replyTable, eq(postTable.id, replyTable.replyTargetId))
      .leftJoin(repostTable, eq(postTable.id, repostTable.repostTargetId))
      .leftJoin(quoteTable, eq(postTable.id, quoteTable.quoteTargetId))
      .innerJoin(userTable, eq(postTable.userId, userTable.id))
      .leftJoin(ogPost, eq(postTable.originalPostId, ogPost.id))
      .leftJoin(ogUser, eq(ogPost.userId, ogUser.id))
      .leftJoin(ogReply, eq(ogReply.replyTargetId, ogPost.id))
      .leftJoin(ogLike, eq(ogLike.likeTargetId, ogPost.id))
      .leftJoin(ogQuote, eq(ogQuote.quoteTargetId, ogPost.id))
      .leftJoin(ogRepost, eq(ogRepost.repostTargetId, ogPost.id))
      .leftJoin(likeTableAgg, eq(likeTableAgg.likeTargetId, postTable.id))
      .leftJoin(mediaTable, eq(postTable.id, mediaTable.postId))
      .leftJoin(ogMedia, eq(ogPost.id, ogMedia.postId))
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
        ogUser.photo,
        likeTable.createdAt
      )
      .orderBy(likeTable.createdAt)
      .limit(pageSize);

    const nextCursor =
      likedPosts.length === pageSize
        ? likedPosts[likedPosts.length - 1].likeCreatedAt
        : null;

    return Response.json({ likedPosts, nextCursor });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
