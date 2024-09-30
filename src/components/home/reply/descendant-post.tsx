"use client";

import { User } from "lucia";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { ReplyContext } from "@/types";
import PostItem from "@/components/home/post/post-item";

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

  // useEffect(() => {
  //   return () => {
  //     queryClient.resetQueries({ queryKey });
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center h-32">
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
              like: descendant.like,
              media: descendant.media,
              quote: descendant.quote,
              repost: descendant.repost,
              content: descendant.content,
              postType: descendant.postType,
              createdAt: descendant.createdAt,
              rootPostId: descendant.rootPostId,
              replyCount: descendant.replyCount,
              parentPostId: descendant.parentPostId,
            }}
            user={{
              id: descendant.userId,
              name: descendant.name,
              photo: descendant.photo,
              username: descendant.username,
            }}
            showLine={descendant.showLine}
            showBorderBottom={!descendant.showLine}
          />
        ))}
    </>
  );
};

export default DescendantPost;
