"use client";

import { User } from "lucia";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { Following } from "@/types";
import LoadingSpinner from "@/components/loading-spinner";
import UserFollowItem from "@/components/profile/follow/user-follow-item";
import InfiniteScrollContainer from "@/components/infinite-scroll-container";

type Props = {
  username: string;
  loggedInUser: User;
};

const FollowingList = ({ username, loggedInUser }: Props) => {
  const { data, isLoading, hasNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["following-list", username],
      queryFn: ({ pageParam = 0 }) =>
        kyInstance
          .get(`/api/profile/following`, {
            searchParams: {
              username: username,
              offset: pageParam,
            },
          })
          .json<{ nextOffset: number; followingList: Following[] }>(),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.nextOffset !== null ? lastPage.nextOffset : undefined;
      },
      placeholderData: keepPreviousData,
    });

  const followingList = data?.pages.flatMap((page) => page.followingList) || [];

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-start justify-center mt-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {!isLoading &&
        followingList &&
        followingList.map((following, index) => (
          <UserFollowItem
            key={index}
            {...following}
            loggedInUser={loggedInUser}
          />
        ))}
    </InfiniteScrollContainer>
  );
};

export default FollowingList;
