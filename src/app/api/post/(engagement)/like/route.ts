import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import db from "@/lib/db";
import { likeTable, notificationTable } from "@/lib/db/schema";
import { CreateLikeSchema } from "@/lib/zod-schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { LikeInfo } from "@/types";

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
      .from(likeTable)
      .where(eq(likeTable.likeTargetId, postId));

    const data: LikeInfo = {
      likeCount: res.length,
      isLikedByUser: res.some((r) => r.userOriginId === loggedInUser.id),
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
    const payload = CreateLikeSchema.safeParse(body);

    if (!payload.success) {
      return new Response("invalid payload", { status: 400 });
    }

    const { likeTargetId, userId } = payload.data;

    const isLiked = await db
      .select()
      .from(likeTable)
      .where(
        and(
          eq(likeTable.userOriginId, loggedInUser.id),
          eq(likeTable.likeTargetId, likeTargetId)
        )
      );

    if (isLiked.length > 0) {
      await db.transaction(async (tx) => {
        await tx
          .delete(likeTable)
          .where(
            and(
              eq(likeTable.likeTargetId, likeTargetId),
              eq(likeTable.userOriginId, loggedInUser.id)
            )
          );
        await tx
          .delete(notificationTable)
          .where(
            and(
              eq(notificationTable.postId, likeTargetId),
              eq(notificationTable.issuerId, loggedInUser.id),
              eq(notificationTable.recipientId, userId)
            )
          );
      });
      return new Response("like deleted", { status: 200 });
    }

    await db.transaction(async (tx) => {
      await tx.insert(likeTable).values({
        likeTargetId: likeTargetId,
        userOriginId: loggedInUser.id,
      });
      await tx.insert(notificationTable).values({
        issuerId: loggedInUser.id,
        recipientId: userId,
        notificationType: "like",
        postId: likeTargetId,
      });
    });

    return new Response("liked successfully", { status: 201 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
