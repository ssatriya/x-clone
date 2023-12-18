"use client";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import SinglePost from "../../post/single-post";
import Reply from "../reply";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Post from "../../post/post";
import * as React from "react";

type InlineReplyProps = {
  currentUser: UserWithFollowersFollowing;
  post: ExtendedPostWithoutUserTwo;
};

export default function InlineReply({ currentUser, post }: InlineReplyProps) {
  const queryClient = useQueryClient();

  const isEnabled = post.original_replied_post_id;

  const { data: repliedToPost } = useQuery({
    queryKey: ["repliedToPost", post],
    queryFn: async () => {
      if (!post.original_replied_post_id) {
        return null;
      }
      const { data } = await axios.get("/api/post/reply/replied-to", {
        params: {
          originalRepliedPostId: post.original_replied_post_id,
        },
      });
      return data as ExtendedPost;
    },
    enabled: !!isEnabled,
  });

  React.useEffect(() => {
    return () => {
      queryClient.clear();
    };
  }, [queryClient]);

  return (
    <>
      {repliedToPost && post.original_replied_post_id && (
        <Post
          currentUser={currentUser}
          post={repliedToPost}
          userPosted={repliedToPost.user_one.avatar}
        />
      )}
      <div className="min-h-screen">
        <SinglePost currentUser={currentUser} post={post} />
        <Reply post={post} currentUser={currentUser} />
      </div>
    </>
  );
}
