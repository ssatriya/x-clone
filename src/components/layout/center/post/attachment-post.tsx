"use client";

import * as React from "react";
import { cn, removeAtSymbol } from "@/lib/utils";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import Image from "next/image";
import Link from "next/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

type AttachmentPostProps = {
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  imageUrl: string;
};

export default function AttachmentPost({
  imageUrl,
  post,
}: AttachmentPostProps) {
  const router = useRouter();
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

        const cleanUsername = removeAtSymbol(post.user_one.username);

        return (
          <div key={image + i} className={cn(innerClassName)}>
            <Link
              onMouseDown={(e) => {
                if (e.button === 1) {
                  e.stopPropagation();
                  scrollClickHandle();
                }
              }}
              href={`/${cleanUsername}/status/${post.id}/photo/${i + 1}`}
              scroll={false}
            >
              <Image
                src={image}
                fill
                sizes="(max-widht: 600px) 512px"
                className={cn(borderImage, "h-full w-full object-cover border")}
                alt="attachment"
                priority
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
