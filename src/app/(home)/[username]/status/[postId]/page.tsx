import Header from "@/components/layout/center/header";
import Post from "@/components/layout/center/post/post";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";

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
      followings: true,
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
          followings: true,
        },
      },
      user_two: {
        include: {
          followers: true,
          followings: true,
        },
      },
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
      followings: true,
    },
  });

  if (!otherUser || !currentUser || !post) {
    return <h1>Not login</h1>;
  }

  return (
    <div>
      <Header title="Post" backButton={true} />
      <Post
        currentUser={currentUser}
        post={post}
        userPosted={post.user_one.avatar}
      />
    </div>
  );
}
