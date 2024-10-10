import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";

import db from "@/lib/db";
import Button from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import { notificationTable, userTable } from "@/lib/db/schema";

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
        ? `${count} ${user.name} (@${username}) / X`
        : `${user.name} (@${username}) / X`,
    icons: [favicon],
  };
}

export default function Page() {
  return (
    <div className="flex flex-col max-w-[400px] px-8 mx-auto my-9">
      <span className="text-[31px] text-secondary-lighter font-extrabold leading-9 mb-2">
        Highlight on your profile
      </span>
      <span className="text-[15px] text-gray leading-5 mb-7">
        You must be subscribed to Premium to highlight posts on your profile.
      </span>
      <Button
        variant="secondary"
        className="w-fit h-[52px] px-8 font-bold text-[19px] leading-5"
      >
        Subscribe to Premium
      </Button>
    </div>
  );
}
