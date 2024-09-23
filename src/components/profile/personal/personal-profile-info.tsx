"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { UserInfo } from "@/types";
import Icons from "@/components/icons";
import Button from "@/components/ui/button";

type Props = {
  user: Omit<UserInfo, "isFollowing">;
};

const PersonalProfileInfo = ({ user }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full flex flex-col items-center justify-center relative">
        <div
          style={{
            maxWidth: 598,
            aspectRatio: 598 / 200,
          }}
          className="h-full w-full"
        >
          <div className="max-w-[598px] h-full" />
        </div>
        <div className="h-[164px] w-full mt-1 mb-3" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Link href="/DonnyRqmQ2UTug/header_photo">
        <div
          style={{
            maxWidth: 598,
            aspectRatio: 598 / 200,
          }}
          className="cursor-pointer overflow-hidden relative"
        >
          {user.headerPhoto && (
            <Image
              src="/header-photo.jpg"
              alt="header-photo"
              className="content-center object-cover"
              sizes="(max-width: 600px) 600px"
              fill
              priority
            />
          )}
          {!user.headerPhoto && (
            <div className="max-w-[598px] h-full bg-zinc-800" />
          )}
        </div>
      </Link>
      <Link href={`/${user.username.slice(1)}/photo`}>
        <div className="absolute ml-4 -translate-y-[50%] flex items-center justify-center h-[141px] w-[141px] bg-black rounded-full">
          <Image
            src={user.photo!}
            alt="header"
            fill
            className="content-center object-cover rounded-full p-1"
            priority
          />
        </div>
      </Link>
      <div className="w-full px-4 pt-3 mb-4">
        <div className="flex justify-end h-[68px]">
          <Button
            size="sm"
            className="font-bold bg-transparent border border-muted-foreground h-9 text-[15px] px-4 rounded-full w-auto hover:bg-border/50 mb-3"
          >
            Edit profile
          </Button>
        </div>
        <div className="flex mt-1 mb-3 gap-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-6">{user.name}</span>
            <span className="text-gray text-[15px] leading-5">
              {user.username}
            </span>
          </div>
          <Button
            size="sm"
            className="w-auto gap-0.5 h-6 px-3 py-0 bg-transparent border border-muted-foreground text-sm font-bold rounded-full hover:bg-border/50"
          >
            <span className="w-[16px] h-[16px] mr-[2px]">
              <Icons.verified className="fill-primary" />
            </span>
            Get verified
          </Button>
        </div>
        <div className="w-full">
          <Link
            href={`/${user.username.slice(1)}/following`}
            className="hover:underline"
          >
            <span className="mr-5 text-sm leading-4 text-gray">
              <span className="font-bold text-secondary-lighter">
                {user.followingCount}
              </span>{" "}
              Following
            </span>
          </Link>
          <Link
            href={`/${user.username.slice(1)}/verified_followers`}
            className="hover:underline"
          >
            <span className="text-sm leading-4 text-gray">
              <span className="font-bold text-secondary-lighter">
                {user.followersCount}
              </span>{" "}
              Followers
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PersonalProfileInfo;
