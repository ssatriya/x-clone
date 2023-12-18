"use client";

import Link from "next/link";
import UserTooltip from "../user-tooltip";
import { UserWithFollowersFollowing } from "@/types/db";
import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

type UserPostAvatarProps = {
  user: UserWithFollowersFollowing;
  usernameWithoutAt: string;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
};

export default function UserPostAvatar({
  user,
  usernameWithoutAt,
  userPosted,
  currentUser,
}: UserPostAvatarProps) {
  const avatarUrl = React.useMemo(() => {
    return userPosted;
  }, [userPosted]);

  return (
    <UserTooltip user={user} currentUser={currentUser}>
      <Link href={`/${usernameWithoutAt}`}>
        {/* <Avatar showFallback src={avatarUrl} /> */}
        <div className="w-10 h-10">
          <Image
            src={avatarUrl}
            height={40}
            width={40}
            priority
            alt="avatar"
            className="rounded-full"
          />
        </div>
      </Link>
    </UserTooltip>
  );
}
