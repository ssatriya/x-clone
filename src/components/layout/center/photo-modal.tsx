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
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    router.back();
  };

  const imageArr = post.image_url!.split(",");
  const photoIndex = params.photoIndex;

  const handleRight = (value: number) => {};

  React.useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div className="fixed inset-0 bg-black opacity-75"></div>

      <div className="flex relative w-full h-full">
        <div className="relative flex-1">
          <Button
            onClick={handleClose}
            isIconOnly
            className="rounded-full absolute left-3 top-3 z-50 bg-transparent hover:bg-text/10"
          >
            <Icons.close className="fill-text h-5 w-5" strokeWidth={2} />
          </Button>
          <Button
            isIconOnly
            className="rounded-full absolute right-3 z-50 top-3 bg-transparent hover:bg-text/10"
          >
            <Icons.hideIcon className="fill-text h-5 w-5" strokeWidth={2} />
          </Button>

          <div className="flex flex-col justify-center items-center h-full border">
            <Image
              onClick={(e) => e.stopPropagation()}
              src={imageArr.at(Number(photoIndex) - 1)!}
              alt=""
              classNames={{
                img: "max-w-6xl",
              }}
            />
            <div className="z-50" onClick={(e) => e.stopPropagation()}>
              <PostActionButton
                post={post}
                reposts={post.reposts}
                currentUserId={currentUserId}
                customClass="fill-text"
              />
            </div>
          </div>

          <div className="absolute top-0 left-0 bottom-0 flex items-center justify-between w-full">
            <Button
              isIconOnly
              className="rounded-full bg-transparent hover:bg-text/10"
            >
              <Icons.arrowLeft className="h-5 w-5 fill-text" />
            </Button>
            <Button
              isIconOnly
              className="rounded-full bg-transparent hover:bg-text/10"
            >
              <Icons.arrowRight className="h-5 w-5 fill-text" />
            </Button>
          </div>
        </div>

        <div
          className="flex-none w-80 bg-black h-[1400px] p-4 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4">
            <h2 className="text-xl font-semibold">User 1</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">User 2</h2>
            <p>
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
