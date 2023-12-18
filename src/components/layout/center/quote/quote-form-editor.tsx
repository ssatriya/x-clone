"use client";

import * as React from "react";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Avatar, Button, CircularProgress } from "@nextui-org/react";
import { User } from "@prisma/client";
import dynamic from "next/dynamic";
import { DeltaStatic, Sources } from "quill";
import { AttachmentType } from "@/types/types";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import { useMutation } from "@tanstack/react-query";
import { ReplyPayload } from "@/lib/validator/reply";
import axios from "axios";
import { uploadFiles } from "@/lib/uploadthing";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";

const QuillEditor = dynamic(() => import("../editor"), {
  ssr: false,
});

type QuoteFormEditorProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUser: User;
  files: AttachmentType[];
  editorValue: DeltaStatic | undefined;
  setCharLength: (value: number) => void;
  setEditorValue: (value: DeltaStatic) => void;
  charLength: number;
  handleRemoveImage: (url: string) => void;
};

export default function QuoteFormEditor({
  post,
  currentUser,
  files,
  editorValue,
  setCharLength,
  setEditorValue,
  charLength,
  handleRemoveImage,
}: QuoteFormEditorProps) {
  const className = cn(
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
    <div className="pt-4 w-full h-full">
      <div className="flex gap-3">
        <div>
          <Avatar src={currentUser.avatar} />
        </div>
        <div className="w-full h-24">
          <Button
            variant="bordered"
            size="sm"
            className="border border-gray hover:bg-blue/10 flex h-6 w-fit rounded-full px-3 text-sm leading-4 text-blue font-bold mb-4"
          >
            Everyone
            <Icons.arrowDown className="fill-blue h-[15px] w-[15px]" />
          </Button>
          <QuillEditor
            editorValue={editorValue}
            setCharLength={setCharLength}
            setEditorValue={setEditorValue}
            className="w-full"
            placeholder="Post your reply"
          />
        </div>
      </div>
      <div className={cn(className)}>
        {/* {files.map((attachment, i) => (
          <Attachment
            url={attachment.url}
            fill={files.length === 3 && i === 0}
            onRemoveAttachment={handleRemoveImage}
            key={i}
          />
        ))} */}
      </div>
      {/* <div className="w-full flex justify-between items-center">
        <input
          multiple
          type="file"
          className="hidden"
          ref={mediaRef}
          onChange={handleFileChange}
        />
        <div className="flex">
          <Button
            onClick={handleMedia}
            size="sm"
            isIconOnly
            className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
          >
            <Icons.media className="fill-blue w-5 h-5" />
          </Button>
          <Button
            size="sm"
            isIconOnly
            className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
          >
            <Icons.gif className="fill-blue w-5 h-5" />
          </Button>
          <Button
            size="sm"
            isIconOnly
            className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
          >
            <Icons.poll className="fill-blue w-5 h-5" />
          </Button>
          <Button
            size="sm"
            isIconOnly
            className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
          >
            <Icons.emoji className="fill-blue w-5 h-5" />
          </Button>
          <Button
            size="sm"
            isIconOnly
            className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
          >
            <Icons.schedule className="fill-blue w-5 h-5" />
          </Button>
          <Button
            size="sm"
            isIconOnly
            className="bg-transparent w-9 h-9 rounded-full hover:bg-blue/10"
          >
            <Icons.tagLocation className="fill-blue w-5 h-5" />
          </Button>
        </div>
        <div className="flex gap-2 items-center h-full">
          {charLength > 0 && (
            <CircularProgress
              size="sm"
              value={charLength}
              maxValue={280}
              color="primary"
              classNames={{
                svgWrapper:
                  "w-[30px] h-[30px] flex justify-center items-center",
                svg: "w-[20px] h-[20px]",
              }}
              aria-label="Reply length"
            />
          )}
          <Button
            onClick={handleReplySubmit}
            size="sm"
            isDisabled={disabledByContent}
            className="hover:bg-blue/90 w-fit px-4 rounded-full bg-blue text-sm leading-4 text-white font-bold"
          >
            Reply
          </Button>
        </div>
      </div> */}
    </div>
  );
}
