"use client";

import * as React from "react";

import { Avatar, Button, Tooltip } from "@nextui-org/react";
import { User } from "@prisma/client";
import { Followers, Following, UserWithFollowersFollowing } from "@/types/db";
import { useFollow } from "@/hooks/useFollow";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Icons } from "@/components/icons";

type UserTooltipProps = {
  children: React.ReactNode;
  user: UserWithFollowersFollowing;
  currentUser: UserWithFollowersFollowing;
};

export default function UserTooltip({
  children,
  user,
  currentUser,
}: UserTooltipProps) {
  const isMyProfile = user.id === currentUser?.id;

  const { mutate: handleFollow } = useFollow(user.id, currentUser.id);

  const [followersAmt, setFollowersAmt] = React.useState<User[]>(
    user.followers
  );
  const [followingsAmt, setFollowingsAmt] = React.useState<User[]>(
    user.following
  );

  const { data: followersData } = useQuery({
    queryKey: ["followersData", user],
    queryFn: async () => {
      const { data } = await axios.get("/api/follow", {
        params: {
          userId: user.id,
          follow: "followers",
        },
      });
      return data as Followers;
    },
  });

  const { data: followingData } = useQuery({
    queryKey: ["followingData", user],
    queryFn: async () => {
      const { data } = await axios.get("/api/follow", {
        params: {
          userId: user.id,
          follow: "following",
        },
      });
      return data as Following;
    },
  });

  React.useEffect(() => {
    if (followersData) {
      setFollowersAmt(followersData.followers);
    }
  }, [followersData]);

  React.useEffect(() => {
    if (followingData) {
      setFollowingsAmt(followingData.following);
    }
  }, [followingData]);

  let isFollowed: boolean;
  if (!currentUser) {
    isFollowed = false;
  } else {
    isFollowed = !!followersAmt.find((user) => user.id === currentUser!.id);
  }

  return (
    <Tooltip
      delay={1000}
      classNames={{
        base: "w-[280px] p-0 bg-black rounded-lg focus-visible:ring-0",
      }}
      placement="bottom"
      content={
        <div className="p-4 w-full shadow-normal rounded-lg">
          <div className="flex w-full justify-between items-start">
            <div className="flex flex-col gap-1">
              <Avatar showFallback src={user.avatar} size="lg" />
            </div>
            {isMyProfile ? null : isFollowed ? (
              <Button
                onClick={() => handleFollow()}
                isIconOnly
                className="fill-text rounded-full border-1"
                variant="bordered"
              >
                <Icons.followedIcon className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={() => handleFollow()}
                className="border bg-text text-black rounded-full text-[15px] leading-5 font-bold hover:bg-text/90"
              >
                Follow
              </Button>
            )}
          </div>
          <div className="my-2">
            <div className="font-bold text-white">{user.name}</div>
            <p>{user.username}</p>
          </div>
          <div className="text-white text-sm">{user.bio}</div>
          <div className="flex w-[80%] justify-between mt-4">
            <div className="text-white">
              <span className=" font-bold">{followingsAmt.length}</span>{" "}
              <span className="font-normal">Following</span>
            </div>

            <div className="text-white">
              <span className=" font-bold">{followersAmt.length}</span>{" "}
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
