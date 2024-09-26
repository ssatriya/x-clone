import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { mediaTable, postTable, replyTable } from "@/lib/db/schema";
import { CreateReplySchema } from "@/lib/zod-schema";
import { eq, inArray, sql } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const postId = req.nextUrl.searchParams.get("postId");

    if (!postId) {
      return new Response("Invalid params", { status: 400 });
    }

    const [res] = await db
      .select({
        replyCount: sql<number>`count(${replyTable})`.mapWith(Number),
      })
      .from(replyTable)
      .where(eq(replyTable.replyTargetId, postId));
    const { replyCount } = res;

    return Response.json({ replyCount });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const body = await req.json();
    const payload = CreateReplySchema.safeParse(body);

    if (!payload.success) {
      return new Response("invalid payload", { status: 400 });
    }

    const { content, postType, parentPostId, rootPostId, mediaId } =
      payload.data;

    // Checking if other post (type "reply") already using the
    // provided parentPostId

    const isParentPostUsed = await db
      .select()
      .from(postTable)
      .where(eq(postTable.parentPostId, parentPostId));

    const postId = generateIdFromEntropySize(10);
    const replyId = generateIdFromEntropySize(10);

    if (isParentPostUsed.length > 0) {
      if (mediaId && mediaId.length > 0) {
        await db.transaction(async (tx) => {
          await tx.insert(postTable).values({
            id: postId,
            postType: postType,
            userId: loggedInUser.id,
            rootPostId: parentPostId,
            parentPostId: parentPostId,
            content: content,
          });
          await tx.insert(replyTable).values({
            id: replyId,
            replyTargetId: parentPostId,
            userOriginId: loggedInUser.id,
          });
          await tx
            .update(mediaTable)
            .set({
              postId: postId,
            })
            .where(inArray(mediaTable.id, mediaId));
        });
        return new Response("replied successfully", { status: 201 });
      } else {
        await db.transaction(async (tx) => {
          await tx.insert(postTable).values({
            id: postId,
            postType: postType,
            userId: loggedInUser.id,
            rootPostId: parentPostId,
            parentPostId: parentPostId,
            content: content,
          });
          await tx.insert(replyTable).values({
            id: replyId,
            replyTargetId: parentPostId,
            userOriginId: loggedInUser.id,
          });
        });

        return new Response("replied successfully", { status: 201 });
      }
    }

    if (mediaId && mediaId.length > 0) {
      await db.transaction(async (tx) => {
        await tx.insert(postTable).values({
          id: postId,
          postType: postType,
          userId: loggedInUser.id,
          rootPostId: rootPostId,
          parentPostId: parentPostId,
          content: content,
        });
        await tx.insert(replyTable).values({
          id: replyId,
          replyTargetId: parentPostId,
          userOriginId: loggedInUser.id,
        });
        await tx
          .update(mediaTable)
          .set({
            postId: postId,
          })
          .where(inArray(mediaTable.id, mediaId));
      });

      return new Response("replied successfully", { status: 201 });
    } else {
      await db.transaction(async (tx) => {
        await tx.insert(postTable).values({
          id: postId,
          postType: postType,
          userId: loggedInUser.id,
          rootPostId: rootPostId,
          parentPostId: parentPostId,
          content: content,
        });
        await tx.insert(replyTable).values({
          id: replyId,
          replyTargetId: parentPostId,
          userOriginId: loggedInUser.id,
        });
      });

      return new Response("replied successfully", { status: 201 });
    }
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
