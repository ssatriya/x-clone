"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { Following } from "@/types";
import UserFollowItem from "./user-follow-item";
import InfiniteScrollContainer from "@/components/infinite-scroll-container";
import { useEffect } from "react";

type Props = {
  username: string;
};

const FollowersList = ({ username }: Props) => {
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
        <span className="loader" />
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
          <UserFollowItem key={index} {...followers} />
        ))}
    </InfiniteScrollContainer>
  );
};

export default FollowersList;
