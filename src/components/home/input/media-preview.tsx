"use client";

import { cn } from "@/lib/utils";
import MediaItem from "./media-item";
import { FileWithPreview } from "@/types";

type Props = {
  isPosting: boolean;
  files: FileWithPreview[];
  handleRemove: (mediaId: string) => void;
};

const MediaPreview = ({ isPosting, files, handleRemove }: Props) => {
  const gridStyles = cn(
    files.length > 1 && "h-[300px] mb-4",
    files.length === 1 && "max-h-[685px] mb-4",
    "grid gap-2 w-full",
    {
      "grid-rows-1": files.length <= 2,
      "grid-rows-2": files.length > 2,
      "grid-cols-1": files.length === 1,
      "grid-cols-2": files.length > 1,
    }
  );

  return (
    <div className={gridStyles}>
      {files.map((media, i) => {
        const {
          file: { type },
          meta: { id, preview },
        } = media;

        return (
          <MediaItem
            key={id}
            mediaId={id}
            mediaType={type}
            src={preview}
            fill={files.length === 3 && i === 0}
            handleRemove={handleRemove}
            isPosting={isPosting}
          />
        );
      })}
    </div>
  );
};

export default MediaPreview;
