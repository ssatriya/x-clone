import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";

import db from "@/lib/db";
import { validateRequest } from "@/lib/auth/validate-request";
import { likeTable, notificationTable, userTable } from "@/lib/db/schema";
import ProfileLikes from "@/components/profile/personal/profile-likes";

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
        ne(notificationTable.issuerId, loggedInUser.id),
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

  return {
    title:
      notification.count > 0
        ? `${count} Posts liked by ${user.name} (@${username}) / X`
        : `Posts liked by ${user.name} (@${username}) / X`,
    icons: [favicon],
  };
}

export default async function Page({ params: { username } }: Props) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  const [{ likeCount }] = await db
    .select({
      likeCount: sql<number>`count(${likeTable})`.mapWith(Number),
    })
    .from(likeTable)
    .where(eq(likeTable.userOriginId, loggedInUser.id));

  if (likeCount === 0) {
    return (
      <div className="flex flex-col my-8 max-w-[400px] mx-auto px-8">
        <span className="font-extrabold text-[31px] leading-9 text-secondary-lighter mb-2">
          You don’t have any likes yet
        </span>
        <span className="text-[15px] leading-5 text-gray mb-7">
          Tap the heart on any post to show it some love. When you do, it’ll
          show up here.
        </span>
      </div>
    );
  }

  return <ProfileLikes username={username} loggedInUser={loggedInUser} />;
}
