"use client";

import * as React from "react";
import { cn, removeAtSymbol } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { Post } from "@prisma/client";

type AttachmentPostProps = {
  // user: UserWithFollowersFollowing
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  imageUrl: string;
};

export default function AttachmentPost({
  imageUrl,
  post,
}: AttachmentPostProps) {
  const router = useRouter();

  const clickHandle = (photoIndex: number) => {
    const cleanUsername = removeAtSymbol(post.user_one.username);
    const lightBoxUrl = `/${cleanUsername}/status/${post.id}/photo/${photoIndex}`;
    router.push(lightBoxUrl);
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

        return (
          <div key={image + i} className={innerClassName}>
            <img
              onClick={(e) => {
                e.stopPropagation();
                clickHandle(Number(i) + 1);
              }}
              className={cn(borderImage, "h-full w-full object-cover")}
              alt="Attachment"
              src={image}
            />
          </div>
        );
      })}
    </div>
  );
}
