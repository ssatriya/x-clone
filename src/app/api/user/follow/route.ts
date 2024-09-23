import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { followerTable } from "@/lib/db/schema";
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
      await db
        .delete(followerTable)
        .where(
          and(
            eq(followerTable.followerId, targetId),
            eq(followerTable.followingId, loggedInUser.id)
          )
        );
      return new Response("unfollowed", { status: 200 });
    }

    await db.insert(followerTable).values({
      followerId: targetId,
      followingId: loggedInUser.id,
    });

    return new Response("followed", { status: 201 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
