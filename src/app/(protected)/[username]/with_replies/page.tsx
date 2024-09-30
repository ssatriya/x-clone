import ProfileReplies from "@/components/profile/profile-replies";
import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { notificationTable, userTable } from "@/lib/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

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
        ? `${count} Posts with replies by ${user.name} (@${username}) / X`
        : `Posts with replies by ${user.name} (@${username}) / X`,
    icons: [favicon],
  };
}

export default async function Page({ params: { username } }: Props) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  return <ProfileReplies loggedInUser={loggedInUser} username={username} />;
  // return <div>with replies page</div>;
}
