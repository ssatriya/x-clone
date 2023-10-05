"use client";

import * as React from "react";

import { Icons } from "@/components/icons";
import { formatBirthdate, formatJoinDate, removeAtSymbol } from "@/lib/utils";
import {
  Avatar,
  Button,
  Image,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FollowPayload } from "@/lib/validator/follow";
import axios from "axios";
import { toast } from "sonner";
import { Followers, Following, UserWithFollowersFollowing } from "@/types/db";
import { User } from "@prisma/client";

type ProfileInfoProps = {
  userByUsername: UserWithFollowersFollowing;
  currentUser?: UserWithFollowersFollowing;
};

export default function ProfileInfo({
  userByUsername,
  currentUser,
}: ProfileInfoProps) {
  const queryClient = useQueryClient();

  const [followersAmt, setFollowersAmt] = React.useState<User[]>(
    userByUsername.followers
  );
  const [followingsAmt, setFollowingsAmt] = React.useState<User[]>(
    userByUsername.following
  );
  const [currUserFollowing, setCurrUserFollowing] = React.useState<
    User[] | undefined
  >(currentUser?.following);

  const { data: followersData } = useQuery({
    queryKey: ["followersData", userByUsername],
    queryFn: async () => {
      const { data } = await axios.get("/api/follow", {
        params: {
          userId: userByUsername.id,
          follow: "followers",
        },
      });
      return data as Followers;
    },
  });

  const { data: followingData } = useQuery({
    queryKey: ["followingData", userByUsername],
    queryFn: async () => {
      const { data } = await axios.get("/api/follow", {
        params: {
          userId: userByUsername.id,
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

  const bithdate = formatBirthdate(
    userByUsername.birthdate ? userByUsername.birthdate : ""
  );
  const joinDate = formatJoinDate(userByUsername.createdAt);

  const isMyProfile = userByUsername.id === currentUser?.id;

  const { mutate: followUser } = useMutation({
    mutationKey: ["followButton", userByUsername],
    mutationFn: async () => {
      const payload: FollowPayload = {
        currentUserId: currentUser!.id,
        viewedUserId: userByUsername.id,
      };

      const { data } = await axios.post("/api/follow", payload);
      return data as string;
    },
    onError: () => {
      toast.error("Failed to follow, try again later.");
    },
    onSuccess: (data) => {
      if (data === "Followed") {
        toast.success("Followed");
      } else if (data === "Unfollowed") {
        toast.error("Unfollowed");
      }
      queryClient.invalidateQueries({ queryKey: ["followersData"] });
      queryClient.invalidateQueries({ queryKey: ["followingData"] });
      queryClient.invalidateQueries({ queryKey: ["currUFollowing"] });
    },
  });

  const handleFollow = () => {
    followUser(); // temporary place, should be after current user check
    if (currentUser) {
      // display login modal
      return null;
    }
  };

  const { data: currUFollowing } = useQuery({
    queryKey: ["currUFollowing", userByUsername],
    queryFn: async () => {
      const { data } = await axios.get("/api/follow", {
        params: {
          userId: currentUser?.id,
          follow: "following",
        },
      });
      return data as Following;
    },
  });

  React.useEffect(() => {
    if (currUFollowing && currUFollowing.following.length > 0) {
      setCurrUserFollowing(currUFollowing.following);
    }
  }, [currUFollowing]);

  // const isFollowed = currUFollowing?.following.length === 0 ? false : true;

  let isFollowed: boolean;
  if (!currentUser) {
    isFollowed = false;
  } else {
    isFollowed = !!followersAmt.find((user) => user.id === currentUser!.id);
  }

  return (
    <div>
      <div className="relative">
        <div className="max-h-[200px] overflow-hidden">
          <Image
            width={600}
            alt="NextUI hero Image"
            src="https://nextui-docs-v2.vercel.app/images/hero-card-complete.jpeg"
            // fallbackSrc="https://via.placeholder.com/600x200"
            className="object-contain"
          />
        </div>
        <Avatar
          showFallback
          src={userByUsername.avatar}
          isBordered
          className="absolute ml-4 -translate-y-[50%] h-[134px] w-[134px]"
        />
        {isMyProfile ? (
          <Button
            className="absolute right-4 mt-3 border rounded-full text-[15px] leading-5 font-bold hover:bg-white/10"
            variant="bordered"
          >
            Edit profile
          </Button>
        ) : (
          <div className="absolute right-4 mt-3">
            {isFollowed ? (
              <Dropdown
                classNames={{
                  base: "p-0 min-w-0 bg-black shadow-normal",
                  trigger: "p-0",
                }}
              >
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    className="fill-text rounded-full border-1"
                    variant="bordered"
                  >
                    <Icons.followedIcon className="h-5 w-5" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  className="p-0 px-2 w-fit"
                  aria-label="unfollow button"
                >
                  <DropdownItem
                    onClick={handleFollow}
                    key="unfollow"
                    className="h-[44px] rounded-xl data-[hover=true]:bg-hover/40 data-[hover=true]:text-text"
                    textValue="unfollo"
                  >
                    <div className="flex items-center gap-2">
                      <Icons.unfollow className="fill-text h-[18px] w-[18px]" />
                      <div className="font-bold text-[15px]">
                        Unfollow {userByUsername.username}
                      </div>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                onClick={handleFollow}
                className="border bg-text text-black rounded-full text-[15px] leading-5 font-bold hover:bg-text/90"
              >
                Follow
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="mt-[85px] px-4 pt-3 mb-4">
        <div className="mb-[18px] flex flex-col gap-[2px]">
          <p className="text-xl font-bold leading-6">{userByUsername.name}</p>
          <p className="text-[15px] leading-5 text-gray">
            {userByUsername.username}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-[15px] leading-5">{userByUsername.bio}</p>
          <div className="flex gap-3 items-center">
            <div className="flex gap-1 items-center">
              <Icons.balloon className="fill-gray w-[18px] h-[18px]" />
              <p className="text-[15px] text-gray leading-3">{bithdate}</p>
            </div>
            <div className="flex gap-1 items-center">
              <Icons.calendar className="fill-gray w-[18px] h-[18px]" />
              <p className="text-[15px] text-gray leading-3">
                Joined {joinDate}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-text text-sm">
              <span className="font-bold tabular-nums">
                {followingsAmt.length}
              </span>{" "}
              <span className="text-gray text-sm leading-4">Following</span>
            </div>
            <div className="text-text text-sm">
              <span className="font-bold tabular-nums">
                {followersAmt.length}
              </span>{" "}
              <span className="text-gray text-sm leading-4">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
