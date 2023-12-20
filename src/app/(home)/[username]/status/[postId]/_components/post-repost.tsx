import { Post, User } from "@prisma/client";

type PostRepostProps = {
  post: Post;
  username: string;
};

export default function PostRepost({ post, username }: PostRepostProps) {
  return (
    <div>
      <p>{post.id}</p>
      <p>{username}</p>
    </div>
  );
}
