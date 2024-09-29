import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { mediaTable, postTable, userTable } from "@/lib/db/schema";
import { and, desc, eq, isNotNull, lte, ne, or, sql } from "drizzle-orm";
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

    let filter = or(
      eq(postTable.postType, "post"),
      eq(postTable.postType, "quote"),
      eq(postTable.postType, "reply")
    );

    if (decodedCursor) {
      filter = and(
        or(
          eq(postTable.postType, "post"),
          eq(postTable.postType, "quote"),
          eq(postTable.postType, "reply")
        ),
        lte(postTable.createdAt, new Date(decodedCursor))
      );
    }

    const media = await db
      .select({
        id: postTable.id,
        postCreatedAt: postTable.createdAt,
        media: sql`
        json_agg(
          DISTINCT jsonb_build_object(
            'id', ${mediaTable.id},
            'url', ${mediaTable.url},
            'size', ${mediaTable.size},
            'format', ${mediaTable.format},
            'width', ${mediaTable.width},
            'height', ${mediaTable.height}
          )
        ) FILTER (WHERE ${mediaTable.id} IS NOT NULL)
      `,
      })
      .from(postTable)
      .innerJoin(mediaTable, eq(mediaTable.postId, postTable.id)) // INNER JOIN ensures only posts with media
      .where(and(eq(postTable.userId, user.id), filter)) // Apply the existing user filter
      .groupBy(postTable.id)
      .having(sql`COUNT(${mediaTable.id}) > 0`)
      .orderBy(desc(postTable.createdAt))
      .limit(12);

    const nextCursor =
      media.length === pageSize ? media[media.length - 1].postCreatedAt : null;

    return Response.json({ media, nextCursor });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
