import { redirect } from "next/navigation";

import { sleep } from "@/lib/utils";
import HomeTab from "@/components/home/home-tab";
import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { notificationTable } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

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
    title: `${count} Home / X`,
    icons: [favicon],
  };
}

export default async function Page() {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  await sleep(1000);

  return <HomeTab loggedInUser={loggedInUser} />;
}
