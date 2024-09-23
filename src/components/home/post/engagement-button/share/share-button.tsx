"use client";

import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";

type Props = {
  size: "sm" | "md";
};

const ShareButton = ({ size }: Props) => {
  return (
    <div className="flex items-center group">
      <Button
        aria-label="Share"
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
          <Icons.share
            className={cn(
              "fill-gray group-hover:fill-primary group-focus-visible:fill-primary",
              size === "sm" && "w-[18px] h-[18px]",
              size === "md" && "w-[22.5px] h-[22.5px]"
            )}
          />
        </i>
      </Button>
      {/* <ButtonTooltip label="Share" /> */}
    </div>
  );
};

export default ShareButton;
