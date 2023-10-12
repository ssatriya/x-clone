import Header from "@/components/layout/center/header";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type LayoutProps = {
  params: {
    username: string;
  };
  children: React.ReactNode;
};

export default async function Layout({ children, params }: LayoutProps) {
  const userByUsername = await db.user.findUnique({
    where: {
      username: `@${params.username}`,
    },
    include: {
      followers: true,
      following: true,
    },
  });

  if (!userByUsername) {
    return redirect("/home");
  }

  const postCount = await db.post.findMany({
    where: {
      user_one_id: userByUsername.id,
    },
  });

  if (!postCount) {
    return redirect("/home");
  }

  return (
    <>
      <Header
        title={userByUsername.name}
        backButton={true}
        subtitle={`${postCount.length} posts`}
      />
      {children}
    </>
  );
}
