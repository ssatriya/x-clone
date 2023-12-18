"use client";

import * as React from "react";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Avatar, Button, CircularProgress } from "@nextui-org/react";
import { User } from "@prisma/client";
import dynamic from "next/dynamic";
import { DeltaStatic, Sources } from "quill";

import Attachment from "../attachment";
import { AttachmentType } from "@/types/types";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReplyPayload } from "@/lib/validator/reply";
import axios from "axios";
import { uploadFiles, useUploadThing } from "@/lib/uploadthing";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";

const QuillEditor = dynamic(() => import("../editor"), {
  ssr: false,
});

type ReplyFormEditorProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUser: User;
  onOpenChange: () => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ReplyFormEditor({
  post,
  currentUser,
  onOpenChange,
  setIsLoading,
  setIsUploading,
}: ReplyFormEditorProps) {
  // const { mutate: mutateInfiniteScroll } = useInfiniteScroll();
  const queryClient = useQueryClient();

  const mediaRef = React.useRef<HTMLInputElement>(null);

  const [editorValue, setEditorValue] = React.useState<
    DeltaStatic | undefined
  >();
  const [charLength, setCharLength] = React.useState(0);
  const [files, setFiles] = React.useState<AttachmentType[]>([]);

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

  const handleFileRemove = (url: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((attachment) => attachment.url !== url)
    );
  };

  const { mutate: createReplyFromModal, isLoading } = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["replyComment", post.id] });
      queryClient.invalidateQueries({ queryKey: ["replyData", post.id] });
      setEditorValue(undefined);
      setFiles([]);
      toast.success("Replied successfully");
      onOpenChange();
    },
  });

  const handleReplySubmit = async () => {
    if (!files && charLength === 0) {
      return;
    }

    if (files && charLength === 0) {
      if (files) {
        const allFiles: File[] = [];
        files.map((file) => allFiles.push(file.file));

        if (allFiles.length === files.length) {
          startUpload(allFiles);
        }
      }
    } else if (files && charLength > 0) {
      const allFiles: File[] = [];
      files.map((file) => allFiles.push(file.file));

      if (allFiles.length === files.length) {
        startUpload(allFiles);
      }
    } else if (!files && charLength > 0) {
      createReplyFromModal({
        postRepliedToId: post.id,
        originalPostOwnerId: post.user_one.id,
        content: editorValue,
        imageUrl: "",
      });
    }
  };

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (file) => {
      if (file) {
        const fileUrl: string[] = [];
        file.map((f) => fileUrl.push(f.url));

        if (fileUrl.length === files.length) {
          createReplyFromModal({
            postRepliedToId: post.id,
            originalPostOwnerId: post.user_one.id,
            content: editorValue,
            imageUrl: fileUrl.toString(),
          });
        }
      }

      setFiles([]);
      setEditorValue(undefined);
    },
  });

  React.useEffect(() => {
    setIsLoading(isLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  React.useEffect(() => {
    setIsUploading(isUploading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploading]);

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
    <div className="pt-4 w-full h-full">
      <div className="flex gap-3">
        <div>
          <Avatar src={currentUser.avatar} />
        </div>
        <div className="w-full h-24">
          <QuillEditor
            editorValue={editorValue}
            setCharLength={setCharLength}
            setEditorValue={setEditorValue}
            className="w-full"
            placeholder="Post your reply"
          />
        </div>
      </div>
      <Attachment
        files={files}
        isLoading={isLoading}
        isUploading={isUploading}
        handleRemove={handleFileRemove}
      />
      <div className="w-full flex justify-between items-center">
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
            disabled={charLength === 0 || isLoading}
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
  );
}
