"use client";

import * as React from "react";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Avatar, Button, CircularProgress, Divider } from "@nextui-org/react";
import { User } from "@prisma/client";
import dynamic from "next/dynamic";
import { DeltaStatic, Sources } from "quill";
import { Attachment } from "@/components/layout/center/post-form-editor";
import { AttachmentType } from "@/types/types";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReplyPayload } from "@/lib/validator/reply";
import axios from "axios";
import { uploadFiles } from "@/lib/uploadthing";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";

const QuillEditor = dynamic(() => import("../../editor"), {
  ssr: false,
});

type InlineReplyFormEditorProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUser: User;
};

export default function InlineReplyFormEditor({
  currentUser,
  post,
}: InlineReplyFormEditorProps) {
  const queryClient = useQueryClient();
  const { mutate: mutateInfiniteScroll } = useInfiniteScroll();
  const [editorValue, setEditorValue] = React.useState<
    DeltaStatic | undefined
  >();
  const [charLength, setCharLength] = React.useState(0);

  const [files, setFiles] = React.useState<AttachmentType[]>([]);

  const mediaRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments: AttachmentType[] = Array.from(e.target.files).map(
        (file) => ({
          type: "IMAGE",
          url: URL.createObjectURL(file),
          mime: file.type,
          name: file.name,
          extension: file.name.split(".").pop() as string,
          size: file.size.toString(),
          file: file,
        })
      );

      setFiles((prevFiles) => [...prevFiles, ...newAttachments]);
    }
  };

  const handleMedia = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (mediaRef && mediaRef.current) {
      mediaRef.current.click();
    }
  };

  const handleRemoveImage = (url: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((attachment) => attachment.url !== url)
    );
  };

  const { mutate: createReply } = useMutation({
    mutationKey: ["replyMutation"],
    mutationFn: async ({
      postRepliedToId,
      originalPostOwnerId,
      content,
      imageUrl,
    }: {
      postRepliedToId: string;
      originalPostOwnerId: string;
      content: any;
      imageUrl: string;
    }) => {
      const payload: ReplyPayload = {
        postRepliedToId,
        originalPostOwnerId,
        content,
        imageUrl,
      };

      const { data } = await axios.post("/api/post/reply", payload);
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repliedToPost"] });
      setEditorValue(undefined);
      setFiles([]);
      toast.success("Reply has been created.");
    },
  });

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

  const handleReplySubmit = async () => {
    if (files) {
      const allFiles: File[] = [];
      files.map((file: AttachmentType) => {
        allFiles.push(file.file);
      });

      const res = await uploadFiles({
        files: allFiles,
        endpoint: "imageUploader",
        onUploadProgress: ({ file, progress }) => {
          // console.log(file === files);
          // calculateImageProgress(allFiles.length, file)
        },
      });

      if (res) {
        const urls: string[] = [];
        res.map((r) => {
          urls.push(r.url);
        });

        createReply({
          postRepliedToId: post.id,
          originalPostOwnerId: post.user_one.id,
          content: editorValue,
          imageUrl: [...urls].toString(),
        });

        return;
      }
    }

    createReply({
      postRepliedToId: post.id,
      originalPostOwnerId: post.user_one.id,
      content: editorValue,
      imageUrl: "",
    });
  };

  let disabledByContent: boolean = true;

  if (charLength === 0 && files.length > 0) {
    disabledByContent = false;
  } else if (charLength > 0 && files.length === 0) {
    disabledByContent = false;
  } else if (charLength > 0 && files.length > 0) {
    disabledByContent = false;
  } else {
    disabledByContent = true;
  }

  return (
    <div className="w-full flex justify-between pt-2 gap-1">
      <div className="h-fit">
        <Avatar showFallback src={currentUser.avatar} />
      </div>
      <div className="w-full flex flex-col">
        <div className="w-full ml-3">
          <QuillEditor
            editorValue={editorValue}
            setCharLength={setCharLength}
            setEditorValue={setEditorValue}
            className="w-full"
            placeholder="Post your reply"
          />
        </div>
        <div className={cn(className)}>
          {files.map((attachment, i) => (
            <Attachment
              url={attachment.url}
              fill={files.length === 3 && i === 0}
              onRemoveAttachment={handleRemoveImage}
              key={i}
            />
          ))}
        </div>
        <div className="flex justify-between items-center mt-4">
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
              <Icons.emoji className="fill-blue w-5 h-5" />
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
                aria-label="Post length"
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
        </div>
      </div>
    </div>
  );
}
