import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import db from "@/lib/db";
import { followerTable, userTable } from "@/lib/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import FollowersList from "@/components/profile/follow/followers-list";

type Props = {
  params: {
    username: string;
  };
};

export async function generateMetadata({ params: { username } }: Props) {
  const [user] = await db
    .select({
      name: userTable.name,
    })
    .from(userTable)
    .where(eq(userTable.username, `@${username}`));

  return {
    title: `People following ${user.name} (@${username}) / X`,
  };
}

export default async function Page({ params: { username } }: Props) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return redirect("/");
  }

  const [user] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.username, `@${username}`));

  const [{ followersCount }] = await db
    .select({
      followersCount: sql<number>`count(${followerTable})`.mapWith(Number),
    })
    .from(followerTable)
    .leftJoin(userTable, eq(userTable.id, followerTable.followerId))
    .where(eq(followerTable.followerId, user.id));

  if (followersCount === 0) {
    return (
      <div className="flex flex-col my-8 max-w-[400px] mx-auto px-8">
        <span className="font-extrabold text-[31px] leading-9 text-secondary-lighter mb-2">
          Looking for followers?
        </span>
        <span className="text-[15px] leading-5 text-gray">
          When someone follows this account, they’ll show up here. Posting and
          interacting with others helps boost followers.
        </span>
      </div>
    );
  }

  return <FollowersList username={username} loggedInUser={loggedInUser} />;
}
