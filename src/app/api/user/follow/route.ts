import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { followerTable, notificationTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const targetId = req.nextUrl.searchParams.get("targetId");

    if (!targetId) {
      return new Response("invalid params", { status: 400 });
    }

    const isFollowing = await db
      .select()
      .from(followerTable)
      .where(
        and(
          eq(followerTable.followerId, targetId),
          eq(followerTable.followingId, loggedInUser.id)
        )
      );

    return Response.json(isFollowing.length > 0);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const targetId = req.nextUrl.searchParams.get("targetId");

    if (!targetId) {
      return new Response("invalid params", { status: 400 });
    }

    const isFollowed = await db
      .select()
      .from(followerTable)
      .where(
        and(
          eq(followerTable.followerId, targetId),
          eq(followerTable.followingId, loggedInUser.id)
        )
      );

    if (isFollowed.length > 0) {
      // await db
      //   .delete(followerTable)
      //   .where(
      //     and(
      //       eq(followerTable.followerId, targetId),
      //       eq(followerTable.followingId, loggedInUser.id)
      //     )
      //   );

      await db.transaction(async (tx) => {
        await tx
          .delete(followerTable)
          .where(
            and(
              eq(followerTable.followerId, targetId),
              eq(followerTable.followingId, loggedInUser.id)
            )
          );

        await tx
          .delete(notificationTable)
          .where(
            and(
              eq(notificationTable.issuerId, loggedInUser.id),
              eq(notificationTable.recipientId, targetId),
              eq(notificationTable.notificationType, "follow")
            )
          );
      });
      return new Response("unfollowed", { status: 200 });
    }

    await db.transaction(async (tx) => {
      await tx.insert(followerTable).values({
        followerId: targetId,
        followingId: loggedInUser.id,
      });
      await tx.insert(notificationTable).values({
        issuerId: loggedInUser.id,
        recipientId: targetId,
        notificationType: "follow",
      });
    });

    // await db.insert(followerTable).values({
    //   followerId: targetId,
    //   followingId: loggedInUser.id,
    // });

    return new Response("followed", { status: 201 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
