import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { postTable, userTable } from "@/lib/db/schema";
import { and, eq, isNotNull, lte, ne, or } from "drizzle-orm";
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

    // let filter = and(
    //   or(
    //     eq(postTable.postType, "post"),
    //     eq(postTable.postType, "quote"),
    //     eq(postTable.postType, "reply")
    //   ),
    //   isNotNull(postTable.media)
    // );

    // if (decodedCursor) {
    //   filter = and(
    //     or(
    //       eq(postTable.postType, "post"),
    //       eq(postTable.postType, "quote"),
    //       eq(postTable.postType, "reply")
    //     ),
    //     lte(postTable.createdAt, new Date(decodedCursor)),
    //     isNotNull(postTable.media)
    //   );
    // }

    // const media = await db
    //   .select({
    //     id: postTable.id,
    //     media: postTable.media,
    //     postCreatedAt: postTable.createdAt,
    //   })
    //   .from(postTable)
    //   .where(and(eq(postTable.userId, user.id), filter))
    //   .limit(12);

    // const nextCursor =
    //   media.length === pageSize ? media[media.length - 1].postCreatedAt : null;

    // return Response.json({ media, nextCursor });

    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
