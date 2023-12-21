"use client";

import { Icons } from "@/components/icons";
import {
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";

import { Button, Divider } from "@nextui-org/react";
import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import PostActionButton from "../../layout/center/post/action-button/post-action-button";
import LightboxPost from "../../layout/center/post/lightbox/post/lightbox-post-content";
import Reply from "../../layout/center/reply/reply";
import { usePrevPath } from "@/hooks/usePrevPath";
import Link from "next/link";

type PhotoModalProps = {
  params: {
    photoIndex: string;
    postId: string;
    username: string;
  };
  post: ExtendedPostWithoutUserTwo;
  currentUser: UserWithFollowersFollowing;
};

export default function PhotoModal({
  params,
  post,
  currentUser,
}: PhotoModalProps) {
  const router = useRouter();
  const path = usePathname();

  const prevPath = usePrevPath((state) => state.path);

  const handleClose = () => {
    if (prevPath) {
      // router.replace(prevPath, { scroll: false });
      // window.location.href = prevPath;
      router.push(prevPath);
    } else {
      router.back();
    }
  };

  const imageArr = post.image_url!.split(",");
  const photoIndex = params.photoIndex;

  const canGoNext = +photoIndex <= imageArr.length - 1;
  const canGoPrev = +photoIndex >= imageArr.length;

  const handleNext = () => {
    if (canGoNext) {
      router.push(
        `/${params.username}/status/${params.postId}/photo/${+photoIndex + 1}`
      );
      router.refresh();
    }
  };
  const handlePrev = () => {
    if (canGoPrev) {
      router.push(
        `/${params.username}/status/${params.postId}/photo/${+photoIndex - 1}`
      );
      router.refresh();
    }
  };

  React.useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      // onClick={handleClose}
    >
      <div className="fixed inset-0 bg-black lg:opacity-90" />

      <div className="flex relative w-full h-full">
        <div className="relative flex-1">
          <Link href={prevPath!}>
            <Button
              isIconOnly
              className="rounded-full absolute left-3 top-3 z-50 bg-transparent lg:hover:bg-text/10"
            >
              <Icons.close className="fill-text h-5 w-5" strokeWidth={2} />
            </Button>
          </Link>
          <Button
            isIconOnly
            className="rounded-full right-3 z-50 top-3 bg-transparent hover:bg-text/10 hidden lg:absolute"
          >
            <Icons.hideIcon className="fill-text h-5 w-5" strokeWidth={2} />
          </Button>
          <div className="flex flex-col justify-center items-center h-full relative">
            <div className="w-full h-[94%] absolute right-[50%] left-[50%] translate-x-[-50%] top-0">
              <Image
                onClick={(e) => e.stopPropagation()}
                src={imageArr.at(Number(photoIndex) - 1)!}
                alt=""
                fill
                className="object-contain z-50"
              />
            </div>
            <div
              className="z-50 absolute bottom-1"
              onClick={(e) => e.stopPropagation()}
            >
              <PostActionButton
                post={post}
                reposts={post.reposts}
                currentUser={currentUser}
                customClass="fill-text"
              />
            </div>
          </div>

          <div className="absolute top-0 left-0 bottom-0 flex items-center justify-between w-full">
            <Button
              disabled={canGoNext}
              onClick={handlePrev}
              isIconOnly
              className="rounded-full bg-transparent hover:bg-text/10"
            >
              <Icons.arrowLeft className="h-5 w-5 fill-text" />
            </Button>
            <Button
              disabled={canGoPrev}
              onClick={handleNext}
              isIconOnly
              className="rounded-full bg-transparent hover:bg-text/10"
            >
              <Icons.arrowRight className="h-5 w-5 fill-text" />
            </Button>
          </div>
        </div>

        <div
          className="flex-none w-[350px] bg-black border-l z-50 h-full pt-3 overflow-y-auto hidden lg:block"
          onClick={(e) => e.stopPropagation()}
        >
          <LightboxPost
            currentUser={currentUser}
            post={post}
            userPosted={post.user_one.avatar}
          />
          <Divider
            orientation="horizontal"
            className="mt-3 bg-border h-[1px]"
          />
          <Reply post={post} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
