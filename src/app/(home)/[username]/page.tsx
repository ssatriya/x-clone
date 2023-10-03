import Header from "@/components/layout/center/header";
import ProfileInfo from "@/components/layout/center/profile/profile-info";
import ProfileTabs from "@/components/layout/center/profile/profile-tabs";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";

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

  const otherUser = await db.user.findUnique({
    where: {
      username: `@${username}`,
    },
    include: {
      followers: true,
      followings: true,
    },
  });

  const currentUser = await db.user.findUnique({
    where: {
      id: session.user.userId,
    },
    include: {
      followers: true,
      followings: true,
    },
  });

  if (!otherUser || !currentUser) {
    return <h1>Not login</h1>;
  }

  return (
    <div className="">
      <Header title="Home" subtitle="1,210 posts" backButton={true} />
      {session.user ? (
        <ProfileInfo otherUser={otherUser} currentUser={currentUser} />
      ) : (
        <ProfileInfo otherUser={otherUser} />
      )}
      <ProfileTabs />
    </div>
  );
}
