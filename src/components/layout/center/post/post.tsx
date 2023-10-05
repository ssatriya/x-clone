"use client";

import { Avatar } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import NextImage from "next/image";

import { User } from "@prisma/client";

import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { formatTimeToNow, removeAtSymbol } from "@/lib/utils";
import UserTooltip from "../user-tooltip";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PostActionButton from "./action-button/post-action-button";

type PostProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
};

export default function Post({ post, currentUser, userPosted }: PostProps) {
  const router = useRouter();
  const usernameWithoutAt = removeAtSymbol(post.user_one.username);

  const postURL = `/${usernameWithoutAt}/status/${post.id}`;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log(e.target);
    router.push(postURL);
  };

  return (
    <div
      onClick={handleClick}
      className="hover:bg-hover/30 transition-colors cursor-pointer flex justify-between pt-3 px-4 gap-4 border-b"
    >
      <div className="h-fit">
        <UserTooltip user={post.user_one} currentUser={currentUser}>
          <Link href={`/${usernameWithoutAt}`}>
            <Avatar showFallback src={userPosted} />
          </Link>
        </UserTooltip>
      </div>

      <div className="w-full flex flex-col">
        <div className="flex items-center gap-2">
          <UserTooltip user={post.user_one} currentUser={currentUser}>
            <Link
              href={`/${usernameWithoutAt}`}
              className="font-bold hover:underline focus-visible:ring-0"
            >
              {post.user_one.name}
            </Link>
          </UserTooltip>
          <UserTooltip user={post.user_one} currentUser={currentUser}>
            <Link
              href={`/${usernameWithoutAt}`}
              className="text-gray focus-visible:ring-0"
            >
              {post.user_one.username}
            </Link>
          </UserTooltip>
          <span className="text-gray">·</span>
          <p className="text-gray">
            {formatTimeToNow(new Date(post.createdAt))}
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <p>{post.content}</p>
          {post.image_url && (
            <Image
              as={NextImage}
              src={post.image_url}
              height={670}
              width={512}
              alt="img"
              className="border object-contain"
            />
          )}
        </div>
        <PostActionButton
          post={post}
          currentUserId={currentUser.id}
          reposts={post.reposts}
        />
      </div>
    </div>
  );
}
