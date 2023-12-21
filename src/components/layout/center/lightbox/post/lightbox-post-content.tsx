"use client";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import {
  cn,
  formatSinglePostDate,
  formatTimeToNow,
  removeAtSymbol,
} from "@/lib/utils";
import Link from "next/link";

import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { Post } from "@prisma/client";
import UserPostAvatar from "../../user-post-avatar";
import UserPostName from "../../user-post-name";
import AttachmentPost from "../../post-attachment";
import PostActionButton from "../../action-button/post-action-button";
import { Button, Divider } from "@nextui-org/react";
import InlineReplyFormEditor from "../../../reply/inline-reply/inline-reply-form-editor";
import { Icons } from "@/components/icons";

type LightboxPostContentProps = {
  post: ExtendedPostWithoutUserTwo;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
  classNames?: string;
};

export default function LightboxPostContent({
  post,
  currentUser,
  userPosted,
  classNames,
}: LightboxPostContentProps) {
  const usernameWithoutAt = removeAtSymbol(post.user_one.username);
  const postURL = `/${usernameWithoutAt}/status/${post.id}`;

  const cfg = {};

  let html = "";
  // @ts-ignore
  if (post.content && post.content.ops) {
    // @ts-ignore
    const converter = new QuillDeltaToHtmlConverter(post.content.ops, cfg);
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
      {/* <Link href={postURL} className="absolute inset-0" /> */}

      <div className="w-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <UserPostAvatar
              currentUser={currentUser}
              user={post.user_one}
              userPosted={userPosted}
              usernameWithoutAt={usernameWithoutAt}
            />
            <UserPostName
              currentUser={currentUser}
              post={post}
              usernameWithoutAt={usernameWithoutAt}
              lightbox={true}
              align="COLUMN"
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
              {formatSinglePostDate(post.createdAt)}
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
