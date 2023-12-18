"use client";

import { cn } from "@/lib/utils";
import { AttachmentType } from "@/types/types";
import AttachmentItem from "./attachment-item";

type AttachmentProps = {
  files: AttachmentType[];
  isLoading: boolean;
  isUploading: boolean;
  handleRemove?: (url: string) => void;
};

export default function Attachment({
  files,
  isLoading,
  isUploading,
  handleRemove,
}: AttachmentProps) {
  const gridStyles = cn(
    files.length > 0 ? "h-[300px] mb-4" : "",
    "grid gap-2 w-full",
    {
      "grid-rows-1": files.length <= 2,
      "grid-rows-2": files.length > 2,
      "grid-cols-1": files.length === 1,
      "grid-cols-2": files.length > 1,
    }
  );

  return (
    <div className={cn(gridStyles)}>
      {files.map((attachment, i) => (
        <AttachmentItem
          key={i}
          isLoading={isLoading}
          isUploading={isUploading}
          url={attachment.url}
          fill={files.length === 3 && i === 0}
          onRemoveAttachment={handleRemove}
        />
      ))}
    </div>
  );
}
