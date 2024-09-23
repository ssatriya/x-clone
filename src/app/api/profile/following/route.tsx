import { NextRequest } from "next/server";
import { aliasedTable, eq, sql } from "drizzle-orm";

import db from "@/lib/db";
import { PAGE_SIZE } from "@/constants";
import { followerTable, userTable } from "@/lib/db/schema";
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

    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);

    const [user] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.username, `@${username}`));

    const followingList = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        username: userTable.username,
        photo: userTable.photo,
        bio: userTable.bio,
        isFollowing: sql<boolean>`
          EXISTS(
            SELECT 1 
            FROM ${followerTable}
            WHERE ${followerTable.followerId} = ${userTable.id}
            AND ${followerTable.followingId} = ${loggedInUser.id}
          )
        `.mapWith(Boolean),
      })
      .from(followerTable)
      .leftJoin(userTable, eq(userTable.id, followerTable.followerId))
      .where(eq(followerTable.followingId, user.id));

    const nextOffset =
      followingList.length === PAGE_SIZE ? offset + PAGE_SIZE : null;

    return Response.json({ nextOffset, followingList });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
