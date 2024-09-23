"use client";

import { User } from "lucia";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { CustomPost } from "@/types";
import { useEffect } from "react";
import InfiniteScrollContainer from "../infinite-scroll-container";
import PostItem from "./post/post-item";
import QuoteItem from "./post/quote-item";
import RepostItem from "./post/repost-item";
import { Button } from "../ui/button";
import { useLocalStorage } from "@mantine/hooks";

type Props = {
  loggedInUser: User;
};

const FollowingFeed = ({ loggedInUser }: Props) => {
  const queryClient = useQueryClient();

  const { data, isLoading, hasNextPage, isFetching, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["following-feed"],
      queryFn: ({ pageParam = 0 }) =>
        kyInstance
          .get(`/api/post/following`, {
            searchParams: {
              offset: pageParam,
            },
          })
          .json<{ nextOffset: number; followedPosts: CustomPost[] }>(),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.nextOffset !== null ? lastPage.nextOffset : undefined;
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    });

  const posts = data?.pages.flatMap((page) => page.followedPosts) || [];

  useEffect(() => {
    queryClient.resetQueries({ queryKey: ["following-feed"] });
  }, [queryClient]);

  const lastPostId = posts[0] && posts[0].postId;

  const { data: newCount } = useQuery({
    queryKey: ["check-new-post-following", lastPostId],
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
          if (post.postType === "post") {
            return (
              <PostItem
                key={post.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: post.postId,
                  content: post.postContent,
                  createdAt: post.createdAt,
                  media: post.postMedia,
                  parentPostId: post.parentPostId,
                  postType: post.postType,
                  rootPostId: post.rootPostId,
                  replyCount: post.replyCount,
                  repost: post.repost,
                  like: post.like,
                  quote: post.quote,
                }}
                user={{
                  id: post.userId,
                  name: post.name,
                  username: post.username,
                  photo: post.photo,
                }}
                showLine={post.showLine}
                showBorderBottom={!post.showLine}
              />
            );
          }
          if (post.postType === "reply") {
            return (
              <PostItem
                key={post.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: post.postId,
                  content: post.postContent,
                  createdAt: post.createdAt,
                  media: post.postMedia,
                  parentPostId: post.parentPostId,
                  postType: post.postType,
                  rootPostId: post.rootPostId,
                  replyCount: post.replyCount,
                  repost: post.repost,
                  like: post.like,
                  quote: post.quote,
                }}
                user={{
                  id: post.userId,
                  name: post.name,
                  username: post.username,
                  photo: post.photo,
                }}
                showLine={post.showLine}
                showBorderBottom={!post.showLine}
              />
            );
          }
          if (post.postType === "quote") {
            return (
              <QuoteItem
                key={post.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: post.postId,
                  content: post.postContent,
                  createdAt: post.createdAt,
                  media: post.postMedia,
                  parentPostId: post.parentPostId,
                  postType: post.postType,
                  rootPostId: post.rootPostId,
                  replyCount: post.replyCount,
                  repost: post.repost,
                  like: post.like,
                  quote: post.quote,
                }}
                user={{
                  id: post.userId,
                  name: post.name,
                  username: post.username,
                  photo: post.photo,
                }}
                quotedPost={{
                  id: post.originalPostId,
                  content: post.originalPostContent,
                  media: post.originalPostMedia,
                  createdAt: post.originalPostCreatedAt,
                }}
                quotedUser={{
                  id: post.originalUserId,
                  name: post.originalName,
                  username: post.originalUsername,
                  photo: post.originalPhoto || "",
                }}
                showLine={post.showLine}
                showBorderBottom={!post.showLine}
              />
            );
          }
          if (post.postType === "repost") {
            return (
              <RepostItem
                key={post.postId}
                loggedInUser={loggedInUser}
                user={{
                  id: post.userId,
                  name: post.name,
                  username: post.username,
                  photo: post.photo,
                  bio: "",
                }}
                quotedPost={{
                  id: post.originalPostId,
                  content: post.originalPostContent,
                  media: post.originalPostMedia,
                  createdAt: post.originalPostCreatedAt,
                  replyCount: post.originalReplyCount,
                  rootPostId: post.originalRootPostId,
                  like: post.originalLike,
                  repost: post.originalRepost,
                  quote: post.originalQuote,
                }}
                quotedUser={{
                  id: post.originalUserId,
                  name: post.originalName,
                  username: post.originalUsername,
                  photo: post.originalPhoto || "",
                }}
              />
            );
          }
        })}
    </InfiniteScrollContainer>
  );
};

export default FollowingFeed;
