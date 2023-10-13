"use client";

import { Icons } from "@/components/icons";
import {
  ExtendedPost,
  ExtendedPostWithoutOriginalPostUserTwo,
  ExtendedPostWithoutUserTwo,
  UserWithFollowersFollowing,
} from "@/types/db";

import { Button, Divider } from "@nextui-org/react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import * as React from "react";
import PostActionButton from "../../layout/center/post/action-button/post-action-button";
import Post from "../../layout/center/post/post";
import LightboxPost from "../../layout/center/post/lightbox/lightbox-post";
import Reply from "../../layout/center/reply/reply";

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
  const [imageUrl, setImageUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    router.push("/home");
  };

  const imageArr = post.image_url!.split(",");
  const photoIndex = params.photoIndex;

  const handleNext = () => {
    router.push(
      `/${params.username}/status/${params.postId}/photo/${+photoIndex + 1}`
    );
  };
  const handlePrev = () => {
    router.push(
      `/${params.username}/status/${params.postId}/photo/${+photoIndex - 1}`
    );
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
      onClick={handleClose}
    >
      <div className="fixed inset-0 bg-black opacity-90"></div>

      <div className="flex relative w-full h-full">
        <div className="relative flex-1 border-l">
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

          <div className="flex flex-col justify-center items-center h-full">
            <div className="w-full h-full relative">
              <Image
                onClick={(e) => e.stopPropagation()}
                src={imageArr.at(Number(photoIndex) - 1)!}
                alt=""
                fill
                objectFit="contain"
              />
            </div>
            <div className="z-50" onClick={(e) => e.stopPropagation()}>
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
              onClick={handlePrev}
              isIconOnly
              className="rounded-full bg-transparent hover:bg-text/10"
            >
              <Icons.arrowLeft className="h-5 w-5 fill-text" />
            </Button>
            <Button
              onClick={handleNext}
              isIconOnly
              className="rounded-full bg-transparent hover:bg-text/10"
            >
              <Icons.arrowRight className="h-5 w-5 fill-text" />
            </Button>
          </div>
        </div>

        <div
          className="flex-none w-[350px] bg-black border-l z-50 h-full pt-3 overflow-y-auto"
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
