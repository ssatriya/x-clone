"use client";

import { Icons } from "@/components/icons";
import { formatBirthdate } from "@/lib/utils";
import { Avatar, Button, Image } from "@nextui-org/react";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { Session } from "lucia";
import { FollowPayload } from "@/lib/validator/follow";
import axios from "axios";
import { toast } from "sonner";
import { UserWithFollowersFollowing } from "@/types/db";

type ProfileInfoProps = {
  otherUser: UserWithFollowersFollowing;
  currentUser?: UserWithFollowersFollowing;
};

export default function ProfileInfo({
  otherUser,
  currentUser,
}: ProfileInfoProps) {
  const bithdate = formatBirthdate(
    otherUser.birthdate ? otherUser.birthdate : ""
  );
  // const joinDate = formatJoinDate(user.createdAt.toString());

  const isMyProfile = otherUser.id === currentUser?.id;

  const { mutate: followUser } = useMutation({
    mutationKey: ["followButton", otherUser],
    mutationFn: async () => {
      const payload: FollowPayload = {
        userToFollowId: otherUser.id,
      };

      const { data } = await axios.post("/api/follow", payload);
      console.log(data);
      return data as string;
    },
    onError: () => {
      toast.error("Failed to follow, try again later.");
    },
    onSuccess: () => {
      toast.success("Followed");
    },
  });

  const handleFollow = () => {
    followUser();
    if (currentUser) {
      // display login modal
      return null;
    }
  };

  const isFollowed = currentUser?.followings.find(
    (u) => u.user_to_follow_id === otherUser.id
  );
  const followersCount = otherUser.followers.length;
  const followingCount = otherUser.followings.length;

  return (
    <div>
      <div className="relative">
        <div className="max-h-[200px] overflow-hidden">
          <Image
            width={600}
            alt="NextUI hero Image"
            src="https://nextui-docs-v2.vercel.app/images/hero-card-complete.jpeg"
            fallbackSrc="https://via.placeholder.com/600x200"
            className="object-contain"
          />
        </div>
        <Avatar
          showFallback
          src={otherUser.avatar}
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
            {!!isFollowed ? (
              <Button
                isIconOnly
                className="fill-text rounded-full border-1"
                variant="bordered"
              >
                <Icons.followedIcon className="h-5 w-5" />
              </Button>
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
          <p className="text-xl font-bold leading-6">{otherUser.name}</p>
          <p className="text-[15px] leading-5 text-gray">
            {otherUser.username}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-[15px] leading-5">{otherUser.bio}</p>
          <div className="flex gap-3 items-center">
            <div className="flex gap-1 items-center">
              <Icons.balloon className="fill-gray w-[18px] h-[18px]" />
              <p className="text-[15px] text-gray leading-3">{bithdate}</p>
            </div>
            <div className="flex gap-1 items-center">
              <Icons.calendar className="fill-gray w-[18px] h-[18px]" />
              <p className="text-[15px] text-gray leading-3">JoinDate</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-text text-sm">
              <span className="font-bold">{followingCount}</span>{" "}
              <span className="text-gray text-sm leading-4">Following</span>
            </div>
            <div className="text-text text-sm">
              <span className="font-bold">{followersCount}</span>{" "}
              <span className="text-gray text-sm leading-4">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
