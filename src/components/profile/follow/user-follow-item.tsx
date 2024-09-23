"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { Following } from "@/types";
import Linkify from "@/components/linkify";
import UserTooltip from "@/components/user-tooltip";
import FollowButton from "@/components/profile/follow/follow-button";

type Props = Following;

const UserFollowItem = ({
  id,
  name,
  username,
  bio,
  isFollowing,
  photo,
}: Props) => {
  const queryClient = useQueryClient();

  const isFollowingQueryKey = ["is-following", id];

  const { data: isFollowingLocal } = useQuery({
    queryKey: isFollowingQueryKey,
    queryFn: () =>
      kyInstance
        .get("/api/user/is-following", {
          searchParams: { userId: id },
        })
        .json<boolean>(),
    retry: 2,
    staleTime: Infinity,
    initialData: isFollowing,
  });

  const { mutate: follow } = useMutation({
    mutationKey: ["follow-user", id],
    mutationFn: () =>
      kyInstance.post("/api/user/follow", {
        searchParams: { targetId: id },
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: isFollowingQueryKey });
      const previousState =
        queryClient.getQueryData<boolean>(isFollowingQueryKey);

      queryClient.setQueryData<boolean>(isFollowingQueryKey, !previousState);

      return { previousState };
    },
    onError: (error, variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData<boolean>(
          isFollowingQueryKey,
          context.previousState
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: isFollowingQueryKey });
    },
  });

  const followHandler = useCallback(() => follow(), [follow]);

  return (
    <div className="px-4 py-3 flex w-full gap-2 cursor-pointer hover:bg-hover/25">
      <div className="w-10 h-10 flex-shrink-0">
        <Image
          src={photo!}
          alt="avatar"
          height={40}
          width={40}
          priority
          className="rounded-full"
        />
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-between w-full items-center">
          <div className="flex flex-col leading-5">
            <UserTooltip username={username} userId={id}>
              <Link
                href={`/${username ? username.slice(1) : ""}`}
                className="hover:underline focus:outline-none focus:underline"
                id="name"
              >
                <span className="text-[15px] font-bold">{name}</span>
              </Link>
            </UserTooltip>
            <UserTooltip username={username} userId={id}>
              <Link
                href={`/${username ? username.slice(1) : ""}`}
                tabIndex={-1}
                id="username"
              >
                <span className="text-[15px] text-gray">{username}</span>
              </Link>
            </UserTooltip>
          </div>
          <FollowButton
            follow={followHandler}
            isFollowing={isFollowingLocal}
            username={username}
            size="default"
          />
        </div>
        <Linkify>
          <span className="text-[15px] text-secondary-lighter leading-5">
            {bio}
          </span>
        </Linkify>
      </div>
    </div>
  );
};

export default UserFollowItem;
