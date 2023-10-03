"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { LikePayload } from "@/lib/validator/like";
import { Like, Repost, User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";

import axios from "axios";
import * as React from "react";
import { toast } from "sonner";
import { Counter } from "../../framer-motion/counter";
import LikeButton from "./like-button";
import RepostButton from "./repost-button";
import { ExtendedPost } from "@/types/db";

type PostActionButtonProps = {
  post: ExtendedPost;
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
