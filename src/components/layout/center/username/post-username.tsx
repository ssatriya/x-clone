"use client";

import { Followers, Following, UserWithFollowersFollowing } from "@/types/db";
import TooltipUsername from "./tooltip-username";
import Link from "next/link";
import { removeAtSymbol, truncateString } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";

type PostUsernameProps = {
  username: string;
  userId: string;
  userFollowers: Followers[];
  userFollowing: Following[];
  currentUser: UserWithFollowersFollowing;
  name: string;
  bio: string | null;
  avatar: string;
  align: "row" | "column";
  truncate?: boolean;
};

export default function PostUsername({
  username,
  userId,
  userFollowers,
  userFollowing,
  currentUser,
  name,
  bio,
  avatar,
  align,
  truncate = false,
}: PostUsernameProps) {
  const usernameWithoutAt = removeAtSymbol(username);
  const isMobile = useMediaQuery("(max-width: 450px)");

  if (align === "row") {
    return (
      <>
        <TooltipUsername
          currentUser={currentUser}
          userFollowers={userFollowers}
          userFollowing={userFollowing}
          userId={userId}
          username={username}
          name={name}
          bio={bio}
          avatar={avatar}
        >
          <Link
            href={`/${usernameWithoutAt}`}
            className="font-bold z-10 hover:underline focus-visible:ring-0 mobile:text-[15px] mobile:leading-5"
          >
            {truncate || isMobile ? truncateString(name, 12) : name}
          </Link>
        </TooltipUsername>
        <TooltipUsername
          currentUser={currentUser}
          userFollowers={userFollowers}
          userFollowing={userFollowing}
          userId={userId}
          username={username}
          name={name}
          bio={bio}
          avatar={avatar}
        >
          <Link
            href={`/${usernameWithoutAt}`}
            className="text-gray focus-visible:ring-0 z-10 mobile:text-[15px] mobile:leading-5"
          >
            {truncate || isMobile ? truncateString(username, 13) : username}
          </Link>
        </TooltipUsername>
      </>
    );
  }

  if (align === "column") {
    return (
      <div className="flex flex-col">
        <TooltipUsername
          currentUser={currentUser}
          userFollowers={userFollowers}
          userFollowing={userFollowing}
          userId={userId}
          username={username}
          name={name}
          bio={bio}
          avatar={avatar}
        >
          <Link
            href={`/${usernameWithoutAt}`}
            className="font-bold z-10 hover:underline focus-visible:ring-0 mobile:text-[15px] mobile:leading-5"
          >
            {truncate || isMobile ? truncateString(name, 12) : name}
          </Link>
        </TooltipUsername>
        <TooltipUsername
          currentUser={currentUser}
          userFollowers={userFollowers}
          userFollowing={userFollowing}
          userId={userId}
          username={username}
          name={name}
          bio={bio}
          avatar={avatar}
        >
          <Link
            href={`/${usernameWithoutAt}`}
            className="text-gray focus-visible:ring-0 z-10 mobile:text-[15px] mobile:leading-5"
          >
            {truncate || isMobile ? truncateString(username, 13) : username}
          </Link>
        </TooltipUsername>
      </div>
    );
  }
}
