import Header from "@/components/header";
import PersonalProfileInfo from "./personal-profile-info";
import db from "@/lib/db";
import { followerTable, postTable, userTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

type Props = {
  username: string;
};

const PersonalInfoWrapper = async ({ username }: Props) => {
  const [user] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      username: userTable.username,
      photo: userTable.photo,
      headerPhoto: userTable.headerPhoto,
      bio: userTable.bio,
      postCount: sql<number>`count(${postTable})`.mapWith(Number),
      followingCount: sql<number>`
      (SELECT count(*) FROM ${followerTable}
       WHERE ${followerTable.followingId} = ${userTable.id})
      `.mapWith(Number),
      followersCount: sql<number>`
      (SELECT count(*) FROM ${followerTable}
       WHERE ${followerTable.followerId} = ${userTable.id})
      `.mapWith(Number),
    })
    .from(userTable)
    .leftJoin(postTable, eq(postTable.userId, userTable.id))
    .where(eq(userTable.username, `@${username}`))
    .groupBy(
      userTable.id,
      userTable.name,
      userTable.username,
      userTable.photo,
      userTable.bio
    );

  return (
    <>
      <Header
        title={user.name}
        subtitle={`${user.postCount} posts`}
        backButton={true}
      />
      <PersonalProfileInfo user={user} />
    </>
  );
};

export default PersonalInfoWrapper;
