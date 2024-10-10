import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";

import db from "@/lib/db";
import ProfileMedia from "@/components/profile/profile-media";
import { validateRequest } from "@/lib/auth/validate-request";
import { userTable, mediaTable, notificationTable } from "@/lib/db/schema";

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
        ? `${count} Media posts by ${user.name} (@${username}) / X`
        : `Media posts by ${user.name} (@${username}) / X`,
    icons: [favicon],
  };
}

export default async function Page({ params: { username } }: Props) {
  const [user] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.username, `@${username}`));

  const [{ mediaCount }] = await db
    .select({
      mediaCount: sql<number>`count(${mediaTable})`.mapWith(Number),
    })
    .from(mediaTable)
    .where(eq(mediaTable.userId, user.id));

  if (mediaCount === 0) {
    return (
      <div className="flex flex-col my-8 max-w-[400px] mx-auto px-8">
        <span className="font-extrabold text-[31px] leading-9 text-secondary-lighter mb-2">
          Lights, camera … attachments!
        </span>
        <span className="text-[15px] leading-5 text-gray mb-7">
          When you post photos or videos, they will show up here.
        </span>
      </div>
    );
  }

  return <ProfileMedia username={username} />;
}
