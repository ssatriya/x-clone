import { Avatar } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ExtendedPost, RepostPost } from "@/types/db";
import { formatTimeToNow, removeAtSymbol } from "@/lib/utils";
import { User } from "@prisma/client";
import PostActionButton from "./action-button/post-action-button";
import UserTooltip from "./user-tooltip";
import Link from "next/link";

type RepostProps = {
  post: ExtendedPost;
  userPosted: string;
  currentUser: User;
  postUserOwnser: User;
};

export default function Repost({
  post,
  userPosted,
  currentUser,
  postUserOwnser,
}: RepostProps) {
  const usernameWithoutAt = removeAtSymbol(post.user_one.username);

  return (
    <div className="hover:bg-hover/30 transition-colors cursor-pointer flex justify-between pt-2 px-4 gap-4 border-b">
      <div className="h-fit">
        <UserTooltip user={post.user_one}>
          <Link href={`/${usernameWithoutAt}`}>
            <Avatar showFallback src={userPosted} />
          </Link>
        </UserTooltip>
      </div>

      <div className="w-full flex flex-col">
        <div className="flex items-center gap-2">
          <UserTooltip user={post.user_one}>
            <Link
              href={`/${usernameWithoutAt}`}
              className="font-bold hover:underline focus-visible:ring-0"
            >
              {post.user_one.name}
            </Link>
          </UserTooltip>
          <UserTooltip user={post.user_one}>
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
          <div className="hover:bg-[#0e0e0e] transition-colors cursor-pointer flex h-fit overflow-hidden flex-col justify-between py-4 px-4 mt-2 border rounded-xl border-[#2f3336]">
            <div className="flex gap-2 items-center mb-1">
              <Avatar
                className="w-5 h-5"
                showFallback
                src={postUserOwnser.avatar}
                size="sm"
              />
              <div className="flex items-center gap-2">
                <p className="font-bold">{postUserOwnser.name}</p>
                <p className="text-[#555b61]">{postUserOwnser.username}</p>
                <span>·</span>
                <p className="text-[#555b61]">
                  {post.createdAt && formatTimeToNow(new Date(post.createdAt))}
                </p>
              </div>
            </div>
            <div className="flex flex-col">
              <p>{post.content}</p>
              {post?.image_url && (
                <div className="flex justify-center">
                  {/* <Image
              src={repost.image_url}
              height={550}
              alt="img"
              className="object-contain rounded-2xl mt-2"
            /> */}
                </div>
              )}
            </div>
          </div>
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
