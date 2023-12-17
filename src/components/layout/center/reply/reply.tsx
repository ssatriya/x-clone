"use client";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import ReplyItem from "./reply-item";
import { Post as PostSchema } from "@prisma/client";
import Post from "../post/Post.1";

type ReplyProps = {
  currentUser: UserWithFollowersFollowing;
  post: ExtendedPostWithoutUserTwo;
};

export default function Reply({ post, currentUser }: ReplyProps) {
  const hasReplys = post.replys.length > 0;

  const { data: replyData, isLoading } = useQuery({
    queryKey: ["replyComment"],
    queryFn: async () => {
      const { data } = await axios.get("/api/post/reply/post-reply", {
        params: {
          postId: post.id,
        },
      });

      return data as ExtendedPost[];
    },
    enabled: !!hasReplys,
  });

  if (!!hasReplys) {
    if (isLoading) {
      return (
        <div className="h-full flex justify-center items-start mt-6">
          <Loader2 className="h-9 w-9 animate-spin stroke-blue" />
        </div>
      );
    }
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
