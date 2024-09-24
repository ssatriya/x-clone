import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { notificationTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const postId = req.nextUrl.searchParams.get("postId");

    if (!postId) {
      return new Response("searchparams not found", { status: 404 });
    }

    await db
      .update(notificationTable)
      .set({
        read: true,
      })
      .where(eq(notificationTable.postId, postId));

    return new Response("notification marked as read", { status: 201 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
