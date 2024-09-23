import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { followerTable, postTable, userTable } from "@/lib/db/schema";
import { aliasedTable, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return new Response("invalid params", { status: 400 });
    }

    const [user] = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        username: userTable.username,
        photo: userTable.photo,
        bio: userTable.bio,
        postCount: sql<number>`count(${postTable})`.mapWith(Number),
        followersCount: sql<number>`
        (SELECT count(*) FROM ${followerTable}
         WHERE ${followerTable.followerId} = ${userTable.id})
        `.mapWith(Number),
        followingCount: sql<number>`
        (SELECT count(*) FROM ${followerTable}
         WHERE ${followerTable.followingId} = ${userTable.id})
        `.mapWith(Number),
        isFollowing: sql<boolean>`
          EXISTS(
            SELECT 1 
            FROM ${followerTable}
            WHERE ${followerTable.followerId} = ${userTable.id}
            AND ${followerTable.followingId} = ${loggedInUser.id}
          )
        `.mapWith(Boolean),
      })
      .from(userTable)
      .leftJoin(postTable, eq(postTable.userId, userTable.id))
      .where(eq(userTable.username, `@${username}`))
      .groupBy(
        userTable.id,
        userTable.name,
        userTable.username,
        userTable.photo,
        userTable.bio
      );

    return Response.json(user);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
