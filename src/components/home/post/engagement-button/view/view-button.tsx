"use client";

import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";

type Props = {
  size: "sm" | "md";
};

const ViewButton = ({ size }: Props) => {
  return (
    <div className="flex flex-1">
      <Button
        aria-label="View"
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="group flex items-center justify-center outline-none"
      >
        <i
          className={cn(
            size === "sm" && "h-[34px] w-[34px]",
            size === "md" && "h-[38.5px] w-[38.5px]",
            "group-hover:bg-primary/10 group-focus-visible:outline group-focus-visible:outline-2 flex items-center justify-center rounded-full group-focus-visible:-outline-offset-2 group-focus-visible:outline-ring"
          )}
        >
          <Icons.view
            strokeWidth={2}
            className={cn(
              "fill-gray group-hover:fill-primary group-focus-visible:fill-primary",
              size === "sm" && "w-[18px] h-[18px]",
              size === "md" && "w-[22.5px] h-[22.5px]"
            )}
          />
        </i>
        <span className="sr-only">View </span>
        {/* <p className="text-gray text-[13px] leading-4 group-hover:text-primary tabular-nums px-1 -left-1 relative group-focus-within:text-primary">
          232
        </p> */}
      </Button>
    </div>
  );
};

export default ViewButton;
