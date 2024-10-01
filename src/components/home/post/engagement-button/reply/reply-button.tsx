"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { User } from "lucia";
import { cn } from "@/lib/utils";
import kyInstance from "@/lib/ky";
import Icons from "@/components/icons";
import StatNumber from "../stat-number";
import ReplyModal from "./reply-modal";
import { ReplyCountInfo } from "@/types";
import Button from "@/components/ui/button";
import ButtonTooltip from "@/components/button-tooltip";

type Props = {
  loggedInUser: User;
  post: {
    id: string;
    createdAt: Date;
    rootPostId: string;
    replyCount: number;
    content: string | null;
  };
  user: {
    name: string;
    username: string;
    photo: string | null;
  };
  initialReplyCount: number;
  size: "sm" | "md";
};

const ReplyButton = ({
  loggedInUser,
  post,
  user,
  size,
  initialReplyCount,
}: Props) => {
  const [move, setMove] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const queryKey = ["get-reply-count", post.id];

  const {
    data: { replyCount },
  } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/post/reply?postId=${post.id}`)
        .json<ReplyCountInfo>(),
    initialData: {
      replyCount: initialReplyCount,
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (replyCount > initialReplyCount) {
      setMove(25);
    } else {
      setMove(-25);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyCount]);

  return (
    <div className="flex flex-1 relative right-2">
      <ButtonTooltip content="Reply">
        <Button
          aria-label="Reply"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          variant="ghost"
          size="icon"
          className="group flex items-center justify-center focus:outline-none"
        >
          <i
            className={cn(
              size === "sm" && "h-[34px] w-[34px]",
              size === "md" && "h-[38.5px] w-[38.5px]",
              "group-hover:bg-primary/10 group-focus-visible:outline group-focus-visible:outline-2 flex items-center justify-center rounded-full group-focus-visible:-outline-offset-2 group-focus-visible:outline-ring"
            )}
          >
            <Icons.reply
              className={cn(
                "fill-gray group-hover:fill-primary group-focus-visible:fill-primary",
                size === "sm" && "w-[18px] h-[18px]",
                size === "md" && "w-[22.5px] h-[22.5px]"
              )}
            />
          </i>
          <StatNumber
            classNames="text-gray group-hover:text-primary group-focus-visible:text-primary relative"
            count={replyCount}
            isVisible={replyCount > 0}
            movePixel={move}
          />
        </Button>
      </ButtonTooltip>
      <ReplyModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        loggedInUser={loggedInUser}
        post={{
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          rootPostId: post.rootPostId,
        }}
        user={{
          name: user.name,
          username: user.username,
          photo: user.photo,
        }}
      />
    </div>
  );
};

export default ReplyButton;
