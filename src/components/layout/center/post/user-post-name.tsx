import Link from "next/link";
import UserTooltip from "../user-tooltip";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { truncateString } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";

type UserPostNameProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  usernameWithoutAt: string;
  currentUser: UserWithFollowersFollowing;
  lightbox?: boolean;
  align: "ROW" | "COLUMN";
  truncate?: boolean;
};

export default function UserPostName({
  post,
  usernameWithoutAt,
  currentUser,
  lightbox,
  align,
  truncate = false,
}: UserPostNameProps) {
  const isMobile = useMediaQuery("(max-width: 420px)");

  if (align === "ROW") {
    return (
      <>
        <UserTooltip user={post.user_one} currentUser={currentUser}>
          <Link
            href={`/${usernameWithoutAt}`}
            className="font-bold z-10 hover:underline focus-visible:ring-0 mobile:text-[15px] mobile:leading-5"
          >
            {truncate || isMobile
              ? truncateString(post.user_one.name, 12)
              : post.user_one.name}
          </Link>
        </UserTooltip>
        <UserTooltip user={post.user_one} currentUser={currentUser}>
          <Link
            href={`/${usernameWithoutAt}`}
            className="text-gray focus-visible:ring-0 z-10 mobile:text-[15px] mobile:leading-5"
          >
            {truncate || isMobile
              ? truncateString(post.user_one.username, 13)
              : post.user_one.username}
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
