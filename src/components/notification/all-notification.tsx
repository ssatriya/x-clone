"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import { Notification } from "@/types";
import LikeNotification from "./like-notification";
import FollowNotification from "./follow-notification";

const AllNotification = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["all-notification"],
    queryFn: () =>
      kyInstance
        .get("/api/notification/all-notification")
        .json<Notification[]>(),
  });

  useEffect(() => {
    queryClient.resetQueries({ queryKey: ["all-notification"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data && isLoading) {
    return (
      <div className="w-full h-full flex items-start justify-center mt-10">
        <span className="loader" />
      </div>
    );
  }

  const groupedNotifications = data?.reduce<{
    likes: Record<string, Notification[]>;
    follows: Notification[];
  }>(
    (acc, notification) => {
      if (notification.notificationType === "like" && notification.postId) {
        const postId = notification.postId; // TypeScript now knows this is not null
        if (!acc.likes[postId]) {
          acc.likes[postId] = [];
        }
        acc.likes[postId].push(notification);
      } else if (notification.notificationType === "follow") {
        acc.follows.push(notification);
      }
      return acc;
    },
    { likes: {}, follows: [] }
  );

  interface LikeNotificationType {
    type: "like";
    postId: string;
    notifications: Notification[]; // an array of Notification objects
    createdAt: Date;
  }

  interface FollowNotificationType {
    type: "follow";
    id: string;
    notification: Notification; // a single Notification object
    createdAt: Date;
  }

  type AllNotificationType = LikeNotificationType | FollowNotificationType;

  function isLikeNotification(
    notification: AllNotificationType
  ): notification is LikeNotificationType {
    return notification.type === "like";
  }

  function isFollowNotification(
    notification: AllNotificationType
  ): notification is FollowNotificationType {
    return notification.type === "follow";
  }

  if (!groupedNotifications) {
    return null;
  }

  const allNotifications: AllNotificationType[] = [
    ...Object.keys(groupedNotifications.likes).map((postId) => {
      const notificationsForPost = groupedNotifications.likes[postId];
      return {
        type: "like", // Explicitly define the type as "like"
        postId,
        notifications: notificationsForPost,
        createdAt: notificationsForPost[0].createdAt,
      } as LikeNotificationType; // Cast it to the correct type
    }),
    ...groupedNotifications.follows.map(
      (follow) =>
        ({
          type: "follow", // Explicitly define the type as "follow"
          id: follow.id,
          notification: follow,
          createdAt: follow.createdAt,
        } as FollowNotificationType)
    ), // Cast it to the correct type
  ];

  // Sort by createdAt timestamp
  allNotifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return (
    <>
      {allNotifications.map((notification) => {
        if (isLikeNotification(notification)) {
          return (
            <LikeNotification
              key={notification.postId}
              postId={notification.postId}
              notifications={notification.notifications}
              content={notification.notifications[0]?.content ?? null}
              postType={notification.notifications[0]?.postType ?? null}
              recipientUsername={
                notification.notifications[0].recipientUsername ?? null
              }
            />
          );
        } else if (isFollowNotification(notification)) {
          return (
            <FollowNotification
              key={notification.id}
              notification={notification.notification}
            />
          );
        } else {
          return null;
        }
      })}
    </>
  );
};

export default AllNotification;
