"use client";

import { User } from "lucia";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { ReplyContext } from "@/types";
import PostItem from "@/components/home/post/post-item";
import QuoteItem from "@/components/home/post/quote-item";
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

  const { data, isLoading } = useQuery({
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
              <PostItem
                key={ancestor.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: ancestor.postId,
                  like: ancestor.like,
                  media: ancestor.media,
                  quote: ancestor.quote,
                  repost: ancestor.repost,
                  content: ancestor.content,
                  postType: ancestor.postType,
                  createdAt: ancestor.createdAt,
                  rootPostId: ancestor.rootPostId,
                  replyCount: ancestor.replyCount,
                  parentPostId: ancestor.parentPostId,
                }}
                user={{
                  id: ancestor.userId,
                  name: ancestor.name,
                  photo: ancestor.photo,
                  username: ancestor.username,
                }}
                showLine={ancestor.showLine}
                showBorderBottom={!ancestor.showLine}
              />
            );
          }
          if (ancestor.postType === "reply") {
            return (
              <PostItem
                key={ancestor.postId}
                loggedInUser={loggedInUser}
                post={{
                  id: ancestor.postId,
                  like: ancestor.like,
                  quote: ancestor.quote,
                  media: ancestor.media,
                  repost: ancestor.repost,
                  content: ancestor.content,
                  postType: ancestor.postType,
                  createdAt: ancestor.createdAt,
                  rootPostId: ancestor.rootPostId,
                  replyCount: ancestor.replyCount,
                  parentPostId: ancestor.parentPostId,
                }}
                user={{
                  id: ancestor.userId,
                  name: ancestor.name,
                  photo: ancestor.photo,
                  username: ancestor.username,
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
                  like: ancestor.like,
                  media: ancestor.media,
                  quote: ancestor.quote,
                  repost: ancestor.repost,
                  content: ancestor.content,
                  postType: ancestor.postType,
                  createdAt: ancestor.createdAt,
                  rootPostId: ancestor.rootPostId,
                  replyCount: ancestor.replyCount,
                  parentPostId: ancestor.parentPostId,
                }}
                user={{
                  id: ancestor.userId,
                  name: ancestor.name,
                  photo: ancestor.photo,
                  username: ancestor.username,
                }}
                quotedPost={{
                  id: ancestor.originalPostId,
                  media: ancestor.originalPostMedia,
                  content: ancestor.originalPostContent,
                  createdAt: ancestor.originalPostCreatedAt,
                }}
                quotedUser={{
                  id: ancestor.originalUserId,
                  name: ancestor.originalName,
                  photo: ancestor.originalPhoto,
                  username: ancestor.originalUsername,
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
