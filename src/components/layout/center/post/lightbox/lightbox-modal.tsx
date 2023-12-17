"use client";

import * as React from "react";

import { Icons } from "@/components/icons";
import { usePrevPath } from "@/hooks/usePrevPath";
import { Button, Divider } from "@nextui-org/react";
import Image from "next/image";
import {
  ExtendedPost,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";
import { usePhotoNumber } from "@/hooks/usePhotoNumber";
import { cn } from "@/lib/utils";
import ImageSlider from "./image-slider";
import LightboxPost from "./lightbox-post";
import Reply from "../../reply/reply";
import PostActionButton from "../action-button/post-action-button";

type LightboxModalProps = {
  onClose: () => void;
  isOpen: boolean;

  imageUrlArray: string[];
  username: string;
  post: ExtendedPostWithoutUserTwo;
  currentUser: UserWithFollowersFollowing;
};

export default function LightboxModal({
  onClose,
  isOpen,
  imageUrlArray,
  username,
  post,
  currentUser,
}: LightboxModalProps) {
  const prevPath = usePrevPath((state) => state.path);

  const [isLightboxPostOpen, setIsLightboxPostOpen] = React.useState(true);

  React.useEffect(() => {
    if (!isOpen) {
      window.history.pushState("page2", "Title", prevPath);
    }
  }, [prevPath, isOpen]);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleHide = () => {
    setIsLightboxPostOpen((prev) => !prev);
  };

  return (
    isOpen && (
      <>
        <div
          role="dialog"
          className="fixed inset-0 flex items-center justify-center z-40"
        >
          <div className="fixed inset-0 bg-black lg:opacity-90"></div>

          <div className="flex relative w-full h-full z-50">
            <div className="relative flex-1">
              <Button
                onClick={onClose}
                isIconOnly
                disableAnimation
                className="rounded-full absolute left-3 top-3 z-[60] bg-transparent lg:hover:bg-text/10"
              >
                <Icons.close className="fill-text h-5 w-5" strokeWidth={2} />
              </Button>
              <Button
                onClick={handleHide}
                isIconOnly
                disableAnimation
                className="rounded-full right-3 z-[60] top-3 bg-transparent hover:bg-text/10 lg:absolute"
              >
                <Icons.hideIcon
                  className={cn(
                    "fill-text h-5 w-5",
                    !isLightboxPostOpen && "rotate-180"
                  )}
                  strokeWidth={2}
                />
              </Button>
              <div className="flex flex-col justify-center items-center h-full relative">
                <div className="flex h-full w-full">
                  <ImageSlider
                    slides={imageUrlArray}
                    username={username}
                    post={post}
                  />
                </div>
                <div className="w-fit">
                  <PostActionButton
                    post={post}
                    reposts={post.reposts}
                    currentUser={currentUser}
                    customClass="fill-text"
                  />
                </div>
                <div
                  className="z-40 absolute bottom-1"
                  onClick={(e) => e.stopPropagation()}
                ></div>
              </div>
            </div>

            {isLightboxPostOpen && (
              <div
                className="flex-none w-[350px] bg-black border-l z-40 h-full pt-3 overflow-y-auto hidden lg:block"
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
            )}
          </div>
        </div>
      </>
    )
  );
}
