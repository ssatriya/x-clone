import AllNotification from "@/components/notification/all-notification";
import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { notificationTable } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return redirect("/");
  }

  const [notification] = await db
    .select({
      count: sql<number>`count(${notificationTable})`.mapWith(Number),
    })
    .from(notificationTable)
    .where(
      and(
        eq(notificationTable.recipientId, loggedInUser.id),
        eq(notificationTable.read, false)
      )
    );
  const count = notification.count > 0 ? `(${notification.count}) ` : "";
  const favicon =
    notification.count > 0
      ? {
          url: "/x-with-notification.ico",
          href: "/x-with-notification.ico",
        }
      : {
          url: "/x-icon.ico",
          href: "/x-icon.ico",
        };

  return {
    title: `${count} Notifications / X`,
    icons: [favicon],
  };
}

export default async function Page() {
  return <AllNotification />;
}
