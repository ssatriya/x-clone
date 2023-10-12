"use client";

import { Icons } from "@/components/icons";
import { Repost, User } from "@prisma/client";
import { Button } from "@nextui-org/react";

import * as React from "react";
import LikeButton from "./like-button";
import RepostButton from "./repost-button";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import ReplyButton from "./reply-button";

type PostActionButtonProps = {
  post: ExtendedPostWithoutUserTwo;
  currentUser: UserWithFollowersFollowing;
  reposts: Repost[];
  customClass?: string;
};

export default function PostActionButton({
  post,
  currentUser,
  reposts,
  customClass,
}: PostActionButtonProps) {
  return (
    <div className="w-full flex justify-between items-center gap-4 py-2">
      <ReplyButton
        currentUser={currentUser}
        post={post}
        customClass={customClass}
      />
      <RepostButton currentUser={currentUser} post={post} reposts={reposts} />
      <LikeButton currentUser={currentUser} post={post} />

      <div className="flex items-center group">
        <Button
          size="sm"
          isIconOnly
          className="rounded-full bg-transparent flex items-center justify-center gap-2 group-hover:bg-blue/10"
        >
          <Icons.view className="fill-gray w-[18px] h-[18px] group-hover:fill-blue" />
        </Button>
        <p className="text-sm text-gray group-hover:text-blue">4</p>
      </div>

      <div className="flex items-center group">
        <Button
          size="sm"
          isIconOnly
          className="rounded-full bg-transparent flex items-center justify-center gap-2 group-hover:bg-blue/10"
        >
          <Icons.share className="fill-gray w-[18px] h-[18px] group-hover:fill-blue" />
        </Button>
      </div>
    </div>
  );
}
