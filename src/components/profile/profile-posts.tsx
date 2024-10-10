"use client";

import { User } from "lucia";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { CustomPost } from "@/types";
import PostItem from "@/components/home/post/post-item";
import QuoteItem from "@/components/home/post/quote-item";
import RepostItem from "@/components/home/post/repost-item";
import InfiniteScrollContainer from "@/components/infinite-scroll-container";
import LoadingSpinner from "../loading-spinner";

type Props = {
  username: string;
  loggedInUser: User;
};

const ProfilePosts = ({ username, loggedInUser }: Props) => {
  const { data, isLoading, hasNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["profile-posts", username],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/profile/posts`,
            pageParam
              ? {
                  searchParams: {
                    username: username,
                    cursor: encodeURIComponent(pageParam),
                  },
                }
              : {
                  searchParams: {
                    username: username,
                  },
                }
          )
          .json<{ nextCursor: string; posts: CustomPost[] }>(),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: 10,
      placeholderData: keepPreviousData,
    });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-start justify-center mt-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {!isLoading &&
        posts.map((post) => {
          if (post.postType === "post") {
            return (
              <PostItem
                key={post.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: post.postId,
                  like: post.like,
                  quote: post.quote,
                  repost: post.repost,
                  media: post.media,
                  postType: post.postType,
                  content: post.postContent,
                  createdAt: post.createdAt,
                  rootPostId: post.rootPostId,
                  replyCount: post.replyCount,
                  parentPostId: post.parentPostId,
                }}
                user={{
                  id: post.userId,
                  name: post.name,
                  photo: post.photo,
                  username: post.username,
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
                  like: post.like,
                  quote: post.quote,
                  repost: post.repost,
                  media: post.media,
                  postType: post.postType,
                  createdAt: post.createdAt,
                  content: post.postContent,
                  replyCount: post.replyCount,
                  rootPostId: post.rootPostId,
                  parentPostId: post.parentPostId,
                }}
                user={{
                  id: post.userId,
                  name: post.name,
                  photo: post.photo,
                  username: post.username,
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
                  like: post.like,
                  quote: post.quote,
                  repost: post.repost,
                  media: post.media,
                  postType: post.postType,
                  createdAt: post.createdAt,
                  content: post.postContent,
                  rootPostId: post.rootPostId,
                  replyCount: post.replyCount,
                  parentPostId: post.parentPostId,
                }}
                user={{
                  id: post.userId,
                  name: post.name,
                  photo: post.photo,
                  username: post.username,
                }}
                quotedPost={{
                  id: post.originalPostId,
                  media: post.originalMedia,
                  content: post.originalPostContent,
                  createdAt: post.originalPostCreatedAt,
                }}
                quotedUser={{
                  id: post.originalUserId,
                  name: post.originalName,
                  photo: post.originalPhoto,
                  username: post.originalUsername,
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
                  photo: post.photo,
                  username: post.username,
                }}
                quotedPost={{
                  id: post.originalPostId,
                  like: post.originalLike,
                  quote: post.originalQuote,
                  repost: post.originalRepost,
                  media: post.originalMedia,
                  content: post.originalPostContent,
                  replyCount: post.originalReplyCount,
                  rootPostId: post.originalRootPostId,
                  createdAt: post.originalPostCreatedAt,
                }}
                quotedUser={{
                  id: post.originalUserId,
                  name: post.originalName,
                  photo: post.originalPhoto,
                  username: post.originalUsername,
                }}
              />
            );
          }
        })}
    </InfiniteScrollContainer>
  );
};

export default ProfilePosts;
