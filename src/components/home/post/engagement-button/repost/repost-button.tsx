"use client";

import { User } from "lucia";
import { Fragment, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import kyInstance from "@/lib/ky";
import Icons from "@/components/icons";
import QuoteModal from "./quote-modal";
import Button from "@/components/ui/button";
import { Media, QuoteInfo, RepostInfo } from "@/types";
import { CreateRepostPayload } from "@/lib/zod-schema";
import ButtonTooltip from "@/components/button-tooltip";
import StatNumber from "@/components/home/post/engagement-button/stat-number";

type Props = {
  loggedInUser: User;
  postId: string;
  originalPost: {
    name: string;
    userId: string;
    createdAt: Date;
    username: string;
    media: Media[];
    photo: string | null;
    content: string | null;
  };
  size: "sm" | "md";
  initialQuote: QuoteInfo;
  initialRepost: RepostInfo;
};

const RepostButton = ({
  size,
  postId,
  loggedInUser,
  originalPost,
  initialQuote,
  initialRepost,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { content, createdAt, media, photo, username, name, userId } =
    originalPost;

  const queryClient = useQueryClient();

  const repostQueryKey = ["get-repost", postId];
  const quoteQueryKey = ["get-quote", postId];

  const { data: repostData } = useQuery<RepostInfo>({
    queryKey: repostQueryKey,
    queryFn: () => kyInstance.get(`/api/post/repost?postId=${postId}`).json(),
    initialData: initialRepost,
    enabled: false,
  });

  const { data: quoteData } = useQuery<QuoteInfo>({
    queryKey: quoteQueryKey,
    queryFn: () => kyInstance.get(`/api/post/quote?postId=${postId}`).json(),
    initialData: initialQuote,
    enabled: false,
  });

  const hasNewRepostOrQuotes =
    repostData.repostCount > initialRepost.repostCount ||
    quoteData.quoteCount > initialQuote.quoteCount;

  const isRepostedOrQuotedByUser =
    initialRepost.isRepostedByUser || initialQuote.isQuotedByUser;

  const initialMoveValue =
    hasNewRepostOrQuotes || isRepostedOrQuotedByUser ? 25 : -25;

  const [move, setMove] = useState(initialMoveValue);

  const { mutate: repost } = useMutation({
    mutationKey: ["create-repost"],
    mutationFn: ({ repostTargetId, postType }: CreateRepostPayload) =>
      kyInstance.patch("/api/post/repost", {
        json: { repostTargetId, postType },
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: repostQueryKey });
      const previousRepost =
        queryClient.getQueryData<RepostInfo>(repostQueryKey);

      const newCount =
        (previousRepost?.repostCount || 0) +
        (previousRepost?.isRepostedByUser ? -1 : 1);

      queryClient.setQueryData<RepostInfo>(repostQueryKey, {
        repostCount: newCount,
        isRepostedByUser: !previousRepost?.isRepostedByUser,
      });

      if (previousRepost) {
        if (newCount > previousRepost.repostCount) {
          setMove(25);
        } else {
          setMove(-25);
        }
      }

      return { previousRepost };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<RepostInfo>(
        repostQueryKey,
        context?.previousRepost
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: repostQueryKey });
    },
  });

  const repostHandler = () => {
    setTimeout(() => {
      repost({ repostTargetId: postId, postType: "repost" });
    }, 200);
  };

  const totalCount = repostData.repostCount + quoteData.quoteCount;
  const repostOrQuotedByUser =
    repostData.isRepostedByUser || quoteData.isQuotedByUser;

  return (
    <div className="flex flex-1">
      <Menu>
        <ButtonTooltip content="Repost">
          <MenuButton as={Fragment}>
            <Button
              aria-label="Repost"
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="group flex items-center justify-center focus:outline-none"
            >
              <i
                className={cn(
                  size === "sm" && "h-[34px] w-[34px]",
                  size === "md" && "h-[38.5px] w-[38.5px]",
                  "group-focus-visible:outline group-focus-visible:outline-2 flex items-center justify-center rounded-full group-focus-visible:-outline-offset-2 group-focus-visible:outline-green-300 group-hover:bg-green-500/10"
                )}
              >
                <Icons.repost
                  className={cn(
                    repostOrQuotedByUser && "fill-green-500",
                    !repostOrQuotedByUser &&
                      "fill-gray group-hover:fill-green-500 group-focus-visible:fill-green-500",
                    size === "sm" && "w-[18px] h-[18px]",
                    size === "md" && "w-[22.5px] h-[22.5px]"
                  )}
                />
              </i>
              <StatNumber
                classNames={cn(
                  "group-hover:text-green-500 group-focus-visible:text-green-500",
                  repostOrQuotedByUser && "text-green-500",
                  !repostOrQuotedByUser && "text-gray"
                )}
                count={totalCount}
                isVisible={totalCount > 0}
                movePixel={move}
              />
            </Button>
          </MenuButton>
        </ButtonTooltip>
        <MenuItems
          anchor={{ to: "bottom end", gap: "-28px", offset: "28px" }}
          className="bg-black rounded-xl shadow-repost"
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem>
            {repostData.isRepostedByUser ? (
              <div
                className="flex items-center px-4 py-3 cursor-pointer data-[focus]:bg-white/5 select-none"
                onClick={repostHandler}
              >
                <div className="pr-3">
                  <Icons.repost className="w-[18px] h-[18px] fill-white" />
                </div>
                <span className="font-bold text-[15px] tracking-wide leading-5">
                  Undo repost
                </span>
              </div>
            ) : (
              <div
                className="flex items-center px-4 py-3 cursor-pointer data-[focus]:bg-white/5 select-none"
                onClick={repostHandler}
              >
                <div className="pr-3">
                  <Icons.repost className="w-[18px] h-[18px] fill-white" />
                </div>
                <span className="font-bold text-[15px] tracking-wide leading-5">
                  Repost
                </span>
              </div>
            )}
          </MenuItem>
          <MenuItem>
            <div
              onClick={() => setIsOpen(true)}
              className="flex items-center px-4 py-3 cursor-pointer data-[focus]:bg-white/5"
            >
              <div className="pr-3">
                <Icons.quote className="w-[18px] h-[18px] fill-white" />
              </div>
              <span className="font-bold text-[15px] tracking-wide leading-5">
                Quote
              </span>
            </div>
          </MenuItem>
        </MenuItems>
      </Menu>
      <QuoteModal
        postId={postId}
        isOpen={isOpen}
        setMove={setMove}
        originalPost={{
          name: name,
          photo: photo,
          media: media,
          userId: userId,
          content: content,
          username: username,
          createdAt: createdAt,
        }}
        setIsOpen={setIsOpen}
        loggedInUser={loggedInUser}
      />
    </div>
  );
};

export default RepostButton;
