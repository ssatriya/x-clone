"use client";

import * as React from "react";
import { Icons } from "@/components/icons";
import ReplyFormEditor from "@/components/layout/center/reply/reply-form-editor";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Progress,
} from "@nextui-org/react";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { User } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { usePress } from "react-aria";

type ReplyModal = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  isOpen: boolean;
  onOpenChange: () => void;
  currentUser: User;
  onOpen: () => void;
};

export default function ReplyModal({
  isOpen,
  onOpenChange,
  post,
  currentUser,
  onOpen,
}: ReplyModal) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const isMobile = useMediaQuery("(max-width: 420px)");
  const { pressProps, isPressed } = usePress({
    onPress: (e) => {
      // onOpenChange();
    },
  });

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

  const imgUrls = post.image_url?.split(",").join(", ");

  return (
    <Modal
      placement="top"
      hideCloseButton
      disableAnimation
      size={isMobile ? "full" : "2xl"}
      classNames={{
        base: "bg-black w-full max-sm:h-full w-[600px] lg:h-fit rounded-xl px-0",
        backdrop: "bg-backdrop",
      }}
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <div className="relative">
              {isLoading ||
                (isUploading && (
                  <Progress
                    size="sm"
                    aria-label="Posting..."
                    isIndeterminate
                    classNames={{
                      indicator: "bg-blueProgress",
                      track: "bg-transparent",
                    }}
                    radius="none"
                    className="absolute md:top-0 -top-4 w-full right-0 bg-black z-60"
                  />
                ))}
            </div>
            <ModalHeader
              className="flex flex-col gap-1 px-4 pt-2 h-[54px]"
              onClick={(e) => e.stopPropagation()}
            >
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
            <ModalBody onClick={(e) => e.stopPropagation()}>
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
                    <div>
                      <div
                        className="text-[15px] leading-5 pb-3"
                        dangerouslySetInnerHTML={{
                          __html: html + (imgUrls && imgUrls),
                        }}
                      />
                    </div>
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
                <ReplyFormEditor
                  post={post}
                  currentUser={currentUser}
                  onOpenChange={onOpenChange}
                  setIsLoading={setIsLoading}
                  setIsUploading={setIsUploading}
                />
              </div>
              {isMobile && <div className="h-full" {...pressProps} />}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
