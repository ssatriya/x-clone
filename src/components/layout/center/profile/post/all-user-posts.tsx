import { useProfilePost } from "@/hooks/useProfilePost";
import { ExtendedPost, UserWithFollowersFollowing } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { Loader2 } from "lucide-react";
import * as React from "react";
import Post from "../../post/post";
import { User } from "@prisma/client";
import Repost from "../../post/repost";
import ReplyItem from "../../reply/reply-item";

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
    threshold: 0.5,
  });

  const { data, isLoading, size, isValidating, setSize } = useProfilePost(
    userByUsername.id,
    "/api/profile/post-by-id/all-posts"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              if (post.post_type === "POST") {
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
              } else if (post.post_type === "REPOST") {
                return (
                  <li key={post.id} ref={ref}>
                    <Repost
                      post={post}
                      userPosted={post.user_one.avatar}
                      currentUser={currentUser!}
                      postUserOwner={post.user_two}
                    />
                  </li>
                );
              } else if (post.post_type === "REPLY") {
                return (
                  <li key={post.id} ref={ref}>
                    <ReplyItem
                      post={post}
                      userPosted={post.user_one.avatar}
                      currentUser={currentUser!}
                      postUserOwner={post.user_two}
                      disabledNote={false}
                    />
                  </li>
                );
              }
            } else {
              if (post.post_type === "POST") {
                return (
                  <Post
                    key={post.id}
                    userPosted={post.user_one.avatar}
                    post={post}
                    currentUser={currentUser!}
                    classNames="border-b"
                  />
                );
              } else if (post.post_type === "REPOST") {
                return (
                  <Repost
                    key={post.id}
                    post={post}
                    userPosted={post.user_one.avatar}
                    currentUser={currentUser!}
                    postUserOwner={post.user_two}
                  />
                );
              } else if (post.post_type === "REPLY") {
                return (
                  <ReplyItem
                    key={post.id}
                    post={post}
                    userPosted={post.user_one.avatar}
                    currentUser={currentUser!}
                    postUserOwner={post.user_two}
                    disabledNote={false}
                  />
                );
              }
            }
          })
        )}
      </ul>
      {isLoadingMore && !isLoading && (
        <li className="pb-6 h-full flex justify-center items-start mt-6">
          <Loader2 className="h-9 w-9 animate-spin stroke-blue" />
        </li>
      )}
      {isReachingEnd && (
        <li className="pb-6 h-full flex justify-center items-start mt-6">
          <p>No more posts</p>
        </li>
      )}
    </>
  );
}
