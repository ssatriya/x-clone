import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import db from "@/lib/db";
import { followerTable } from "@/lib/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return new Response("invalid params", { status: 400 });
    }

    const user = await db
      .select()
      .from(followerTable)
      .where(
        and(
          eq(followerTable.followerId, userId),
          eq(followerTable.followingId, loggedInUser.id)
        )
      );

    return Response.json(user.length > 0);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
