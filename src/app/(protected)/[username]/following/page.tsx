import { eq, sql } from "drizzle-orm";

import db from "@/lib/db";
import Button from "@/components/ui/button";
import { followerTable, userTable } from "@/lib/db/schema";
import FollowingList from "@/components/profile/follow/following-list";
import { validateRequest } from "@/lib/auth/validate-request";
import { redirect } from "next/navigation";

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
    title: `People followed by ${user.name} (@${username}) / X`,
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

  const [{ followingCount }] = await db
    .select({
      followingCount: sql<number>`count(${followerTable})`.mapWith(Number),
    })
    .from(followerTable)
    .leftJoin(userTable, eq(userTable.id, followerTable.followerId))
    .where(eq(followerTable.followingId, user.id));

  if (followingCount === 0) {
    return (
      <div className="flex flex-col my-8 max-w-[400px] mx-auto px-8">
        <span className="font-extrabold text-[31px] leading-9 text-secondary-lighter mb-2">
          Be in the know
        </span>
        <span className="text-[15px] leading-5 text-gray mb-7">
          Following accounts is an easy way to curate your timeline and know
          what’s happening with the topics and people you’re interested in.
        </span>
        <Button className="h-[52px] text-[17px] font-bold text-secondary-lighter px-8 w-fit">
          Find people to follow
        </Button>
      </div>
    );
  }

  return <FollowingList username={username} loggedInUser={loggedInUser} />;
}
