import * as React from "react";

import { Followers, Following, UserWithFollowersFollowing } from "@/types/db";
import { useFollow } from "@/hooks/useFollow";
import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Avatar, Button, Tooltip } from "@nextui-org/react";

type TooltipUsername = {
  children: React.ReactNode;
  userId: string;
  userFollowers: Followers[];
  userFollowing: Following[];
  currentUser: UserWithFollowersFollowing;
  username: string;
  name: string;
  bio: string | null;
  avatar: string;
};

export default function TooltipUsername({
  children,
  userId,
  userFollowers,
  userFollowing,
  currentUser,
  username,
  name,
  bio,
  avatar,
}: TooltipUsername) {
  const isMyProfile = userId === currentUser?.id;

  const { mutate: handleFollow } = useFollow(userId, currentUser.id);

  const [followersAmt, setFollowersAmt] = React.useState<User[]>(userFollowers);
  const [followingsAmt, setFollowingsAmt] =
    React.useState<User[]>(userFollowing);

  const { data: followersData } = useQuery({
    queryKey: ["followersData", userId],
    queryFn: async () => {
      const { data } = await axios.get("/api/follow", {
        params: {
          userId: userId,
          follow: "followers",
        },
      });
      return data as Followers;
    },
  });

  const { data: followingData } = useQuery({
    queryKey: ["followingData", userId],
    queryFn: async () => {
      const { data } = await axios.get("/api/follow", {
        params: {
          userId: userId,
          follow: "following",
        },
      });
      return data as Following;
    },
  });

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
              <Avatar showFallback src={avatar} size="lg" />
            </div>
            {isMyProfile ? null : isFollowed ? (
              <Button
                onMouseEnter={(e) => console.log(e)}
                onClick={() => handleFollow()}
                className="fill-text w-24 rounded-full border-1 font-bold hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 hover:content group"
                variant="bordered"
              >
                <span className="group-hover:hidden">Following</span>
                <span className="group-hover:block hidden text-red-500">
                  Unfollow
                </span>
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
            <div className="font-bold text-white">{name}</div>
            <p>{username}</p>
          </div>
          <div className="text-white text-sm">{bio}</div>
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
