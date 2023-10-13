"use client";

import Link from "next/link";
import UserTooltip from "../user-tooltip";
import { Avatar } from "@nextui-org/react";
import { UserWithFollowersFollowing } from "@/types/db";
import * as React from "react";

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
        <Avatar showFallback src={avatarUrl} />
      </Link>
    </UserTooltip>
  );
}
