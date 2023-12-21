"use client";

import { ExtendedPost, UserWithFollowersFollowing } from "@/types/db";
import { cn, formatSinglePostDate, removeAtSymbol } from "@/lib/utils";

import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import UserPostAvatar from "../../post/user-post-avatar";

import PostActionButton from "../../action-button/post-action-button";
import { Button, Divider } from "@nextui-org/react";
import InlineReplyFormEditor from "../../reply/inline-reply/inline-reply-form-editor";
import { Icons } from "@/components/icons";
import PostUsername from "../../username/post-username";

type LightboxQuoteContentProps = {
  post: ExtendedPost;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
  classNames?: string;
};

export default function LightboxQuoteContent({
  post,
  currentUser,
  userPosted,
  classNames,
}: LightboxQuoteContentProps) {
  const usernameWithoutAt = removeAtSymbol(post.user_two.username);
  const postURL = `/${usernameWithoutAt}/status/${post.id}`;

  const cfg = {};

  let html = "";
  // @ts-ignore
  if (post.original_repost && post.original_repost.content) {
    const converter = new QuillDeltaToHtmlConverter(
      // @ts-ignore
      post.original_repost.content?.ops,
      cfg
    );
    const converted = converter.convert();
    if (converted !== "<p><br/></p>") {
      html = converted;
    }
  }

  return (
    <div
      className={cn(
        classNames,
        "relative hover:bg-hover/30 transition-colors flex justify-between gap-2 px-4 cursor-default"
      )}
    >
      <div className="w-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <UserPostAvatar
              currentUser={currentUser}
              user={post.user_two}
              userPosted={post.user_two.avatar}
              usernameWithoutAt={usernameWithoutAt}
            />
            <PostUsername
              currentUser={currentUser}
              userFollowers={post.user_two.followers}
              userFollowing={post.user_two.following}
              userId={post.user_two.id}
              username={post.user_two.username}
              name={post.user_two.name}
              bio={post.user_two.bio}
              avatar={post.user_two.avatar}
              align="column"
            />
          </div>
          <div className="flex items-center">
            <Button
              size="sm"
              radius="full"
              className="font-bold text-sm leading-4 bg-text text-black"
            >
              Subscribe
            </Button>
            <Button
              isIconOnly
              size="sm"
              className="rounded-full bg-transparent hover:bg-blue/10 group"
            >
              <Icons.more className="h-4 w-4 fill-gray group-hover:fill-blue" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <div className="mt-3">
            {html.length > 0 && (
              <div
                dangerouslySetInnerHTML={{ __html: html }}
                className="text-[17px] leading-6 cursor-text"
              />
            )}
          </div>
          <div>
            <p className="text-gray text-[15px] leading-5">
              {formatSinglePostDate(post.original_repost?.createdAt!)}
            </p>
          </div>
          <Divider orientation="horizontal" className="bg-border h-[1px]" />
          <PostActionButton
            post={post}
            currentUser={currentUser}
            reposts={post.reposts}
          />
          <InlineReplyFormEditor currentUser={currentUser} post={post} />
        </div>
      </div>
    </div>
  );
}
