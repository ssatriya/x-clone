"use client";

import { User } from "lucia";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { CustomPost } from "@/types";
import PostItem from "@/components/home/post/post-item";
import QuoteItem from "@/components/home/post/quote-item";
import RepostItem from "@/components/home/post/repost-item";
import InfiniteScrollContainer from "@/components/infinite-scroll-container";

type Props = {
  username: string;
  loggedInUser: User;
};

const ProfileReplies = ({ username, loggedInUser }: Props) => {
  const { data, isLoading, hasNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["profile-replies", username],
      queryFn: ({ pageParam = 0 }) =>
        kyInstance
          .get(`/api/profile/replies`, {
            searchParams: {
              username: username,
              offset: pageParam,
            },
          })
          .json<{ nextOffset: number; posts: CustomPost[] }>(),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.nextOffset !== null ? lastPage.nextOffset : undefined;
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
        <span className="loader" />
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
                  media: post.postMedia,
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
                  media: post.postMedia,
                  postType: post.postType,
                  content: post.postContent,
                  createdAt: post.createdAt,
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
                  media: post.postMedia,
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
                quotedPost={{
                  id: post.originalPostId,
                  content: post.originalPostContent,
                  media: post.originalPostMedia,
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
                  media: post.originalPostMedia,
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

export default ProfileReplies;
