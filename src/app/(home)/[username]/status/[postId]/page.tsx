import Loading from "@/app/(home)/loading";
import ForceRefresh from "@/components/force-refresh";
import Header from "@/components/layout/center/header";
import SinglePost from "@/components/layout/center/post/single-post";
import QuoteItem from "@/components/layout/center/quote/quote-item";
import InlineReply from "@/components/layout/center/reply/inline-reply/inline-post-reply";
import QuoteSinglePost from "@/components/layout/center/single-post/quote-single-post";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { ExtendedPost } from "@/types/db";
import * as React from "react";
import PostRepost from "./_components/post-repost";
import PostQuote from "./_components/post-quote";

type PostPageProps = {
  params: {
    postId: string;
    username: string;
  };
};

export default async function PostPage({ params }: PostPageProps) {
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

  const post = await db.post.findUnique({
    where: {
      id: params.postId,
    },
    include: {
      user_one: {},
      user_two: true,
      original_repost: {
        include: {
          user_one: true,
        },
      },
      replys: true,
      reposts: true,
      likes: true,
    },
  });

  if (!otherUser || !currentUser || !post) {
    return <h1>Not login</h1>;
  }

  return (
    <div>
      {post.post_type === "POST" && (
        <PostRepost post={post} username={post.user_one.name} />
      )}
      {post.post_type === "QUOTE" && (
        <PostQuote post={post} currentUser={currentUser} />
      )}
    </div>
  );
}
