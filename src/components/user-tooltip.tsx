import {
  useRef,
  useState,
  useEffect,
  useCallback,
  PropsWithChildren,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { UserInfo } from "@/types";
import Button from "@/components/ui/button";
import { useCurrentSession } from "./session-provider";
import usePopperInstance from "@/hooks/usePopperInstance";

type Props = {
  userId: string;
  username: string;
};

const UserTooltip = ({
  username,
  children,
  userId,
}: PropsWithChildren<Props>) => {
  const queryClient = useQueryClient();

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const referenceRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const {
    session: { user },
  } = useCurrentSession();

  const isOwnProfile = user ? user.username === username : false;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userInfoQueryKey = ["user-info", username.slice(1)];

  const { data, isLoading: isUserInfoLoading } = useQuery({
    queryKey: userInfoQueryKey,
    queryFn: () =>
      kyInstance
        .get("/api/user/info", {
          searchParams: { username: username.slice(1) },
        })
        .json<UserInfo>(),
    retry: 2,
    enabled: tooltipVisible,
  });

  const { mutate: follow } = useMutation({
    mutationKey: ["follow-user", userId],
    mutationFn: () =>
      kyInstance.post("/api/user/follow", {
        searchParams: { targetId: userId },
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

  usePopperInstance(referenceRef, tooltipRef, tooltipVisible);

  const handleTooltipVisibility = (show: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTooltipVisible(show), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const followHandler = useCallback(() => follow(), [follow]);

  const isLoading = isUserInfoLoading;

  return (
    <div className="inline-block">
      <div
        ref={referenceRef}
        onMouseEnter={() => handleTooltipVisibility(true)}
        onMouseLeave={() => handleTooltipVisibility(false)}
      >
        {children}
      </div>
      <div
        ref={tooltipRef}
        onMouseEnter={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        }}
        onMouseLeave={() => handleTooltipVisibility(false)}
        className={`z-50 transition-opacity duration-300 w-[300px] bg-black shadow-repost rounded-2xl p-4 absolute cursor-default [transition:visibility_0ms_ease_600ms,opacity_400ms_ease_400ms]
           ${tooltipVisible ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        {isLoading && (
          <div className="flex items-center justify-center">
            <span className="loader-white"></span>
          </div>
        )}
        {!isLoading && data && (
          <div className="w-full bg-black">
            <div className="flex justify-between w-full">
              <div className="w-16 h-16">
                <Link
                  href={`/${data.username.slice(1)}`}
                  tabIndex={-1}
                  className="group"
                >
                  <Image
                    src={data?.photo ?? "/avatar.jpeg"}
                    alt={`${username} avatar`}
                    height={64}
                    width={64}
                    className="rounded-full group-hover:opacity-90 transition-opacity"
                  />
                </Link>
              </div>
              {!isOwnProfile && !data.isFollowing && (
                <Button
                  onClick={followHandler}
                  variant="secondary"
                  size="sm"
                  className="text-[15px] font-bold rounded-full"
                >
                  Follow
                </Button>
              )}
              {!isOwnProfile && data.isFollowing && (
                <Button
                  onClick={followHandler}
                  variant="ghost"
                  size="sm"
                  className="text-[15px] leading-5 font-bold bg-inherit border border-muted-foreground text-secondary-lighter transition-all rounded-full hover:bg-red-700/10 hover:border-red-700 group min-w-[104px]"
                >
                  <span className="group-hover:hidden">Following</span>
                  <span className="text-red-600 hidden group-hover:block">
                    Unfollow
                  </span>
                </Button>
              )}
            </div>
            <div className="flex flex-col mt-2">
              <Link
                href={`/${data.username.slice(1)}`}
                className="font-bold text-[17px] text-secondary-lighter hover:underline leading-5"
              >
                {data.name}
              </Link>
              <span className="text-muted-foreground font-normal text-[15px] leading-5">
                {data.username}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[15px] font-normal text-secondary-lighter">
                Temp bio
              </span>
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <Link
                href={`/${data.username.slice(1)}/following`}
                className="font-bold hover:underline decoration-gray text-secondary-lighter"
              >
                {data.followingCount}{" "}
                <span className="font-normal text-muted-foreground">
                  Following
                </span>
              </Link>
              <Link
                href={`/${data.username.slice(1)}/verified_followers`}
                className="font-bold hover:underline decoration-gray text-secondary-lighter"
              >
                {data.followersCount}{" "}
                <span className="font-normal text-muted-foreground">
                  Followers
                </span>
              </Link>
            </div>
            <div className="flex gap-4 mt-3">
              <span className="font-normal text-[13px] text-muted-foreground">
                Followed by
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTooltip;
