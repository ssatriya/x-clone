"use client";

import Link from "next/link";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

import { Icons } from "@/components/icons";
import { User } from "@prisma/client";
import { cn, removeAtSymbol } from "@/lib/utils";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

type LeftSidebarProps = {
  currentUser: User;
};

export default function LeftSidebar({ currentUser }: LeftSidebarProps) {
  const username = removeAtSymbol(currentUser.username);
  const path = usePathname();
  const router = useRouter();

  const handleClick = async () => {
    await axios.post("/api/logout");
    router.refresh();
  };

  const handleHome = () => {
    if (path !== "/home") {
      router.push("/home");
    }
  };

  return (
    <nav className="px-2 pt-1 w-[275px] hidden xl:block min-h-screen">
      <div className="flex flex-col justify-between fixed h-full">
        <div className="gap-2 flex flex-col">
          <div
            role="button"
            onClick={handleHome}
            className="mb-2 h-[50px] w-[50px] rounded-full flex items-center justify-center"
          >
            <Icons.x className="w-8 h-8 stroke-neutral-100 fill-neutral-100" />
          </div>
          <div
            role="button"
            onClick={handleHome}
            className="hover:bg-hover w-fit p-3 rounded-full"
          >
            <div className="flex items-center justify-center">
              {path === "/home" ? (
                <Icons.home className="w-[27px] h-[27px] stroke-neutral-100 fill-neutral-100" />
              ) : (
                <Icons.home
                  strokeWidth={2}
                  className="w-[27px] h-[27px] stroke-neutral-100 "
                />
              )}
              <div
                className={cn(
                  path === "/home" ? "font-bold" : "font-normal",
                  "text-xl pr-4 pl-5"
                )}
              >
                Home
              </div>
            </div>
          </div>
          <Link
            href="#"
            className="hover:bg-hover w-fit p-3 rounded-full cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <Icons.explore className="w-[27px] h-[27px] fill-neutral-100" />
              <div className="text-xl pr-4 pl-5">Explore</div>
            </div>
          </Link>
          <Link
            href="#"
            className="hover:bg-hover w-fit p-3 rounded-full cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <Icons.notifications className="w-[27px] h-[27px] fill-neutral-100" />
              <div className="text-xl pr-4 pl-5">Notifications</div>
            </div>
          </Link>
          <Link
            href="#"
            className="hover:bg-hover w-fit p-3 rounded-full cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <Icons.messages className="w-[27px] h-[27px] fill-neutral-100" />
              <div className="text-xl pr-4 pl-5">Messages</div>
            </div>
          </Link>
          <Link
            href="#"
            className="hover:bg-hover w-fit p-3 rounded-full cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <Icons.lists className="w-[27px] h-[27px] fill-neutral-100" />
              <div className="text-xl pr-4 pl-5">Lists</div>
            </div>
          </Link>
          <Link
            href="#"
            className="hover:bg-hover w-fit p-3 rounded-full cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              <Icons.communities className="w-[27px] h-[27px] fill-neutral-100" />
              <div className="text-xl pr-4 pl-5">Communities</div>
            </div>
          </Link>
          <Link
            href="#"
            className="hover:bg-hover w-fit p-3 rounded-full cursor-not-allowed"
          >
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
              {path === `/${username}` ? (
                <Icons.profile className="w-[27px] h-[27px] fill-neutral-100" />
              ) : (
                <Icons.profile
                  strokeWidth={2}
                  className="w-[27px] h-[27px] stroke-neutral-100"
                />
              )}
              <div
                className={cn(
                  path === `/${username}` ? "font-bold" : "font-normal",
                  "text-xl pr-4 pl-5"
                )}
              >
                Profile
              </div>
            </div>
          </Link>
          <Link
            href="/explore"
            className="hover:bg-hover w-fit p-3 rounded-full"
          >
            <div className="flex items-center justify-center">
              <Icons.moreCircle className="w-[27px] h-[27px] fill-neutral-100" />
              <div className="text-xl pr-4 pl-5">More</div>
            </div>
          </Link>
          <a
            href="https://github.com/ssatriya/x-clone"
            target="__blank"
            className="hover:bg-hover w-fit p-3 rounded-full"
          >
            <div className="flex items-center justify-center">
              <Icons.github className="w-[27px] h-[27px] fill-neutral-100" />
              <div className="text-xl pr-4 pl-5">Repository</div>
            </div>
          </a>
          <Button className="bg-blue hover:bg-blue/90 font-bold rounded-full py-6 text-lg mt-4">
            Post
          </Button>
        </div>
      </div>
      <div className="fixed w-[275px] pr-4 bottom-4">
        <Dropdown
          showArrow
          classNames={{
            base: "px-0 w-[300px] bg-black shadow-normal",
          }}
        >
          <DropdownTrigger>
            <Button className="bg-black w-full hover:bg-text/10 h-[65px] font-bold rounded-full p-3 text-lg mt-4 flex justify-between items-center">
              <div className="flex gap-2">
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  height={40}
                  width={40}
                  className="rounded-full"
                />
                <div className="flex flex-col items-start">
                  <p className="text-[15px] font-bold leading-5">
                    {currentUser.name}
                  </p>
                  <p className="text-[15px] leading-5 text-gray">
                    {currentUser.username}
                  </p>
                </div>
              </div>
              <Icons.more className="fill-text w-5 h-5" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu" className="px-0 py-3">
            <DropdownItem className="rounded-none py-3 px-4 data-[hover=true]:bg-hover">
              <p className="font-bold text-[15px] leading-5">
                Add an existing account
              </p>
            </DropdownItem>
            <DropdownItem
              onClick={handleClick}
              className="rounded-none py-3 px-4 data-[hover=true]:bg-hover"
            >
              <p className="font-bold text-[15px] leading-5">
                Logged out {currentUser.username}
              </p>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </nav>
  );
}
