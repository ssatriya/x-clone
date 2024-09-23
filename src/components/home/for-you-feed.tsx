"use client";

import { User } from "lucia";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import PostItem from "./post/post-item";
import { ForYouFeedPost } from "@/types";
import QuoteItem from "./post/quote-item";
import InfiniteScrollContainer from "../infinite-scroll-container";
import { Button } from "../ui/button";
import { useEffect } from "react";

type Props = {
  loggedInUser: User;
};

const ForYouFeed = ({ loggedInUser }: Props) => {
  const queryClient = useQueryClient();

  const { data, isLoading, hasNextPage, isFetching, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["for-you-feed"],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            "/api/post/for-you",
            pageParam
              ? { searchParams: { cursor: encodeURIComponent(pageParam) } }
              : {}
          )
          .json<{ nextCursor: string; posts: ForYouFeedPost[] }>(),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  useEffect(() => {
    queryClient.resetQueries({ queryKey: ["for-you-feed"] });
  }, [queryClient]);

  const lastPostId = posts[0] && posts[0].post.postId;

  const { data: newCount } = useQuery({
    queryKey: ["check-new-post-for-you", lastPostId],
    queryFn: () =>
      kyInstance
        .get("/api/post/check", {
          searchParams: {
            postId: lastPostId,
          },
        })
        .json<{ count: number }>(),
    enabled: lastPostId !== undefined,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-start justify-center mt-10">
        <span className="loader" />
      </div>
    );
  }

  return (
    <>
      <InfiniteScrollContainer
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        {newCount && newCount.count > 0 && (
          <Button
            onClick={() => refetch()}
            variant="ghost"
            className="h-12 text-primary text-[15px] leading-5 border-b rounded-none w-full hover:bg-hover/25"
          >
            Show {newCount.count} {newCount.count > 1 ? "posts" : "post"}
          </Button>
        )}
        {!isLoading &&
          posts.map((post) => {
            const p = post.post;
            const q = post.quoted;

            if (post.post.postType === "post") {
              return (
                <PostItem
                  key={p.postId}
                  loggedInUser={loggedInUser}
                  post={{
                    id: p.postId,
                    content: p.postContent,
                    createdAt: p.postCreatedAt,
                    media: p.postMedia,
                    parentPostId: p.postParentPostId,
                    postType: p.postType,
                    rootPostId: p.postRootPostId,
                    replyCount: post.replyCount,
                    repost: post.repost,
                    like: post.like,
                    quote: post.quote,
                  }}
                  user={{
                    id: p.userId,
                    name: p.name,
                    username: p.username,
                    photo: p.photo,
                  }}
                />
              );
            } else if (post.post.postType === "quote") {
              return (
                <QuoteItem
                  key={p.postId}
                  loggedInUser={loggedInUser}
                  post={{
                    id: p.postId,
                    content: p.postContent,
                    createdAt: p.postCreatedAt,
                    media: p.postMedia,
                    parentPostId: p.postParentPostId,
                    postType: p.postType,
                    rootPostId: p.postRootPostId,
                    replyCount: post.replyCount,
                    repost: post.repost,
                    like: post.like,
                    quote: post.quote,
                  }}
                  user={{
                    id: p.userId,
                    name: p.name,
                    photo: p.photo,
                    username: p.username,
                  }}
                  quotedPost={{
                    id: q.originalPostId,
                    media: q.originalPostMedia,
                    content: q.originalPostContent,
                    createdAt: q.originalPostCreatedAt,
                  }}
                  quotedUser={{
                    id: q.originalUserId,
                    name: q.originalName,
                    photo: q.originalPhoto,
                    username: q.originalUsername,
                  }}
                />
              );
            }
          })}
      </InfiniteScrollContainer>
    </>
  );
};

export default ForYouFeed;
