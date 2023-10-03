"use client";

import Link from "next/link";
import { Button } from "@nextui-org/react";

import { Icons } from "@/components/icons";
import { User } from "@prisma/client";
import { removeAtSymbol } from "@/lib/utils";

type LeftSidebarProps = {
  currentUser: User;
};

export default function LeftSidebar({ currentUser }: LeftSidebarProps) {
  const username = removeAtSymbol(currentUser.username);
  return (
    <nav className="px-2 pt-1 w-[275px]">
      <div className="gap-2 flex flex-col fixed">
        <Link
          href="/home"
          className="mb-2 h-[50px] w-[50px] rounded-full flex items-center justify-center"
        >
          <Icons.x className="w-8 h-8 stroke-neutral-100 fill-neutral-100" />
        </Link>
        <Link href="/home" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.home
              className="w-[27px] h-[27px] stroke-neutral-100"
              strokeWidth={2}
            />
            <div className="text-xl pr-4 pl-5">Home</div>
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.explore className="w-[27px] h-[27px] fill-neutral-100" />
            <div className="text-xl pr-4 pl-5">Explore</div>
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.notifications className="w-[27px] h-[27px] fill-neutral-100" />
            <div className="text-xl pr-4 pl-5">Notifications</div>
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.messages className="w-[27px] h-[27px] fill-neutral-100" />
            <div className="text-xl pr-4 pl-5">Messages</div>
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.lists className="w-[27px] h-[27px] fill-neutral-100" />
            <div className="text-xl pr-4 pl-5">Lists</div>
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.communities className="w-[27px] h-[27px] fill-neutral-100" />
            <div className="text-xl pr-4 pl-5">Communities</div>
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.verified className="w-[27px] h-[27px] fill-neutral-100" />
            <div className="text-xl pr-4 pl-5">Verified</div>
          </div>
        </Link>
        <Link
          href={`/${username}`}
          className="hover:bg-hover w-fit p-3 rounded-full"
        >
          <div className="flex items-center justify-center">
            <Icons.profile className="w-[27px] h-[27px] fill-neutral-100" />
            <div className="text-xl pr-4 pl-5">Profile</div>
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.moreCircle className="w-[27px] h-[27px] fill-neutral-100" />
            <div className="text-xl pr-4 pl-5">More</div>
          </div>
        </Link>
        <Button className="bg-blue hover:bg-blue/90 font-bold rounded-full py-6 text-lg mt-4">
          Post
        </Button>
      </div>
    </nav>
  );
}
