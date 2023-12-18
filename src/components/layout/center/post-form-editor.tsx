"use client";

import {
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Progress,
} from "@nextui-org/react";

import React from "react";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";

import axios from "axios";
import { toast } from "sonner";
import { User } from "@prisma/client";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import dynamic from "next/dynamic";
import { DeltaStatic } from "quill";
import { AttachmentType } from "@/types/types";
import Image from "next/image";
import Attachment from "./attachment";

const QuillEditor = dynamic(() => import("./editor"), {
  ssr: false,
  loading: () => (
    <div className="h-8 mt-2">
      <p className="text-[20px] text-[#808080]">Whats happening?</p>
    </div>
  ),
});

type PostFormProps = {
  focusHandler: () => void;
  isFocus: boolean;
  user: User;
};

export default function PostFormEditor({
  focusHandler,
  isFocus,
  user,
}: PostFormProps) {
  const router = useRouter();

  const mediaRef = React.useRef<HTMLInputElement>(null);

  const [files, setFiles] = React.useState<AttachmentType[]>([]);
  const [content, setContent] = React.useState("");
  const [editorValue, setEditorValue] = React.useState<
    DeltaStatic | undefined
  >();
  const [charLength, setCharLength] = React.useState(0);

  const { mutate: mutateInfiniteScroll } = useInfiniteScroll();

  const { mutate: createPost, isLoading } = useMutation({
    mutationFn: async ({
      content,
      imageUrl,
    }: {
      content: any;
      imageUrl: string;
    }) => {
      const payload = {
        content,
        imageUrl,
      };

      const { data } = await axios.post("/api/post", payload);
      return data;
    },
    onError: () => {
      toast.error("Something went wrong", {
        description: "Failed to submit post, try again later.",
      });
    },
    onSuccess: () => {
      mutateInfiniteScroll();
      toast.success("Post has been created.");
      setContent("");
      router.refresh();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments: AttachmentType[] = Array.from(
        e.target.files,
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

      setFiles((prevFiles) => prevFiles.concat(newAttachments));
    }
  };

  const handleMedia = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isFocus) {
      focusHandler();
      return;
    }
    if (mediaRef && mediaRef.current) {
      mediaRef.current.click();
    }
  };

  const handleFileRemove = (url: string) => {
    setFiles((prevFiles) =>
      prevFiles.filter((attachment) => attachment.url !== url)
    );
  };

  const handlePostSubmit = async () => {
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
      createPost({ content: editorValue, imageUrl: "" });
      setEditorValue(undefined);
    }
  };

  const { isUploading, startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (file) => {
      if (file) {
        const fileUrl: string[] = [];
        file.map((f) => fileUrl.push(f.url));

        if (fileUrl.length === files.length) {
          createPost({ content: editorValue, imageUrl: fileUrl.toString() });
        }
      }

      setFiles([]);
      setEditorValue(undefined);
    },
    onUploadError: (error) => {
      toast.error("Failed to upload image.", {
        description: error.message,
      });
    },
    onUploadBegin: () => {
      // console.log("uploading");
    },
    onUploadProgress: (progress) => {},
  });

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
    <div className="w-full relative">
      {isLoading ||
        (isUploading && (
          <Progress
            size="sm"
            aria-label="Posting..."
            isIndeterminate
            classNames={{ indicator: "bg-blueProgress" }}
            radius="none"
            className="absolute md:-top-3 -top-4 right-0 bg-black z-50"
          />
        ))}
      <div className="flex relative justify-between py-2 px-4 gap-2 border-b">
        <div
          className={cn(
            isLoading || isUploading
              ? "absolute inset-0 bg-black/60 z-50 border-r"
              : "hidden"
          )}
        />
        <Image
          src={user.avatar}
          height={40}
          width={40}
          alt={user.name}
          priority
          className="rounded-full h-10 w-10"
        />
        <div className="w-full flex flex-col">
          {isFocus && !isUploading && !isLoading && (
            <Button
              variant="bordered"
              size="sm"
              className="ml-3 border border-gray hover:bg-blue/10 flex h-6 w-fit rounded-full px-3 text-sm leading-4 text-blue font-bold mb-2"
            >
              Everyone
              <Icons.arrowDown className="fill-blue h-[15px] w-[15px]" />
            </Button>
          )}
          <div className="ml-3">
            <div className="w-full">
              <QuillEditor
                focusHandler={focusHandler}
                editorValue={editorValue}
                setCharLength={setCharLength}
                setEditorValue={setEditorValue}
                className="max-w-4xl mx-auto relative py-2"
                placeholder="Whats happening?"
              />
            </div>
            <Attachment
              files={files}
              isLoading={isLoading}
              isUploading={isUploading}
              handleRemove={handleFileRemove}
            />
          </div>
          {isFocus && !isUploading && !isLoading && (
            <>
              <div className="flex ml-3 flex-col relative mt-2">
                <Button
                  variant="flat"
                  size="sm"
                  className="mb-[1px] 4absolute -left-3 flex items-center gap-2 w-fit rounded-full h-6 bg-transparent hover:bg-blue/10"
                >
                  <Icons.globe className="fill-blue w-5 h-5" />
                  <p className="text-sm font-semibold text-blue">
                    Everyone can reply
                  </p>
                </Button>
              </div>
              <div className="border-b border-[#2f3336] mt-4" />
            </>
          )}
          <div className="flex justify-between items-center mt-4">
            <input
              multiple
              type="file"
              className="hidden"
              ref={mediaRef}
              onChange={handleFileChange}
            />
            {!isUploading && !isLoading && (
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
            )}
            <div className="flex gap-2 items-center h-full">
              {charLength > 0 && !isUploading && !isLoading && (
                <>
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
                  <div className="px-[2px] h-full py-[2px]">
                    <Divider orientation="vertical" className="w-[1px]" />
                  </div>
                  {/* <Button
                  size="sm"
                  isIconOnly
                  className="rounded-full data-[hover=true]:bg-blue/10 h-[30px] w-[30px] border bg-black"
                >
                  <Icons.plusIcon className="h-4 w-4 fill-blue p-0" />
                </Button> */}
                </>
              )}
              {!isUploading && !isLoading && (
                <Button
                  size="sm"
                  isDisabled={isLoading || disabledByContent || isUploading}
                  onClick={handlePostSubmit}
                  className="bg-blue hover:bg-blue/90 font-bold rounded-full"
                >
                  Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
