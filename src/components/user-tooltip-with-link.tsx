import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

import Button from "./ui/button";
import kyInstance from "@/lib/ky";
import { UserInfo } from "@/types";
import { useCurrentSession } from "./session-provider";
import usePopperInstance from "@/hooks/usePopperInstance";

type Props = {
  username: string;
};

const UserTooltipWithLink = ({
  username,
  children,
}: PropsWithChildren<Props>) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  usePopperInstance(referenceRef, tooltipRef, tooltipVisible);

  const {
    session: { user },
  } = useCurrentSession();

  const isOwnProfile = user ? user.username === username : false;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userInfoQueryKey = ["user-info", username.slice(1)];

  const { data, isLoading } = useQuery({
    queryKey: userInfoQueryKey,
    queryFn: () =>
      kyInstance
        .get("/api/user/info", {
          searchParams: { username: username.slice(1) },
        })
        .json<UserInfo>(),
    retry: 2,
    staleTime: Infinity,
  });

  const handleTooltipVisibility = (show: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTooltipVisible(show), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
                    priority
                    className="rounded-full group-hover:opacity-90 transition-opacity"
                  />
                </Link>
              </div>
              {!isOwnProfile && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[15px] font-bold rounded-full"
                >
                  Follow
                </Button>
              )}
            </div>
            <div className="flex flex-col mt-2">
              <Link
                href={`/${data.username.slice(1)}`}
                className="font-bold text-[17px] text-secondary-lighter hover:underline"
              >
                {data.name}
              </Link>
              <span className="text-muted-foreground text-[15px]">
                {data.username}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[15px] text-secondary-lighter">
                Temp bio
              </span>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-secondary-lighter">
              <Link
                href={`/${data.username.slice(1)}/following`}
                className="font-bold hover:underline decoration-gray"
              >
                {12}{" "}
                <span className="font-normal text-muted-foreground">
                  Following
                </span>
              </Link>
              <Link
                href={`/${data.username.slice(1)}/followers`}
                className="font-bold hover:underline decoration-gray"
              >
                {12}{" "}
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

export default UserTooltipWithLink;
