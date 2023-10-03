"use client";

import * as React from "react";

import { TooltipUser } from "@/types/db";
import { Avatar, Button, Tooltip } from "@nextui-org/react";

type UserTooltipProps = {
  children: React.ReactNode;
  user: TooltipUser;
};

export default function UserTooltip({ children, user }: UserTooltipProps) {
  const followersCount = user.followers.length;
  const followsingsCount = user.followings.length;

  return (
    <Tooltip
      delay={600}
      classNames={{
        base: "w-[280px] p-0 bg-black rounded-lg",
      }}
      placement="bottom"
      content={
        <div className="p-4 w-full shadow-normal rounded-lg">
          <div className="flex w-full justify-between items-start">
            <div className="flex flex-col gap-1">
              <Avatar showFallback src={user.avatar} size="lg" />
            </div>
            <Button
              variant="bordered"
              className="rounded-full border-text text-black font-bold border-1 bg-white hover:bg-white/90"
            >
              Follow
            </Button>
          </div>
          <div className="my-2">
            <div className="font-bold text-white">{user.name}</div>
            <p>{user.username}</p>
          </div>
          <div className="text-white text-sm">{user.bio}</div>
          <div className="flex w-[80%] justify-between mt-4">
            <div className="text-white">
              <span className=" font-bold">{followsingsCount}</span>{" "}
              <span className="font-normal">Following</span>
            </div>

            <div className="text-white">
              <span className=" font-bold">{followersCount}</span>{" "}
              <span className="font-normal">Followers</span>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}
