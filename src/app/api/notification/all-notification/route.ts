import { aliasedTable, and, desc, eq, isNotNull } from "drizzle-orm";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth/validate-request";
import { notificationTable, postTable, userTable } from "@/lib/db/schema";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const recipientUser = aliasedTable(userTable, "recipientUser");

    const notifications = await db
      .select({
        id: notificationTable.id,
        read: notificationTable.read,
        notificationType: notificationTable.notificationType,
        postId: postTable.id,
        content: postTable.content,
        postType: postTable.postType,
        userId: userTable.id,
        verified: userTable.verified,
        name: userTable.name,
        username: userTable.username,
        photo: userTable.photo,
        createdAt: notificationTable.createdAt,
        recipientUsername: recipientUser.username,
      })
      .from(notificationTable)
      .leftJoin(postTable, eq(postTable.id, notificationTable.postId))
      .leftJoin(userTable, eq(userTable.id, notificationTable.issuerId))
      .leftJoin(
        recipientUser,
        eq(recipientUser.id, notificationTable.recipientId)
      )
      .where(
        and(
          eq(notificationTable.recipientId, loggedInUser.id),
          isNotNull(userTable.id)
        )
      )
      .orderBy(desc(notificationTable.createdAt));

    return Response.json(notifications);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
