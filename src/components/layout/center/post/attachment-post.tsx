"use client";

import * as React from "react";
import { cn, removeAtSymbol } from "@/lib/utils";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePrevPath } from "@/hooks/usePrevPath";
import LightboxModal from "./lightbox/lightbox-modal";
import { useDisclosure } from "@nextui-org/react";
import { usePhotoNumber } from "@/hooks/usePhotoNumber";
import { usePhotoModal } from "@/hooks/usePhotoModal";

type AttachmentPostProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  imageUrl: string;
  currentUser: UserWithFollowersFollowing;
};

export default function AttachmentPost({
  imageUrl,
  post,
  currentUser,
}: AttachmentPostProps) {
  const path = usePathname();
  const setPhotoNumber = usePhotoNumber((state) => state.setPhotoNumber);

  const scrollClickHandle = () => {
    const cleanUsername = removeAtSymbol(post.user_one.username);
    const singlePost = `/${cleanUsername}/status/${post.id}`;

    window.open(singlePost);
  };

  const imageUrlArray: string[] = imageUrl.split(",");

  const className = cn(
    imageUrlArray.length > 0 ? "h-[300px] mb-4" : "",
    "grid gap-[2px] w-full",
    {
      "grid-rows-1": imageUrlArray.length <= 2,
      "grid-rows-2": imageUrlArray.length > 2,
      "grid-cols-1": imageUrlArray.length === 1,
      "grid-cols-2": imageUrlArray.length > 1,
    }
  );

  const { prevPath } = usePrevPath((state) => state);
  const onAttachmentClick = () => {
    prevPath(path);
  };

  const onOpen = usePhotoModal((state) => state.onOpen);
  const onClose = usePhotoModal((state) => state.onClose);
  const isOpen = usePhotoModal((state) => state.isOpen);
  const modalId = usePhotoModal((state) => state.id);

  const cleanUsername = removeAtSymbol(post.user_one.username);
  return (
    <div className={cn(className)}>
      {imageUrlArray.map((image, i) => {
        const fill = imageUrlArray.length === 3 && i === 0;
        const innerClassName = cn("overflow-hidden relative shadow", {
          "row-span-2": fill,
        });

        let borderImage: string = "rounded-2xl";

        if (imageUrlArray.length === 4) {
          borderImage = cn({
            "rounded-tl-2xl": i === 0,
            "rounded-tr-2xl": i === 1,
            "rounded-bl-2xl": i === 2,
            "rounded-br-2xl": i === 3,
          });
        } else if (imageUrlArray.length === 3) {
          borderImage = cn({
            "rounded-l-2xl": i === 0,
            "rounded-tr-2xl": i === 1,
            "rounded-br-2xl": i === 2,
          });
        } else if (imageUrlArray.length === 2) {
          borderImage = cn({
            "rounded-l-2xl": i === 0,
            "rounded-r-2xl": i === 1,
          });
        }

        return (
          <div key={image + i} className={cn(innerClassName)}>
            <div
              onMouseDown={(e) => {
                if (e.button === 1) {
                  e.stopPropagation();
                  scrollClickHandle();
                }
              }}
              onClick={() => {
                onAttachmentClick();
              }}
            >
              <Image
                onClick={() => {
                  onOpen(post.id);
                  window.history.pushState(
                    "page2",
                    "Title",
                    `/${cleanUsername}/status/${post.id}/photo/${i + 1}`
                  );

                  setPhotoNumber(i + 1);
                }}
                src={image}
                fill
                sizes="(max-widht: 600px) 512px"
                className={cn(
                  "h-full w-full object-cover border cursor-pointer",
                  borderImage
                )}
                alt="attachment"
                priority
              />
            </div>
            {/* <Link
              onMouseDown={(e) => {
                if (e.button === 1) {
                  e.stopPropagation();
                  scrollClickHandle();
                }
              }}
              as={`/${cleanUsername}/status/${post.id}/photo/${i + 1}`}
              href={`/${cleanUsername}/status/${post.id}/photo/${i + 1}`}
              scroll={false}
              onClick={onAttachmentClick}
            >
            <Image
            src={image}
                fill
                sizes="(max-widht: 600px) 512px"
                className={cn(borderImage, "h-full w-full object-cover border")}
                alt="attachment"
                priority
                />
              </Link> */}
          </div>
        );
      })}
      <LightboxModal
        modalId={modalId}
        onClose={onClose}
        isOpen={isOpen}
        username={cleanUsername}
        currentUser={currentUser}
        imageUrlArray={imageUrlArray}
        post={post}
      />
    </div>
  );
}
