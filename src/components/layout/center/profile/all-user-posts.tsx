import { useProfilePost } from "@/hooks/useProfilePost";
import { ExtendedPost, UserWithFollowersFollowing } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { Loader2 } from "lucide-react";
import * as React from "react";
import Post from "../post/post";
import { User } from "@prisma/client";

type AllUserPostsProps = {
  userByUsername: User;
  currentUser?: UserWithFollowersFollowing;
};

export default function AllUserPosts({
  userByUsername,
  currentUser,
}: AllUserPostsProps) {
  const lastPostRef = React.useRef();
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 0.3,
  });

  const { data, isLoading, size, isValidating, setSize } = useProfilePost(
    userByUsername.id
  );

  const allPosts: ExtendedPost[] = data ? [].concat(...data) : [];
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 10);
  const isRefreshing = isValidating && data && data.length === size;

  React.useEffect(() => {
    if (entry?.isIntersecting && !isReachingEnd && !isRefreshing) {
      setSize(size + 1);
    }
  }, [entry?.isIntersecting, isRefreshing]);

  return (
    <>
      <ul>
        {isLoading ? (
          <div className="h-full flex justify-center items-start mt-6">
            <Loader2 className="h-9 w-9 animate-spin stroke-blue" />
          </div>
        ) : (
          allPosts?.map((post, index) => {
            if (index === allPosts.length - 1) {
              return (
                <li key={post.id} ref={ref}>
                  <Post
                    userPosted={post.user_one.avatar}
                    post={post}
                    currentUser={currentUser!}
                    classNames="border-b"
                  />
                </li>
              );
            }
          })
        )}
      </ul>
    </>
  );
}
