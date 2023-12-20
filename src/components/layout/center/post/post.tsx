"use client";

import * as React from "react";

import {
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { cn, formatTimeToNow, removeAtSymbol } from "@/lib/utils";
import PostActionButton from "./action-button/post-action-button";
import AttachmentPost from "./attachment-post";
import UserPostAvatar from "./user-post-avatar";
import UserPostName from "./user-post-name";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { Post } from "@prisma/client";
import { Button } from "@nextui-org/react";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { usePrevPath } from "@/hooks/usePrevPath";

import { usePathname } from "next/navigation";
import { usePhotoNumber } from "@/hooks/usePhotoNumber";

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
  const path = usePathname();
  const usernameWithoutAt = removeAtSymbol(post.user_one.username);

  const photoNumber = usePhotoNumber((state) => state.photoNumber);

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

  const { prevPath } = usePrevPath((state) => state);
  const onPostClick = () => {
    prevPath(path);
  };

  return (
    <div
      className={cn(
        classNames,
        "relative hover:bg-hover/30 transition-colors cursor-pointer flex justify-between pt-3 px-4 gap-2"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Link href={postURL} onClick={onPostClick} className="absolute inset-0" />
      <div className="z-20 h-fit">
        <UserPostAvatar
          currentUser={currentUser}
          user={post.user_one}
          userPosted={userPosted}
          usernameWithoutAt={usernameWithoutAt}
        />
      </div>
      <div className="w-full flex flex-col h-full">
        <div className="flex w-full justify-between">
          <div className="flex items-center gap-2 z-20">
            <UserPostName
              currentUser={currentUser}
              post={post}
              usernameWithoutAt={usernameWithoutAt}
              align="ROW"
            />
            <span className="text-gray">·</span>
            <p className="text-gray w-fit">
              {formatTimeToNow(new Date(post.createdAt))}
            </p>
          </div>
          <div className="relative right-8 bottom-1">
            <Button
              isIconOnly
              size="sm"
              className="absolute rounded-full bg-transparent data-[hover=true]:bg-blue/10 group"
            >
              <Icons.more className="h-4 w-4 fill-gray group-data-[hover=true]:fill-blue" />
            </Button>
          </div>
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
            <AttachmentPost
              currentUser={currentUser}
              imageUrl={post.image_url}
              post={post}
            />
          )}
        </div>
        <div>
          <PostActionButton
            post={post}
            currentUser={currentUser}
            reposts={post.reposts}
          />
        </div>
      </div>
    </div>
  );
}
