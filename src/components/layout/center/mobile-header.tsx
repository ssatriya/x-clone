"use client";

import { Icons } from "@/components/icons";
import { UserWithFollowersFollowing } from "@/types/db";
import Image from "next/image";

type MobileHeaderProps = {
  currentUser: UserWithFollowersFollowing;
};

export default function MobileHeader({ currentUser }: MobileHeaderProps) {
  return (
    <div className="relative md:hidden">
      <div className="h-[53px] items-center px-4 flex">
        <Image
          src={currentUser.avatar}
          height={32}
          width={32}
          alt={currentUser.name}
          className="rounded-full"
          priority
        />
      </div>
      <div className="flex w-full items-center justify-center absolute top-4">
        <Icons.x className="w-6 h-full fill-text" />
      </div>
    </div>
  );
}
