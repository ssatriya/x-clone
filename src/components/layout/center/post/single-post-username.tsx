import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import UserTooltip from "../user-tooltip";
import Link from "next/link";

type SinglePostUsernameProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  usernameWithoutAt: string;
  currentUser: UserWithFollowersFollowing;
};

export default function SinglePostUsername({
  currentUser,
  post,
  usernameWithoutAt,
}: SinglePostUsernameProps) {
  return (
    <div className="flex flex-col">
      <UserTooltip user={post.user_one} currentUser={currentUser}>
        <Link
          href={`/${usernameWithoutAt}`}
          className="font-bold z-10 hover:underline focus-visible:ring-0 text-[15px] leading-5"
        >
          {post.user_one.name}
        </Link>
      </UserTooltip>
      <UserTooltip user={post.user_one} currentUser={currentUser}>
        <Link
          href={`/${usernameWithoutAt}`}
          className="text-gray focus-visible:ring-0 z-10 text-[15px] leading-5"
        >
          {post.user_one.username}
        </Link>
      </UserTooltip>
    </div>
  );
}
