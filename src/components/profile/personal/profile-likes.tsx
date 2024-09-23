"use client";

import { User } from "lucia";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { ProfilePostLikes } from "@/types";
import PostItem from "@/components/home/post/post-item";
import QuoteItem from "@/components/home/post/quote-item";
import RepostItem from "@/components/home/post/repost-item";
import InfiniteScrollContainer from "@/components/infinite-scroll-container";

type Props = {
  loggedInUser: User;
  username: string;
};

const ProfileLikes = ({ loggedInUser, username }: Props) => {
  const queryKey = ["liked-posts", username];

  const { data, isLoading, hasNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: queryKey,
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            "/api/profile/likes",
            pageParam
              ? {
                  searchParams: {
                    cursor: encodeURIComponent(pageParam),
                    username: username,
                  },
                }
              : {
                  searchParams: {
                    username: username,
                  },
                }
          )
          .json<{ nextCursor: string; likedPosts: ProfilePostLikes[] }>(),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: 10,
      placeholderData: keepPreviousData,
    });

  const likedPosts = data?.pages.flatMap((page) => page.likedPosts) || [];

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
      {!isLoading &&
        likedPosts.map((post) => {
          const p = post.post;
          const {
            originalPostId,
            originalPostContent,
            originalPostMedia,
            originalPostCreatedAt,
            originalReplyCount,
            originalLike,
            originalQuote,
            originalRepost,
            originalRootPostId,
            originalName,
            originalUsername,
            originalPhoto,
            originalUserId,
          } = post.quoted;

          if (p.postType === "post") {
            return (
              <PostItem
                key={p.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: p.postId,
                  content: p.postContent,
                  createdAt: p.postCreatedAt,
                  media: p.postMedia,
                  parentPostId: p.parentPostId,
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
          }
          if (p.postType === "reply") {
            return (
              <PostItem
                key={p.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: p.postId,
                  content: p.postContent,
                  createdAt: p.postCreatedAt,
                  media: p.postMedia,
                  parentPostId: p.parentPostId,
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
          }
          if (p.postType === "quote") {
            return (
              <QuoteItem
                key={p.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: p.postId,
                  like: post.like,
                  quote: post.quote,
                  media: p.postMedia,
                  repost: post.repost,
                  postType: p.postType,
                  content: p.postContent,
                  createdAt: p.postCreatedAt,
                  replyCount: post.replyCount,
                  parentPostId: p.parentPostId,
                  rootPostId: p.postRootPostId,
                }}
                user={{
                  id: p.userId,
                  name: p.name,
                  photo: p.photo,
                  username: p.username,
                }}
                quotedPost={{
                  id: originalPostId,
                  media: originalPostMedia,
                  content: originalPostContent,
                  createdAt: originalPostCreatedAt,
                }}
                quotedUser={{
                  id: originalUserId,
                  name: originalName,
                  photo: originalPhoto,
                  username: originalUsername,
                }}
              />
            );
          }
          if (p.postType === "repost") {
            return (
              <RepostItem
                key={p.postId}
                loggedInUser={loggedInUser}
                user={{
                  id: p.userId,
                  name: p.name,
                  photo: p.photo,
                  username: p.username,
                }}
                quotedPost={{
                  id: originalPostId,
                  like: originalLike,
                  quote: originalQuote,
                  repost: originalRepost,
                  media: originalPostMedia,
                  content: originalPostContent,
                  replyCount: originalReplyCount,
                  rootPostId: originalRootPostId,
                  createdAt: originalPostCreatedAt,
                }}
                quotedUser={{
                  id: originalUserId,
                  name: originalName,
                  username: originalUsername,
                  photo: originalPhoto || "",
                }}
              />
            );
          }
        })}
    </InfiniteScrollContainer>
  );
};

export default ProfileLikes;
