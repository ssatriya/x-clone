import Link from "next/link";
import UserTooltip from "../user-tooltip";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";

type UserPostNameProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  usernameWithoutAt: string;
  userPosted: string;
  currentUser: UserWithFollowersFollowing;
};

export default function UserPostName({
  post,
  usernameWithoutAt,
  currentUser,
}: UserPostNameProps) {
  return (
    <>
      <UserTooltip user={post.user_one} currentUser={currentUser}>
        <Link
          href={`/${usernameWithoutAt}`}
          className="font-bold z-10 hover:underline focus-visible:ring-0"
        >
          {post.user_one.name}
        </Link>
      </UserTooltip>
      <UserTooltip user={post.user_one} currentUser={currentUser}>
        <Link
          href={`/${usernameWithoutAt}`}
          className="text-gray focus-visible:ring-0 z-10"
        >
          {post.user_one.username}
        </Link>
      </UserTooltip>
    </>
  );
}
