import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { notificationTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const issuerId = req.nextUrl.searchParams.get("issuerId");

    if (!issuerId) {
      return new Response("searchparams not found", { status: 404 });
    }

    await db
      .update(notificationTable)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notificationTable.recipientId, loggedInUser.id),
          eq(notificationTable.issuerId, issuerId),
          eq(notificationTable.notificationType, "follow")
        )
      );

    return new Response("notification marked as read", { status: 201 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
