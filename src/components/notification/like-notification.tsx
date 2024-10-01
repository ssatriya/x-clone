"use client";

import Image from "next/image";
import { Fragment, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { cn } from "@/lib/utils";
import kyInstance from "@/lib/ky";
import { Notification } from "@/types";
import Icons from "@/components/icons";

type Props = {
  postId: string;
  notifications: Notification[];
  content: string | null;
  postType: string | null;
  recipientUsername: string | null;
};

const LikeNotification = ({
  notifications,
  postType,
  content,
  postId,
  recipientUsername,
}: Props) => {
  const router = useRouter();

  const { mutate } = useMutation({
    mutationKey: ["like-notification", postId],
    mutationFn: () =>
      kyInstance
        .patch("/api/notification/all-notification/like/mark-as-read", {
          searchParams: { postId: postId },
        })
        .json(),
  });

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clickHandler = () => {
    router.push(`/${recipientUsername?.slice(1)}/status/${postId}`);
  };

  return (
    <div
      onClick={clickHandler}
      className={cn(
        "px-4 py-3 flex gap-2 cursor-pointer w-auto border-b",
        notifications.every((n) => n.read)
          ? "hover:bg-hover/25"
          : "bg-primary/10"
      )}
    >
      <Icons.like className="h-[30px] w-[30px] fill-like" />
      <div className="flex flex-col pr-5">
        <div className="flex gap-1 mb-3">
          {notifications.map((notification) => (
            <Image
              key={notification.id}
              src={notification.photo!}
              height={32}
              width={32}
              alt="user-avatar"
              className="rounded-full"
              priority
            />
          ))}
        </div>
        <div className="flex gap-1">
          <span>
            {notifications.length <= 2 &&
              notifications.map((notification, index) => {
                return (
                  <Fragment key={notification.id}>
                    <Link
                      href={`/${notification.username?.slice(1)}`}
                      className="font-bold hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notification.name}
                    </Link>
                    {index === 0 && notifications.length > 1 && (
                      <span className="font-normal"> and </span>
                    )}
                  </Fragment>
                );
              })}{" "}
            {notifications.length > 2 && (
              <Fragment>
                <Link
                  href={`/${notifications[0].username?.slice(1)}`}
                  className="font-bold hover:underline"
                >
                  {notifications[0].name}
                </Link>
                <span> and {notifications.length} others</span>
              </Fragment>
            )}{" "}
            liked your {postType}
          </span>
        </div>
        <div className="mt-3">
          {content && (
            <span className="text-gray text-[15px] leading-5">{content}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikeNotification;

// return (
//     <Fragment key={notification.id}>
//       <Link
//         href={`/${notifications[0].username}`}
//         className="font-bold hover:underline"
//       >
//         {notifications[0].name}
//       </Link>
//       <span className="font-normal">
//         {" "}
//         and {notifications.length}
//       </span>
//     </Fragment>
//   );
