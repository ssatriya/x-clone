"use client";

import { Icons } from "@/components/icons";
import { Repost } from "@prisma/client";
import { Button } from "@nextui-org/react";

import * as React from "react";
import { toast } from "sonner";
import LikeButton from "./like-button";
import RepostButton from "./repost-button";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";

type PostActionButtonProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUserId: string;
  reposts: Repost[];
};

export default function PostActionButton({
  post,
  currentUserId,
  reposts,
}: PostActionButtonProps) {
  return (
    <div className="w-full flex justify-between items-center gap-4 py-2">
      <div className="flex items-center group">
        <Button
          size="sm"
          isIconOnly
          className="rounded-full bg-transparent flex items-center justify-center gap-2 group-hover:bg-blue/10"
        >
          <Icons.reply className="fill-gray w-[18px] h-[18px] group-hover:fill-blue" />
        </Button>
        <p className="text-sm text-gray group-hover:text-blue">4</p>
      </div>

      <RepostButton
        currentUserId={currentUserId}
        post={post}
        reposts={reposts}
      />

      <LikeButton currentUserId={currentUserId} post={post} />

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
