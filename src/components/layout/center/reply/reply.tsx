"use client";

import * as React from "react";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import ReplyItem from "./reply-item";

type ReplyProps = {
  currentUser: UserWithFollowersFollowing;
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
};

export default function Reply({ post, currentUser }: ReplyProps) {
  const {
    data: replyData,
    isLoading,
    isInitialLoading,
  } = useQuery({
    queryKey: ["replyComment", post.id],
    queryFn: async () => {
      const { data } = await axios.get("/api/post/reply/post-reply", {
        params: {
          postId: post.id,
        },
      });

      return data as ExtendedPost[];
    },
  });

  if (isLoading || isInitialLoading) {
    return (
      <div className="h-full flex justify-center items-start mt-6">
        <Loader2 className="h-9 w-9 animate-spin stroke-blue" />
      </div>
    );
  }

  return (
    <>
      {replyData &&
        replyData.map((reply) => (
          <ReplyItem
            key={reply.id}
            currentUser={currentUser}
            post={reply}
            postUserOwner={reply.user_two}
            userPosted={reply.user_one.avatar}
            disabledNote={true}
          />
        ))}
    </>
  );
}
