import Link from "next/link";
import UserTooltip from "../user-tooltip";
import { Avatar } from "@nextui-org/react";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";

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
  return (
    <UserTooltip user={user} currentUser={currentUser}>
      <Link href={`/${usernameWithoutAt}`}>
        <Avatar showFallback src={userPosted} />
      </Link>
    </UserTooltip>
  );
}
