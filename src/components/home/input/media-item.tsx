"use client";

import Image from "next/image";
import { Button } from "@nextui-org/react";

import { cn } from "@/lib/utils";
import Icons from "@/components/icons";

type Props = {
  src: string;
  mediaId: string;
  mediaType: string;
  fill: boolean;
  isPosting: boolean;
  handleRemove: (mediaId: string) => void;
};

const MediaItem = ({
  src,
  mediaId,
  mediaType,
  fill,
  isPosting,
  handleRemove,
}: Props) => {
  const styles = cn("overflow-hidden relative rounded-2xl shadow h-full", {
    "row-span-2": fill,
  });
  const type = mediaType.split("/")[0] as "image" | "video";

  return (
    <div className={styles}>
      {!isPosting && (
        <div className="absolute right-1 top-1">
          <Button
            disabled={isPosting}
            onClick={() => handleRemove(mediaId)}
            isIconOnly
            size="sm"
            className="absolute min-w-0 bg-zinc-900/70 rounded-full z-10 right-1 top-1 hover:bg-zinc-700/70"
          >
            <Icons.close className="h-[18px] w-[18px] fill-secondary" />
          </Button>
        </div>
      )}
      {type == "image" && (
        <div className="relative h-full w-full overflow-auto">
          <Image
            src={src}
            width={0}
            height={0}
            priority
            alt="media preview"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      {type == "video" && (
        <div className="h-full w-full">
          <video
            height={290}
            controls
            loop
            playsInline
            className="rounded-2xl h-full w-full object-contain overflow-clip"
          >
            <source src={src} />
          </video>
        </div>
      )}
    </div>
  );
};

export default MediaItem;
