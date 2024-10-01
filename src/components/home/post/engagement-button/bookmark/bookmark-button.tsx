"use client";

import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import Button from "@/components/ui/button";
import ButtonTooltip from "@/components/button-tooltip";

type Props = {
  size: "sm" | "md";
  withCounter?: boolean;
};

const BookmarkButton = ({ size, withCounter }: Props) => {
  return (
    <div className="flex items-center group">
      <ButtonTooltip content="Bookmark">
        <Button
          aria-label="Bookmark"
          onClick={(e) => {
            e.stopPropagation();
          }}
          variant="ghost"
          size="icon"
          className="group flex items-center focus:outline-none"
        >
          <i
            className={cn(
              size === "sm" && "h-[34px] w-[34px]",
              size === "md" && "h-[38.5px] w-[38.5px]",
              "group-hover:bg-primary/10 group-focus-visible:outline group-focus-visible:outline-2 flex items-center justify-center rounded-full group-focus-visible:-outline-offset-2 group-focus-visible:outline-ring"
            )}
          >
            <Icons.bookmark
              className={cn(
                "fill-gray group-hover:fill-primary group-focus-visible:fill-primary",
                size === "sm" && "w-[18px] h-[18px]",
                size === "md" && "w-[22.5px] h-[22.5px]"
              )}
            />
          </i>
          {/* <StatNumber
            classNames="text-gray group-hover:text-primary group-focus-visible:text-primary relative"
            count={replyCount}
            isVisible={replyCount > 0}
            movePixel={move}
          /> */}
          {withCounter && (
            <p className="text-gray text-[13px] leading-4 group-hover:text-primary px-1 -left-2 relative select-none group-focus-within:text-primary">
              12
            </p>
          )}
        </Button>
      </ButtonTooltip>
    </div>
  );
};

export default BookmarkButton;
