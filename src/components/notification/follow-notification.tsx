"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import kyInstance from "@/lib/ky";
import { Notification } from "@/types";
import Icons from "@/components/icons";

type Props = {
  notification: Notification;
};

const FollowNotification = ({ notification }: Props) => {
  const router = useRouter();

  const { mutate } = useMutation({
    mutationKey: ["follow-notification", notification.userId],
    mutationFn: () =>
      kyInstance
        .patch("/api/notification/all-notification/follow/mark-as-read", {
          searchParams: { issuerId: notification.userId! },
        })
        .json(),
  });

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clickHandler = () => {
    router.push(`/${notification.username?.slice(1)}`);
  };

  return (
    <div
      onClick={clickHandler}
      className={cn(
        "px-4 py-3 flex gap-2 cursor-pointer w-auto border-b",
        notification.read ? "hover:bg-hover/25" : "bg-primary/10"
      )}
    >
      <Icons.profile className="h-[30px] w-[30px] fill-primary" />
      <div className="flex flex-col pr-5">
        <Image
          src={notification.photo!}
          alt="user avatar"
          height={32}
          width={32}
          className="rounded-full mb-3"
        />
        <span>
          <span className="font-bold">{notification.name}</span> followed you
        </span>
      </div>
    </div>
  );
};

export default FollowNotification;
