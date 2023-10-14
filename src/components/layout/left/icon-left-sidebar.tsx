"use client";

import Link from "next/link";
import { Button } from "@nextui-org/react";

import { Icons } from "@/components/icons";
import { User } from "@prisma/client";
import { removeAtSymbol } from "@/lib/utils";
import { usePathname } from "next/navigation";

type MobileLeftSidebarProps = {
  currentUser: User;
};

export default function IconLeftSidebar({
  currentUser,
}: MobileLeftSidebarProps) {
  const username = removeAtSymbol(currentUser.username);
  const pathname = usePathname();

  return (
    <nav className="px-2 pt-1 w-20 md:block xl:hidden hidden">
      <div className="gap-2 flex flex-col fixed">
        <Link
          href="/home"
          className="mb-2 h-[50px] w-[50px] rounded-full flex items-center justify-center hover:bg-hover p-3"
        >
          <Icons.x className="w-8 h-8 stroke-neutral-100 fill-neutral-100" />
        </Link>
        <Link href="/home" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.home
              className="w-[27px] h-[27px] stroke-neutral-100 fill-neutral-100"
              strokeWidth={2}
            />
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.explore className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.notifications className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.messages className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.lists className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.communities className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.verified className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Link>
        <Link
          href={`/${username}`}
          className="hover:bg-hover w-fit p-3 rounded-full"
        >
          <div className="flex items-center justify-center">
            <Icons.profile className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Link>
        <Link href="/explore" className="hover:bg-hover w-fit p-3 rounded-full">
          <div className="flex items-center justify-center">
            <Icons.moreCircle className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Link>
        <Button
          isIconOnly
          className="bg-blue hover:bg-blue/90 font-bold rounded-full h-[50px] w-[50px] text-lg mt-4"
        >
          <div className="flex items-center justify-center">
            <Icons.compose className="w-[27px] h-[27px] fill-neutral-100" />
          </div>
        </Button>
      </div>
    </nav>
  );
}
