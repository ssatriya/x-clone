"use client";

import Post from "../post/post";
import { ExtendedPost, UserWithFollowersFollowing } from "@/types/db";
import { useIntersection } from "@mantine/hooks";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import QuoteItem from "../quote/quote-item";

type ForYouFeedProps = {
  user: UserWithFollowersFollowing;
};

export default function ForYouFeed({ user }: ForYouFeedProps) {
  const lastPostRef = React.useRef();
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 0.5,
  });

  const { data, isLoading, size, isValidating, setSize } = useInfiniteScroll();

  const posts: ExtendedPost[] = data ? [].concat(...data) : [];
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
          posts?.map((post, index) => {
            if (index === posts.length - 1) {
              if (post.post_type === "POST") {
                return (
                  <li key={post.id} ref={ref}>
                    <Post
                      userPosted={post.user_one.avatar}
                      post={post}
                      currentUser={user}
                      classNames="border-b"
                    />
                  </li>
                );
              } else if (post.post_type === "QUOTE") {
                return (
                  <li key={post.id} ref={ref}>
                    <QuoteItem
                      post={post}
                      userPosted={post.user_one.avatar}
                      currentUser={user}
                      postUserOwner={post.user_two}
                    />
                  </li>
                );
              }
            } else {
              if (post.post_type === "POST") {
                return (
                  <Post
                    userPosted={post.user_one.avatar}
                    key={post.id}
                    post={post}
                    currentUser={user}
                    classNames="border-b"
                  />
                );
              } else if (post.post_type === "QUOTE") {
                return (
                  <QuoteItem
                    key={post.id}
                    post={post}
                    userPosted={post.user_one.avatar}
                    currentUser={user}
                    postUserOwner={post.user_two}
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
