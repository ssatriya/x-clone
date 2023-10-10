"use client";

import * as React from "react";
import { Icons } from "@/components/icons";
import ReplyFormEditor from "@/components/layout/center/reply/reply-form-editor";
import { cn, formatTimeToNow } from "@/lib/utils";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import {
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { DeltaStatic } from "quill";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { User } from "@prisma/client";
import { AttachmentType } from "@/types/types";
import { Attachment } from "@/components/layout/center/post-form-editor";
import { useMutation } from "@tanstack/react-query";
import { ReplyPayload } from "@/lib/validator/reply";
import axios from "axios";
import { uploadFiles } from "@/lib/uploadthing";

type ReplyModal = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
  currentUser: User;
};

export default function ReplyModal({
  isOpen,
  onOpen,
  onOpenChange,
  post,
  currentUser,
}: ReplyModal) {
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

  const cfg = {};
  let html = "";
  // @ts-ignore
  if (post.content && post.content.ops) {
    // @ts-ignore
    const converter = new QuillDeltaToHtmlConverter(post.content.ops, cfg);
    const converted = converter.convert();
    if (converted !== "<p><br/></p>") {
      html = converted;
    }
  }

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

        // const newData = {
        //   ...data,
        //   imageUrl: [...urls].toString()
        // }

        createReply({
          postRepliedToId: post.id,
          originalPostOwnerId: post.user_one.id,
          content: editorValue,
          imageUrl: [...urls].toString(),
        });
        setEditorValue(undefined);
        setFiles([]);
        return;
      }
    }

    createReply({
      postRepliedToId: post.id,
      originalPostOwnerId: post.user_one.id,
      content: editorValue,
      imageUrl: "",
    });
    setEditorValue(undefined);
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
    <Modal
      placement="top"
      hideCloseButton
      disableAnimation
      size="2xl"
      classNames={{
        base: "bg-black w-full w-[600px] h-fit rounded-xl px-0",
        backdrop: "bg-blue/10",
      }}
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 px-4 h-[54px]">
              <div className="flex w-full justify-between">
                <Button
                  onClick={onClose}
                  isIconOnly
                  size="sm"
                  className="hover:bg-blue/10 w-fit rounded-full bg-transparent"
                >
                  <Icons.close className="fill-text h-5 w-5" />
                </Button>
                <Button
                  size="sm"
                  className="hover:bg-blue/10 w-fit px-4 rounded-full bg-transparent text-sm leading-4 text-blue font-bold"
                >
                  Draft
                </Button>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="pt-4">
                <div className="flex gap-3">
                  <div className="flex flex-col h-full">
                    <Avatar src={post.user_one.avatar} />
                    <div className="w-[2px] h-full bg-gray" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-2">
                      <p className="font-bold text-[15px]">
                        {post.user_one.name}
                      </p>
                      <p className="text-[15px] text-gray">
                        {post.user_one.username}
                      </p>
                      <span className="text-gray">·</span>
                      <p className="text-gray text-[15px]">
                        {formatTimeToNow(new Date(post.createdAt))}
                      </p>
                    </div>
                    <div
                      className="text-[15px] leading-5 pb-3"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                    <div className="pt-2 pb-4 text-[15px] leading-5">
                      <p className="text-gray">
                        Replying to{" "}
                        <span className="text-blue">
                          {post.user_one.username}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                {/* Editor */}
                <ReplyFormEditor
                  setEditorValue={setEditorValue}
                  setCharLength={setCharLength}
                  editorValue={editorValue}
                  currentUser={currentUser}
                />
                {/* Attachment preview */}
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
              </div>

              {/* From here */}
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
                    onClick={handleReplySubmit}
                    size="sm"
                    isDisabled={disabledByContent}
                    className="hover:bg-blue/90 w-fit px-4 rounded-full bg-blue text-sm leading-4 text-white font-bold"
                  >
                    Reply
                  </Button>
                </div>
              </div>
              {/* To here */}
            </ModalBody>
            {/* <ModalFooter>
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
                    onClick={handleReplySubmit}
                    size="sm"
                    isDisabled={disabledByContent}
                    className="hover:bg-blue/90 w-fit px-4 rounded-full bg-blue text-sm leading-4 text-white font-bold"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </ModalFooter> */}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
