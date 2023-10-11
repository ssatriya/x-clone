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
} from "@nextui-org/react";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { User } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";

type ReplyModal = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  isOpen: boolean;
  onOpenChange: () => void;
  currentUser: User;
};

export default function ReplyModal({
  isOpen,
  onOpenChange,
  post,
  currentUser,
}: ReplyModal) {
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
            <ModalHeader className="flex flex-col gap-1 px-4 pt-2 h-[54px]">
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
                {/* Editor */}
                <ReplyFormEditor post={post} currentUser={currentUser} />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
