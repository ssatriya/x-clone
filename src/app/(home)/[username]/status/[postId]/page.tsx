import Loading from "@/app/(home)/loading";
import Header from "@/components/layout/center/header";
import InlineReply from "@/components/layout/center/reply/inline-reply/inline-reply";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import * as React from "react";

type PostPageProps = {
  params: {
    postId: string;
    username: string;
  };
};

export default async function PostPage({ params }: PostPageProps) {
  const session = await getCurrentSession();
  const username = params.username;
  const postId = params.postId;

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
      following: true,
    },
  });

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      user_one: {
        include: {
          followers: true,
          following: true,
        },
      },
      user_two: {
        include: {
          followers: true,
          following: true,
        },
      },
      original_repost: true,
      replys: true,
      reposts: true,
      likes: true,
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

  if (!otherUser || !currentUser || !post) {
    return <h1>Not login</h1>;
  }

  return (
    <div>
      <InlineReply currentUser={currentUser} post={post} />
    </div>
  );
}
