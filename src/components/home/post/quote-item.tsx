"use client";

import { User } from "lucia";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Divider } from "@nextui-org/react";

import { cn } from "@/lib/utils";
import PostInfo from "./post-info";
import PostMedia from "./media/post-media";
import Linkify from "@/components/linkify";
import { Like, Quote, Repost } from "@/types";
import useMediaURL from "@/hooks/useMediaURL";
import QuotePreview from "./quote-preview/quote-preview";
import LikeButton from "./engagement-button/like/like-button";
import MoreButton from "./engagement-button/more/more-button";
import ViewButton from "./engagement-button/view/view-button";
import ShareButton from "./engagement-button/share/share-button";
import ReplyButton from "./engagement-button/reply/reply-button";
import RepostButton from "./engagement-button/repost/repost-button";
import CompactQuotePreview from "./quote-preview/compact-post-preview";
import BookmarkButton from "./engagement-button/bookmark/bookmark-button";

type Props = {
  loggedInUser: User;
  post: {
    id: string;
    content: string;
    media: string | null;
    createdAt: Date;
    parentPostId: string | null;
    rootPostId: string;
    postType: string;
    replyCount: number;
    repost: Repost[] | null;
    like: Like[] | null;
    quote: Quote[] | null;
  };
  user: {
    id: string;
    name: string;
    photo: string | null;
    username: string;
  };
  quotedPost: {
    id: string;
    media: string | null;
    content: string;
    createdAt: Date;
  };
  quotedUser: {
    id: string;
    name: string;
    username: string;
    photo: string | null;
  };
  showLine?: boolean;
  showBorderBottom?: boolean;
};

const QuoteItem = ({
  loggedInUser,
  post,
  user,
  quotedPost,
  quotedUser,
  showLine = false,
  showBorderBottom = true,
}: Props) => {
  const router = useRouter();

  const { newMedia } = useMediaURL(post.media);

  const handleClick = () => {
    const cleanUsername = user.username.slice(1);
    router.push(`/${cleanUsername}/status/${post.id}`);
  };

  return (
    <article
      onClick={() => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          return;
        }
        handleClick();
      }}
      className={cn(
        showBorderBottom && "border-b",
        "px-4 transition-colors cursor-pointer hover:bg-hover/25 focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      )}
      tabIndex={0}
      aria-labelledby="name username posted-at caption container-quote"
      role="article"
    >
      <div className="flex h-full pt-3">
        {/* This div below used to have overflow-clip */}
        <div className="relative mr-2 select-none">
          <div className="w-10 h-10">
            <Image
              src={`https://wsrv.nl/?url=${user?.photo}`}
              alt={`${user.username} avatar`}
              width={40}
              height={40}
              aria-label="Avatar"
              className="z-20 rounded-full absolute"
              priority
            />
          </div>
          {showLine && (
            <Divider
              orientation="vertical"
              className="w-[2px] bg-border absolute left-[50%] translate-x-[-50%] top-2 z-10"
            />
          )}
        </div>
        <div className="flex flex-col w-full pb-1">
          <PostInfo
            post={{
              postId: post.id,
              createdAt: post.createdAt,
            }}
            user={{
              userId: user.id,
              name: user.name,
              username: user.username,
            }}
          />
          <div className="w-full space-y-3">
            {post.content.length > 0 && (
              <Linkify>
                <p
                  className="text-[15px] text-white leading-5 text-pretty whitespace-pre-wrap"
                  id="caption"
                >
                  {post.content}
                </p>
              </Linkify>
            )}
            {newMedia && newMedia.length > 0 && (
              <PostMedia
                mediaURLs={newMedia}
                usernameWithoutAt={user.username}
                postId={post.id}
              />
            )}
          </div>
          {newMedia && (
            <CompactQuotePreview
              post={{
                postId: quotedPost.id,
                content: quotedPost.content,
                media: quotedPost.media,
                createdAt: quotedPost.createdAt,
              }}
              user={{
                userId: quotedUser.id,
                name: quotedUser.name,
                username: quotedUser.username,
                photo: quotedUser.photo,
              }}
            />
          )}
          {!newMedia && (
            <QuotePreview
              post={{
                id: quotedPost.id,
                content: quotedPost.content,
                media: quotedPost.media,
                createdAt: quotedPost.createdAt,
                nestedPostId: null,
              }}
              user={{
                id: quotedUser.id,
                name: quotedUser.name,
                username: quotedUser.username,
                photo: quotedUser.photo,
                nestedUsername: null,
              }}
            />
          )}
          {/* Post action */}
          <div className="flex items-center justify-between w-full gap-4 mt-1">
            <ReplyButton
              loggedInUser={loggedInUser}
              post={{
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                rootPostId: post.rootPostId,
                replyCount: post.replyCount,
              }}
              user={{
                name: user.name,
                username: user.username,
                photo: user.photo,
              }}
              initialReplyCount={post.replyCount}
              size="sm"
            />
            <RepostButton
              postId={post.id}
              loggedInUser={loggedInUser}
              size="sm"
              originalPost={{
                userId: user.id,
                content: post.content,
                createdAt: post.createdAt,
                photo: user.photo,
                username: user.username,
                media: post.media,
                name: user.name,
              }}
              initialRepost={{
                repostCount: post.repost ? post.repost.length : 0,
                isRepostedByUser: post.repost
                  ? post.repost.some((r) => r.userOriginId === loggedInUser.id)
                  : false,
              }}
              initialQuote={{
                quoteCount: post.quote ? post.quote.length : 0,
                isQuotedByUser: post.quote
                  ? post.quote.some((q) => q.userOriginId === loggedInUser.id)
                  : false,
              }}
            />
            <LikeButton
              postId={post.id}
              initialLike={{
                likeCount: post.like ? post.like.length : 0,
                isLikedByUser: post.like
                  ? post.like.some((l) => l.userOriginId === loggedInUser.id)
                  : false,
              }}
              size="sm"
            />
            <ViewButton size="sm" />
            <div className="flex -space-x-1 -mr-[9px]">
              <BookmarkButton size="sm" />
              <ShareButton size="sm" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default QuoteItem;
