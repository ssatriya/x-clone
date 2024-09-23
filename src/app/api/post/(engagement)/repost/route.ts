import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { generateIdFromEntropySize } from "lucia";

import db from "@/lib/db";
import { RepostInfo } from "@/types";
import { CreateRepostSchema } from "@/lib/zod-schema";
import { postTable, repostTable } from "@/lib/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";

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

    const res = await db
      .select()
      .from(repostTable)
      .where(eq(repostTable.repostTargetId, postId));

    const data: RepostInfo = {
      repostCount: res.length,
      isRepostedByUser: res.some((r) => r.userOriginId === loggedInUser.id),
    };

    return Response.json(data);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const body = await req.json();
    const payload = CreateRepostSchema.safeParse(body);

    if (!payload.success) {
      return new Response("invalid payload", { status: 400 });
    }

    const { repostTargetId, postType } = payload.data;

    const isReposted = await db
      .select()
      .from(repostTable)
      .where(
        and(
          eq(repostTable.repostTargetId, repostTargetId),
          eq(repostTable.userOriginId, loggedInUser.id)
        )
      );

    if (isReposted.length > 0) {
      await db.transaction(async (tx) => {
        await tx
          .delete(postTable)
          .where(
            and(
              eq(postTable.postType, postType),
              eq(postTable.userId, loggedInUser.id),
              eq(postTable.originalPostId, repostTargetId)
            )
          );
        await tx
          .delete(repostTable)
          .where(
            and(
              eq(repostTable.repostTargetId, repostTargetId),
              eq(repostTable.userOriginId, loggedInUser.id)
            )
          );
      });

      return new Response("repost deleted", { status: 200 });
    }

    const postId = generateIdFromEntropySize(10);

    await db.transaction(async (tx) => {
      await tx.insert(postTable).values({
        id: postId,
        postType: postType,
        userId: loggedInUser.id,
        rootPostId: postId,
        originalPostId: repostTargetId,
      });
      await tx.insert(repostTable).values({
        repostTargetId: repostTargetId,
        userOriginId: loggedInUser.id,
      });
    });

    return new Response("reposted successfully", { status: 201 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
