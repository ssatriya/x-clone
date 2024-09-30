"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

import { Media } from "@/types";
import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import Button from "@/components/ui/button";
import ModalGIFPlayer from "./modal-gif-player";

type Props = {
  photos: Media[];
  onClose: () => void;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  isMobile: boolean;
  photoNumber: number;
};

const PhotoCarousel = ({
  photos,
  onClose,
  setIsSidebarOpen,
  isSidebarOpen,
  isMobile,
  photoNumber,
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(photoNumber - 1);

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div
      className="w-auto h-[calc(100vh-48px)] relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-0 left-0 p-3 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="h-[34px] w-[34px] hover:bg-black/40 bg-black/60"
        >
          <Icons.close className="h-5 w-5 fill-secondary" />
        </Button>
      </div>

      <div className="absolute top-0 right-0 p-3 z-10">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-[34px] w-[34px] hover:bg-black/40 bg-black/60"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Icons.more
              className={cn(
                "h-5 w-5 fill-secondary",
                !isSidebarOpen && "rotate-180"
              )}
            />
          </Button>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-[34px] w-[34px] hover:bg-black/40 bg-black/60"
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen((prev) => !prev);
            }}
          >
            <Icons.hideIcon
              className={cn(
                "h-5 w-5 fill-secondary",
                !isSidebarOpen && "rotate-180"
              )}
            />
          </Button>
        )}
      </div>

      <div className="absolute top-1/2 left-0 p-3 z-10">
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="h-[34px] w-[34px] hover:bg-black/40 bg-black/60"
          >
            <Icons.arrowLeft className="h-5 w-5 fill-secondary" />
          </Button>
        )}
      </div>

      <div className="absolute top-1/2 right-0 p-3 z-10">
        {currentIndex < photos.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="h-[34px] w-[34px] hover:bg-black/40 bg-black/60"
          >
            <Icons.arrowRight className="h-5 w-5 fill-secondary" />
          </Button>
        )}
      </div>

      <div className="h-full w-full flex items-center justify-center">
        {photos[currentIndex].format === "gif" && (
          <div key={currentIndex} className="w-fit h-fit flex-shrink-0">
            <ModalGIFPlayer src={photos[currentIndex].url} />
          </div>
        )}
        {photos[currentIndex].format !== "gif" && (
          <div key={currentIndex} className="w-full h-full flex-shrink-0">
            <div className="h-full w-full flex items-center justify-center">
              <Image
                src={photos[currentIndex].url}
                width={photos[currentIndex].width}
                height={photos[currentIndex].height}
                priority
                alt="media preview"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCarousel;
