import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { notificationTable } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const notifications = await db
      .select()
      .from(notificationTable)
      .where(
        and(
          eq(notificationTable.recipientId, loggedInUser.id),
          eq(notificationTable.read, false)
        )
      );

    return Response.json(notifications);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
