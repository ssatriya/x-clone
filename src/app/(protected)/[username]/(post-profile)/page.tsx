import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { notificationTable, userTable } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import ProfilePosts from "@/components/profile/profile-posts";
import { Suspense } from "react";

type Props = {
  params: {
    username: string;
  };
};

export async function generateMetadata({ params: { username } }: Props) {
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

  const [user] = await db
    .select({
      name: userTable.name,
    })
    .from(userTable)
    .where(eq(userTable.username, `@${username}`));

  const title =
    notification.count > 0
      ? `${count} ${user.name} (@${username}) / X`
      : `${user.name} (@${username}) / X`;

  return {
    title: title,
    icons: [favicon],
  };
}

export default async function Page({ params: { username } }: Props) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  return <ProfilePosts username={username} loggedInUser={loggedInUser} />;
}
