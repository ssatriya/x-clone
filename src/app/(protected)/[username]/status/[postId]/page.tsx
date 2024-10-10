import { redirect } from "next/navigation";

import PostDetail from "@/components/home/post/post-detail";
import { validateRequest } from "@/lib/auth/validate-request";

type Props = {
  params: {
    username: string;
    postId: string;
  };
};

export default async function Page({ params: { username, postId } }: Props) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  return (
    <PostDetail
      postId={postId}
      username={username}
      loggedInUser={loggedInUser}
    />
  );
}
