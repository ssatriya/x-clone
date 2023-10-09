"use client";

import { Icons } from "@/components/icons";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  RepostPost,
} from "@/types/db";
import { Button, Image } from "@nextui-org/react";
import { Post } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
// import Image from "next/image";

import { useRouter } from "next/navigation";
import * as React from "react";
import PostActionButton from "./post/action-button/post-action-button";

type PhotoModalProps = {
  params: {
    photoIndex: string;
    postId: string;
    username: string;
  };
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
  currentUserId?: string;
};

export default function PhotoModal({
  params,
  post,
  currentUserId,
}: PhotoModalProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = React.useState("");

  const handleClose = () => {
    router.back();
  };

  const imageArr = post.image_url!.split(",");
  const photoIndex = params.photoIndex;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50" onClick={handleClose}>
        <div className="relative flex justify-between items-center">
          <Button
            onClick={handleClose}
            isIconOnly
            className="rounded-full absolute left-3 top-3 bg-transparent hover:bg-text/10"
          >
            <Icons.close className="fill-text h-5 w-5" strokeWidth={2} />
          </Button>
          <Button
            isIconOnly
            className="rounded-full absolute right-3 z-50 top-3 bg-transparent hover:bg-text/10"
          >
            <Icons.hideIcon className="fill-text h-5 w-5" strokeWidth={2} />
          </Button>
        </div>
        <div className="flex items-center justify-between h-full mx-auto">
          <div
            className="mx-auto relative px-4 w-fit rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col justify-center items-center">
              <div className="flex items-center gap-12">
                <Button
                  isIconOnly
                  className="rounded-full bg-transparent hover:bg-text/10"
                >
                  <Icons.arrowLeft className="h-5 w-5 fill-text" />
                </Button>
                <Image
                  src={imageArr.at(Number(photoIndex) - 1)!}
                  alt=""
                  classNames={{
                    img: "max-w-6xl",
                  }}
                />
                <Button
                  isIconOnly
                  className="rounded-full bg-transparent hover:bg-text/10"
                >
                  <Icons.arrowRight className="h-5 w-5 fill-text" />
                </Button>
              </div>
            </div>
            <div className="w-[700px]">
              <PostActionButton
                post={post}
                reposts={post.reposts}
                currentUserId={currentUserId}
              />
            </div>
          </div>
          <div
            className="bg-black w-[400px] h-full py-20 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {post.user_one.name}
          </div>
        </div>
      </div>
    </>
  );
}
