import Header from "@/components/layout/center/header";
import ProfileInfo from "@/components/layout/center/profile/profile-info";
import ProfileTabs from "@/components/layout/center/profile/profile-tabs";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { notFound } from "next/navigation";

type ProfilePagesProps = {
  params: {
    username: string;
  };
};

export default async function ProfilePage({ params }: ProfilePagesProps) {
  const session = await getCurrentSession();
  const username = params.username;

  if (!session?.user) {
    // show login
    console.log("not login");
    return <h1>Not Login</h1>;
  }

  const userByUsername = await db.user.findUnique({
    where: {
      username: `@${username}`,
    },
    include: {
      followers: true,
      following: true,
    },
  });

  const currentUser = await db.user.findUnique({
    where: {
      id: session.user.userId,
    },
    include: {
      followers: true,
      following: true,
    },
  });

  if (!currentUser) {
    return <h1>Not login</h1>;
  }

  if (!userByUsername) {
    return notFound();
  }

  return (
    <div className="">
      <Header title="Home" subtitle="1,210 posts" backButton={true} />
      {session.user ? (
        <ProfileInfo
          userByUsername={userByUsername}
          currentUser={currentUser}
        />
      ) : (
        <ProfileInfo userByUsername={userByUsername} />
      )}
      <ProfileTabs />
    </div>
  );
}
