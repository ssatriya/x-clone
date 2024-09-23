import ProfileMedia from "@/components/profile/profile-media";
import db from "@/lib/db";
import { postTable, userTable } from "@/lib/db/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";

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
    title: `Media posts by ${user.name} (@${username}) / X`,
  };
}

export default async function Page({ params: { username } }: Props) {
  const [user] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.username, `@${username}`));

  const [{ mediaCount }] = await db
    .select({
      mediaCount: sql<number>`count(${postTable.media})`.mapWith(Number),
    })
    .from(postTable)
    .where(and(eq(postTable.userId, user.id), isNotNull(postTable.media)));

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
