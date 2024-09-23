"use client";

import kyInstance from "@/lib/ky";
import { ReplyContext } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "lucia";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import PostItem from "../post/post-item";
import QuoteItem from "../post/quote-item";
import useScrollPosition from "@/hooks/useScrollPosition";

type Props = {
  postId: string;
  loggedInUser: User;
};

const AncestorPost = ({ postId, loggedInUser }: Props) => {
  const scrollY = useScrollPosition();
  const queryClient = useQueryClient();
  const ancestorRef = useRef<HTMLDivElement>(null);
  const scrollHeight = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [isUserScroll, setIsUserScrolled] = useState(0);

  const queryKey = ["get-ancestor-reply", postId];

  useEffect(() => {
    if (scrollY > 0) {
      setIsUserScrolled(scrollY);
    }
  }, [scrollY]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setReady(true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/post/reply/ancestors?postId=${postId}`)
        .json<{ ancestors: ReplyContext[] }>(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: ready,
  });

  useEffect(() => {
    const height = scrollHeight.current?.clientHeight;
    if (ancestorRef && ancestorRef.current && !isLoading) {
      if (!isLoading && isUserScroll === 0) {
        ancestorRef.current.scrollIntoView();
        return;
      } else if (!isLoading && isUserScroll > 0 && height) {
        const totalScroll = isUserScroll + height;
        window.scrollTo({ top: totalScroll });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={scrollHeight}>
      {!isLoading &&
        data?.ancestors.map((ancestor) => {
          if (ancestor.postType === "post") {
            return (
              // <div key={ancestor.postId} className=" bg-orange-400">
              <PostItem
                key={ancestor.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: ancestor.postId,
                  content: ancestor.content,
                  createdAt: ancestor.createdAt,
                  media: ancestor.media,
                  parentPostId: ancestor.parentPostId,
                  rootPostId: ancestor.rootPostId,
                  postType: ancestor.postType,
                  like: ancestor.like,
                  quote: ancestor.quote,
                  repost: ancestor.repost,
                  replyCount: ancestor.replyCount,
                }}
                user={{
                  id: ancestor.userId,
                  name: ancestor.name,
                  username: ancestor.username,
                  photo: ancestor.photo,
                }}
                showLine={ancestor.showLine}
                showBorderBottom={!ancestor.showLine}
              />
              // </div>
            );
          }
          if (ancestor.postType === "reply") {
            return (
              <PostItem
                key={ancestor.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: ancestor.postId,
                  content: ancestor.content,
                  createdAt: ancestor.createdAt,
                  media: ancestor.media,
                  parentPostId: ancestor.parentPostId,
                  rootPostId: ancestor.rootPostId,
                  postType: ancestor.postType,
                  like: ancestor.like,
                  quote: ancestor.quote,
                  repost: ancestor.repost,
                  replyCount: ancestor.replyCount,
                }}
                user={{
                  id: ancestor.userId,
                  name: ancestor.name,
                  username: ancestor.username,
                  photo: ancestor.photo,
                }}
                showLine={ancestor.showLine}
                showBorderBottom={!ancestor.showLine}
              />
            );
          }
          if (ancestor.postType === "quote") {
            return (
              <QuoteItem
                key={ancestor.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: ancestor.postId,
                  content: ancestor.content,
                  createdAt: ancestor.createdAt,
                  media: ancestor.media,
                  parentPostId: ancestor.parentPostId,
                  postType: ancestor.postType,
                  rootPostId: ancestor.rootPostId,
                  replyCount: ancestor.replyCount,
                  repost: ancestor.repost,
                  like: ancestor.like,
                  quote: ancestor.quote,
                }}
                user={{
                  id: ancestor.userId,
                  name: ancestor.name,
                  username: ancestor.username,
                  photo: ancestor.photo,
                }}
                quotedPost={{
                  id: ancestor.originalPostId,
                  content: ancestor.originalPostContent,
                  media: ancestor.originalPostMedia,
                  createdAt: ancestor.originalPostCreatedAt,
                }}
                quotedUser={{
                  id: ancestor.originalUserId,
                  name: ancestor.originalName,
                  username: ancestor.originalUsername,
                  photo: ancestor.originalPhoto,
                }}
                showLine={ancestor.showLine}
                showBorderBottom={!ancestor.showLine}
              />
            );
          }
        })}
      <div ref={ancestorRef} className="scroll-mt-[53px]" />
    </div>
  );
};

export default AncestorPost;
