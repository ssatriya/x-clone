import Link from "next/link";
import UserTooltip from "../user-tooltip";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { truncateString } from "@/lib/utils";

type UserPostNameProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  usernameWithoutAt: string;
  currentUser: UserWithFollowersFollowing;
  lightbox?: boolean;
  align: "ROW" | "COLUMN";
};

export default function UserPostName({
  post,
  usernameWithoutAt,
  currentUser,
  lightbox,
  align,
}: UserPostNameProps) {
  if (align === "ROW") {
    return (
      <>
        <UserTooltip user={post.user_one} currentUser={currentUser}>
          <Link
            href={`/${usernameWithoutAt}`}
            className="font-bold z-10 hover:underline focus-visible:ring-0"
          >
            {lightbox
              ? truncateString(post.user_one.name, 8)
              : post.user_one.name}
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

  if (align === "COLUMN") {
    return (
      <div className="flex flex-col">
        <UserTooltip user={post.user_one} currentUser={currentUser}>
          <Link
            href={`/${usernameWithoutAt}`}
            className="font-bold z-10 hover:underline focus-visible:ring-0 text-[15px] leading-5"
          >
            {lightbox
              ? truncateString(post.user_one.name, 8)
              : post.user_one.name}
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
}
