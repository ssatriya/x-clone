"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import { MediaFormat } from "@/types";
import Button from "@/components/ui/button";

type Props = {
  src: string;
  fill: boolean;
  mediaId: string;
  isPosting: boolean;
  isUploading: boolean;
  mediaFormat: MediaFormat;
  handleRemove: (mediaId: string) => void;
};

const MediaItem = ({
  src,
  mediaId,
  mediaFormat,
  fill,
  isPosting,
  handleRemove,
  isUploading,
}: Props) => {
  const styles = cn("overflow-hidden relative rounded-2xl shadow h-full", {
    "row-span-2": fill,
  });

  const imageType =
    mediaFormat == "jpeg" || mediaFormat == "jpg" || mediaFormat == "png";

  const disableRemoveButton = isPosting || isUploading;

  return (
    <div className={styles}>
      <div
        className={cn(
          isUploading ? "opacity-80" : "opacity-0",
          "absolute bg-black inset-0 flex items-center justify-center z-10 transition-opacity duration-200"
        )}
      />
      {!disableRemoveButton && (
        <div className="absolute right-1 top-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(mediaId)}
            className="absolute h-8 w-8 bg-zinc-900/70 z-10 right-1 top-1 hover:bg-zinc-700/70"
          >
            <Icons.close className="h-[18px] w-[18px] fill-secondary" />
          </Button>
        </div>
      )}
      {imageType && (
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
      {mediaFormat == "mp4" && (
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
      {mediaFormat == "gif" && (
        <div className="h-full w-full relative">
          <Image
            src={src}
            width={0}
            height={0}
            priority
            alt="media preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/70 h-5 flex items-center justify-center px-2.5 rounded-[4px]">
            <span className="text-xs leading-3 font-bold">GIF</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaItem;
