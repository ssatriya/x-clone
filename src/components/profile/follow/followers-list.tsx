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

const FollowersList = ({ username, loggedInUser }: Props) => {
  const { data, isLoading, hasNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["followers-list", username],
      queryFn: ({ pageParam = 0 }) =>
        kyInstance
          .get(`/api/profile/followers`, {
            searchParams: {
              username: username,
              offset: pageParam,
            },
          })
          .json<{ nextOffset: number; followersList: Following[] }>(),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.nextOffset !== null ? lastPage.nextOffset : undefined;
      },
      placeholderData: keepPreviousData,
    });

  const followersList = data?.pages.flatMap((page) => page.followersList) || [];

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
        followersList &&
        followersList.map((followers, index) => (
          <UserFollowItem
            key={index}
            {...followers}
            loggedInUser={loggedInUser}
          />
        ))}
    </InfiniteScrollContainer>
  );
};

export default FollowersList;
