"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@nextui-org/react";

type AttachmentItemProps = {
  url: string;
  fill: boolean;
  isLoading: boolean;
  isUploading: boolean;
  onRemoveAttachment?: (url: string) => void;
};
export default function AttachmentItem({
  url,
  fill,
  isUploading,
  isLoading,
  onRemoveAttachment,
}: AttachmentItemProps) {
  const attachmentItemStyles = cn(
    "overflow-hidden relative rounded-2xl shadow",
    {
      "row-span-2": fill,
    }
  );
  return (
    <div className={attachmentItemStyles}>
      {onRemoveAttachment && (
        <div className="absolute right-1 top-1">
          {isLoading ||
            (!isUploading && (
              <Button
                disabled={isLoading || isUploading}
                onClick={() => onRemoveAttachment(url)}
                isIconOnly
                size="sm"
                className="absolute bg-black/70 rounded-full z-50 right-1 top-1"
              >
                <Icons.close className="h-[18px] w-[18px] fill-text" />
              </Button>
            ))}
        </div>
      )}
      <img className="h-full w-full object-cover" alt="Attachment" src={url} />
    </div>
  );
}
