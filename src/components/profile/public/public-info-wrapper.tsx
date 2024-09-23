import Header from "@/components/header";
import PublicProfileInfo from "./public-profile-info";
import db from "@/lib/db";
import { followerTable, postTable, userTable } from "@/lib/db/schema";
import { aliasedTable, eq, sql } from "drizzle-orm";
import { User } from "lucia";

type Props = {
  loggedInUser: User;
  username: string;
};

const PublicInfoWrapper = async ({ username, loggedInUser }: Props) => {
  const [user] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      username: userTable.username,
      photo: userTable.photo,
      headerPhoto: userTable.headerPhoto,
      bio: userTable.bio,
      postCount: sql<number>`count(${postTable})`.mapWith(Number),
      followersCount: sql<number>`
      (SELECT count(*) FROM ${followerTable}
       WHERE ${followerTable.followerId} = ${userTable.id})
      `.mapWith(Number),
      followingCount: sql<number>`
      (SELECT count(*) FROM ${followerTable}
       WHERE ${followerTable.followingId} = ${userTable.id})
      `.mapWith(Number),
      isFollowing: sql<boolean>`
          EXISTS(
            SELECT 1 
            FROM ${followerTable}
            WHERE ${followerTable.followerId} = ${userTable.id}
            AND ${followerTable.followingId} = ${loggedInUser.id}
          )
        `.mapWith(Boolean),
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
      <PublicProfileInfo user={user} usernameParams={username} />
    </>
  );
};

export default PublicInfoWrapper;
