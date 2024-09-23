"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { UserInfo } from "@/types";
import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import FollowButton from "../follow/follow-button";

type Props = {
  user: UserInfo;
  usernameParams: string;
};

const PublicProfileInfo = ({ user, usernameParams }: Props) => {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);

  const userInfoQueryKey = ["user-info", usernameParams];

  const { data } = useQuery({
    queryKey: userInfoQueryKey,
    queryFn: () =>
      kyInstance
        .get("/api/user/info", {
          searchParams: { username: usernameParams },
        })
        .json<UserInfo>(),
    initialData: user,
    staleTime: Infinity,
  });

  const { mutate: follow } = useMutation({
    mutationKey: ["follow-user", user.id],
    mutationFn: () =>
      kyInstance.post("/api/user/follow", {
        searchParams: { targetId: user.id },
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userInfoQueryKey });
      const previousState =
        queryClient.getQueryData<UserInfo>(userInfoQueryKey);

      const newState: UserInfo | undefined = previousState
        ? {
            ...previousState,
            isFollowing: !previousState.isFollowing,
            followersCount:
              previousState.followersCount +
              (previousState.isFollowing ? -1 : 1),
          }
        : undefined;

      if (newState) {
        queryClient.setQueryData<UserInfo>(userInfoQueryKey, newState);
      }

      return { previousState };
    },
    onError: (error, variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData<UserInfo>(
          userInfoQueryKey,
          context.previousState
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userInfoQueryKey });
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const followHandler = useCallback(() => follow(), [follow]);

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
        <div className="h-[188px] w-full mt-1 mb-3" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="loader" />
        </div>
      </div>
    );
  }

  const { isFollowing, name, username, followersCount, followingCount, photo } =
    data;

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
            <div className="max-w-[598px] h-[200px] bg-zinc-800" />
          )}
        </div>
      </Link>
      <Link href={`/${user.username.slice(1)}/photo`}>
        <div className="absolute ml-4 -translate-y-[50%] flex items-center justify-center h-[141px] w-[141px] bg-black rounded-full">
          <Image
            src={photo!}
            alt="header"
            fill
            className="content-center object-cover rounded-full p-1"
            priority
          />
        </div>
      </Link>
      <div className="w-full px-4 pt-3 mb-4">
        <div className="flex gap-3 justify-end h-[68px]">
          <Button
            variant="ghost"
            size="icon"
            className="h-[34px] flex bg-inherit items-center justify-center w-[34px] border border-gray hover:bg-border/50"
          >
            <Icons.more className="w-4 h-4 fill-gray" />
          </Button>
          <FollowButton
            isFollowing={isFollowing}
            follow={followHandler}
            username={username}
            size="sm"
          />
        </div>
        <div className="flex mt-1 mb-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-6">{name}</span>
            <span className="text-gray text-[15px] mr-2 leading-5">
              {username}
            </span>
          </div>
        </div>
        <div className="w-full">
          <Link
            href={`/${user.username.slice(1)}/following`}
            className="hover:underline"
          >
            <span className="mr-5 text-sm leading-4 text-gray">
              <span className="font-bold text-secondary-lighter">
                {followingCount}
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
                {followersCount}
              </span>{" "}
              Followers
            </span>
          </Link>
        </div>
        <span className="text-sm text-gray">
          Not followed by anyone you’re following
        </span>
      </div>
    </div>
  );
};

export default PublicProfileInfo;
