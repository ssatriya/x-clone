"use client";

import * as React from "react";

import { Icons } from "@/components/icons";
import { usePrevPath } from "@/hooks/usePrevPath";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import { ExtendedPost, ExtendedPostWithoutUserTwo } from "@/types/db";
import { usePhotoNumber } from "@/hooks/usePhotoNumber";
import { cn } from "@/lib/utils";

type LightboxModalProps = {
  onClose: () => void;
  isOpen: boolean;
  url?: string;
  imageUrlArray: string[];
  username: string;
  post: ExtendedPost | ExtendedPostWithoutUserTwo;
};

export default function LightboxModal({
  onClose,
  isOpen,
  url,
  imageUrlArray,
  username,
  post,
}: LightboxModalProps) {
  const [photoSrc, setPhotoSrc] = React.useState("");
  const prevPath = usePrevPath((state) => state.path);
  const [currentPhoto, setCurrentPhoto] = React.useState("");

  const photoNumber = usePhotoNumber((state) => state.photoNumber);
  const setPhotoNumber = usePhotoNumber((state) => state.setPhotoNumber);

  React.useEffect(() => {
    if (!isOpen) {
      window.history.pushState("page2", "Title", prevPath);
    }
  }, [prevPath, isOpen]);

  React.useEffect(() => {
    const currentUrl = window.location.href;
    console.log(currentUrl);
  }, []);

  const arrImgLength = imageUrlArray.length + 1;

  let addClassname = "";

  const handleNext = () => {
    const url = `/${username}/status/${post.id}/photo/${+photoNumber + 1}`;
    if (isOpen) {
      window.history.pushState("page2", "Title", url);
    }
    var images = document.querySelectorAll(".image");

    const percentage = photoNumber === 1 ? 0 : -100;

    addClassname = "translateX(" + percentage + "%)";
  };

  const handlePrev = () => {
    const url = `/${username}/status/${post.id}/photo/${+photoNumber}`;
    if (isOpen) {
      window.history.pushState("page2", "Title", url);
    }
    var images = document.querySelectorAll(".image");
    const percentage = photoNumber === 1 ? 0 : -100;
    addClassname = "translateX(" + percentage + "%) ";
  };

  return (
    isOpen && (
      <>
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black lg:opacity-90"></div>

          <div className="flex relative w-full h-full">
            <div className="relative flex-1">
              <Button
                onClick={onClose}
                isIconOnly
                className="rounded-full absolute left-3 top-3 z-50 bg-transparent lg:hover:bg-text/10"
              >
                <Icons.close className="fill-text h-5 w-5" strokeWidth={2} />
              </Button>
              <Button
                isIconOnly
                className="rounded-full right-3 z-50 top-3 bg-transparent hover:bg-text/10 hidden lg:absolute"
              >
                <Icons.hideIcon className="fill-text h-5 w-5" strokeWidth={2} />
              </Button>
              <div className="flex flex-col justify-center items-center h-full relative">
                <div className="flex">
                  {/* <Image
                    onClick={(e) => e.stopPropagation()}
                    src={photoSrc}
                    alt=""
                    fill
                    className="object-contain z-50"
                  /> */}
                  {imageUrlArray.map((image, i) => {
                    const currentIndex = i + 1;

                    let imagePosition = "";
                    if (photoNumber && photoNumber > currentIndex) {
                      imagePosition = "translate-x-[-500%]";
                    } else if (photoNumber && photoNumber < currentIndex) {
                      imagePosition = "translate-x-[500%]";
                    }

                    return (
                      <div key={image} className="flex flex-row gap-20 w-full">
                        <Image
                          onClick={(e) => e.stopPropagation()}
                          src={image}
                          alt=""
                          // fill
                          width={400}
                          height={400}
                          className={cn(
                            "object-contain",
                            // imagePosition,
                            addClassname
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  className="z-50 absolute bottom-1"
                  onClick={(e) => e.stopPropagation()}
                ></div>
              </div>

              <div className="absolute top-0 left-0 bottom-0 flex items-center justify-between w-full">
                <Button
                  // disabled={canGoNext}
                  onClick={handlePrev}
                  isIconOnly
                  className="rounded-full bg-transparent hover:bg-text/10"
                >
                  <Icons.arrowLeft className="h-5 w-5 fill-text" />
                </Button>
                <Button
                  // disabled={canGoPrev}
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
            ></div>
          </div>
        </div>
      </>
    )
  );
}
