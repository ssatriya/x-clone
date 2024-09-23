"use client";

import { User } from "lucia";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { ReplyContext } from "@/types";
import PostItem from "../post/post-item";
import { useEffect } from "react";

type Props = {
  postId: string;
  loggedInUser: User;
};

const DescendantPost = ({ postId, loggedInUser }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = ["get-descendants-reply", postId];

  const { data, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/post/reply/descendants?postId=${postId}`)
        .json<{ descendants: ReplyContext[] }>(),
  });

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey });
    };
  }, []);

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center w-full h-32">
          <span className="loader"></span>
        </div>
      )}
      {!isLoading &&
        data?.descendants?.map((descendant) => (
          <PostItem
            key={descendant.postId}
            loggedInUser={loggedInUser}
            post={{
              id: descendant.postId,
              content: descendant.content,
              createdAt: descendant.createdAt,
              media: descendant.media,
              parentPostId: descendant.parentPostId,
              rootPostId: descendant.rootPostId,
              postType: descendant.postType,
              like: descendant.like,
              quote: descendant.quote,
              repost: descendant.repost,
              replyCount: descendant.replyCount,
            }}
            user={{
              id: descendant.userId,
              name: descendant.name,
              username: descendant.username,
              photo: descendant.photo,
            }}
            showLine={descendant.showLine}
            showBorderBottom={!descendant.showLine}
          />
        ))}
    </>
  );
};

export default DescendantPost;
