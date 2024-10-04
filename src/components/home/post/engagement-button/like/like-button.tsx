"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import kyInstance from "@/lib/ky";
import { LikeInfo } from "@/types";
import Icons from "@/components/icons";
import StatNumber from "../stat-number";
import Button from "@/components/ui/button";
import { CreateLikePayload } from "@/lib/zod-schema";
import ButtonTooltip from "@/components/button-tooltip";

type Props = {
  userId: string;
  postId: string;
  size: "sm" | "md";
  initialLike: LikeInfo;
};

const LikeButton = ({ userId, postId, initialLike, size }: Props) => {
  const queryClient = useQueryClient();

  const queryKey = ["get-like", postId];

  const { data: likeData } = useQuery<LikeInfo>({
    queryKey: queryKey,
    queryFn: () =>
      kyInstance.get(`/api/post/like?postId=${postId}`).json<LikeInfo>(),
    initialData: initialLike,
    refetchOnMount: false,
  });

  const [move, setMove] = useState(
    likeData.likeCount > initialLike.likeCount
      ? 25
      : initialLike.isLikedByUser
      ? 25
      : -25
  );

  const { mutate: likeMutate } = useMutation({
    mutationKey: ["create-like"],
    mutationFn: ({ likeTargetId }: CreateLikePayload) =>
      kyInstance.patch("/api/post/like", { json: { likeTargetId, userId } }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKey });

      const previousLike = queryClient.getQueryData<LikeInfo>(queryKey);

      const newCount =
        (previousLike?.likeCount || 0) + (previousLike?.isLikedByUser ? -1 : 1);

      queryClient.setQueryData<LikeInfo>(queryKey, {
        likeCount: newCount,
        isLikedByUser: !previousLike?.isLikedByUser,
      });

      if (previousLike) {
        if (newCount > previousLike.likeCount) {
          setMove(25);
        } else {
          setMove(-25);
        }
      }

      return { previousLike };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<LikeInfo>(queryKey, context?.previousLike);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  const likeHandler = () => {
    likeMutate({ likeTargetId: postId, userId: userId });
  };

  return (
    <div className="flex flex-1">
      <ButtonTooltip content="Like">
        <Button
          aria-label="Like"
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            likeHandler();
          }}
          className="group flex items-center justify-center focus:outline-none"
        >
          <i
            className={cn(
              size === "sm" && "h-[34px] w-[34px]",
              size === "md" && "h-[38.5px] w-[38.5px]",
              " group-hover:bg-like/10 group-focus-visible:outline group-focus-visible:outline-2 flex items-center justify-center rounded-full group-focus-visible:-outline-offset-2 group-focus-visible:outline-red-300"
            )}
          >
            <Icons.like
              strokeWidth={2}
              className={cn(
                likeData.isLikedByUser && "fill-like stroke-like",
                !likeData.isLikedByUser && "fill-transparent stroke-gray",
                "group-hover:stroke-like group-focus-visible:fill-like group-focus-visible:stroke-like",
                size === "sm" && "w-[18px] h-[18px]",
                size === "md" && "w-[22.5px] h-[22.5px]"
              )}
            />
          </i>
          <StatNumber
            classNames={cn(
              "group-hover:text-like group-focus-visible:text-like",
              likeData.isLikedByUser && "text-like",
              !likeData.isLikedByUser && "text-gray"
            )}
            count={likeData.likeCount}
            isVisible={likeData.likeCount > 0}
            movePixel={move}
          />
        </Button>
      </ButtonTooltip>
    </div>
  );
};

export default LikeButton;
