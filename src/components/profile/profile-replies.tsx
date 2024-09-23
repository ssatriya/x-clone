"use client";

import { User } from "lucia";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { CustomPost } from "@/types";
import PostItem from "../home/post/post-item";
import QuoteItem from "../home/post/quote-item";
import RepostItem from "../home/post/repost-item";
import InfiniteScrollContainer from "../infinite-scroll-container";

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
                  bio: "",
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

export default ProfileReplies;
