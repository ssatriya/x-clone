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

type Props = {
  username: string;
};

const FollowingList = ({ username }: Props) => {
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
        <span className="loader" />
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
          <UserFollowItem key={index} {...following} />
        ))}
    </InfiniteScrollContainer>
  );
};

export default FollowingList;
