"use client";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { cn, formatTimeToNow, removeAtSymbol } from "@/lib/utils";
import Link from "next/link";
import PostActionButton from "./action-button/post-action-button";
import AttachmentPost from "./attachment-post";
import UserPostAvatar from "./user-post-avatar";
import UserPostName from "./user-post-name";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { Post } from "@prisma/client";
import { useMediaQuery } from "@mantine/hooks";
import { Button } from "@nextui-org/react";
import { Icons } from "@/components/icons";

type PostProps = {
  post: ExtendedPostWithoutUserTwo;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
  classNames?: string;
};

export default function Post({
  post,
  currentUser,
  userPosted,
  classNames,
}: PostProps) {
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
        "relative hover:bg-hover/30 transition-colors cursor-pointer flex justify-between pt-3 px-4 gap-2"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Link href={postURL} className="absolute inset-0" />

      <UserPostAvatar
        currentUser={currentUser}
        user={post.user_one}
        userPosted={userPosted}
        usernameWithoutAt={usernameWithoutAt}
      />

      <div className="w-full flex flex-col">
        <div className="flex w-full justify-between">
          <div className="flex items-center gap-2">
            <UserPostName
              currentUser={currentUser}
              post={post}
              usernameWithoutAt={usernameWithoutAt}
              align="ROW"
            />
            <span className="text-gray">·</span>
            <p className="text-gray">
              {formatTimeToNow(new Date(post.createdAt))}
            </p>
          </div>
          <Button
            onClick={(e) => console.log("click")}
            isIconOnly
            size="sm"
            className="rounded-full bg-transparent hover:bg-blue/10 group"
          >
            <Icons.more className="h-4 w-4 fill-gray group-hover:fill-blue" />
          </Button>
        </div>
        <div className="flex flex-col space-y-3">
          <div>
            {html.length > 0 && (
              <div
                dangerouslySetInnerHTML={{ __html: html }}
                className="mobile:text-[15px] mobile:leading-5"
              />
            )}
          </div>
          {post.image_url && (
            <AttachmentPost imageUrl={post.image_url} post={post} />
          )}
        </div>
        <PostActionButton
          post={post}
          currentUser={currentUser}
          reposts={post.reposts}
        />
      </div>
    </div>
  );
}
