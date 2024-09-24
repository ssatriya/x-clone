import Link from "next/link";
import { User } from "lucia";
import Image from "next/image";
import { Divider } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";

import PostInfo from "./post-info";
import Icons from "@/components/icons";
import Linkify from "@/components/linkify";
import PostMedia from "./media/post-media";
import useMediaURL from "@/hooks/useMediaURL";
import { cn, getBasePath } from "@/lib/utils";
import { Like, Quote, Repost } from "@/types";
import UserTooltip from "@/components/user-tooltip";
import LikeButton from "./engagement-button/like/like-button";
import ViewButton from "./engagement-button/view/view-button";
import ShareButton from "./engagement-button/share/share-button";
import ReplyButton from "./engagement-button/reply/reply-button";
import RepostButton from "./engagement-button/repost/repost-button";
import BookmarkButton from "./engagement-button/bookmark/bookmark-button";

type Props = {
  loggedInUser: User;
  user: {
    id: string;
    name: string;
    username: string;
    photo: string | null;
  };
  quotedPost: {
    id: string;
    createdAt: Date;
    replyCount: number;
    rootPostId: string;
    like: Like[] | null;
    media: string | null;
    quote: Quote[] | null;
    content: string | null;
    repost: Repost[] | null;
  };
  quotedUser: {
    id: string;
    name: string;
    photo: string | null;
    username: string;
  };
  showLine?: boolean;
  showBorderBottom?: boolean;
};

const RepostItem = ({
  loggedInUser,
  user,
  quotedPost,
  quotedUser,
  showLine = false,
  showBorderBottom = true,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const { newMedia } = useMediaURL(quotedPost.media);

  const basePath = getBasePath(pathname);

  const isOwnProfile = `/${loggedInUser.username.slice(1)}` === basePath;

  const handleClick = () => {
    const cleanUsername = quotedUser.username.slice(1);
    router.push(`/${cleanUsername}/status/${quotedPost.id}`);
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
        "px-4 transition-colors cursor-pointer hover:bg-hover/25 h-full"
      )}
      aria-label={`${quotedUser.name} ${quotedUser.username} ${quotedPost.createdAt}`}
      role="article"
      tabIndex={0}
    >
      <div className="flex flex-col pt-2">
        <div className="flex gap-2 px-4 w-full">
          <div className="w-6 flex justify-end">
            <Icons.repost className="w-4 h-4 fill-gray" />
          </div>
          <span className="text-gray text-[13px] font-bold leading-4">
            {isOwnProfile ? (
              <UserTooltip userId={user.id} username={user.username}>
                <Link
                  href={`/${user.username.slice(1)}`}
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  You reposted
                </Link>
              </UserTooltip>
            ) : (
              <UserTooltip userId={user.id} username={user.username}>
                <Link
                  href={`/${user.username.slice(1)}`}
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {user.name} reposted
                </Link>
              </UserTooltip>
            )}
          </span>
        </div>
        <div className="flex h-full">
          <div className="relative mr-2 select-none">
            <div className="w-10 h-10">
              <Image
                src={`https://wsrv.nl/?url=${quotedUser?.photo}`}
                alt={`${quotedUser.username} avatar`}
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
                postId: quotedPost.id,
                createdAt: quotedPost.createdAt,
              }}
              user={{
                name: quotedUser.name,
                userId: quotedUser.id,
                username: quotedUser.username,
              }}
            />
            <div className="w-full space-y-3">
              {quotedPost.content && (
                <div className="leading-5">
                  <Linkify>
                    <span className="text-[15px] text-text text-pretty whitespace-pre-wrap break-words">
                      {quotedPost.content}
                    </span>
                  </Linkify>
                </div>
              )}
              {newMedia && newMedia.length > 0 && (
                <PostMedia
                  mediaURLs={newMedia}
                  usernameWithoutAt={quotedUser.username.slice(1)}
                  postId={quotedPost.id}
                />
              )}
            </div>
            <div className="flex items-center justify-between w-full gap-4 mt-1">
              <ReplyButton
                loggedInUser={loggedInUser}
                post={{
                  id: quotedPost.id,
                  content: quotedPost.content,
                  createdAt: quotedPost.createdAt,
                  rootPostId: quotedPost.rootPostId,
                  replyCount: quotedPost.replyCount,
                }}
                user={{
                  name: user.name,
                  username: user.username,
                  photo: user.photo,
                }}
                initialReplyCount={quotedPost.replyCount}
                size="sm"
              />
              <RepostButton
                postId={quotedPost.id}
                loggedInUser={loggedInUser}
                size="sm"
                originalPost={{
                  userId: quotedUser.id,
                  name: quotedUser.name,
                  photo: quotedUser.photo,
                  media: quotedPost.media,
                  content: quotedPost.content,
                  username: quotedUser.username,
                  createdAt: quotedPost.createdAt,
                }}
                initialRepost={{
                  repostCount: quotedPost.repost ? quotedPost.repost.length : 0,
                  isRepostedByUser: quotedPost.repost
                    ? quotedPost.repost.some(
                        (r) => r.userOriginId === loggedInUser.id
                      )
                    : false,
                }}
                initialQuote={{
                  quoteCount: quotedPost.quote ? quotedPost.quote.length : 0,
                  isQuotedByUser: quotedPost.quote
                    ? quotedPost.quote.some(
                        (q) => q.userOriginId === loggedInUser.id
                      )
                    : false,
                }}
              />
              <LikeButton
                userId={quotedUser.id}
                postId={quotedPost.id}
                initialLike={{
                  likeCount: quotedPost.like ? quotedPost.like.length : 0,
                  isLikedByUser: quotedPost.like
                    ? quotedPost.like.some(
                        (l) => l.userOriginId === loggedInUser.id
                      )
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
      </div>
    </article>
  );
};

export default RepostItem;
