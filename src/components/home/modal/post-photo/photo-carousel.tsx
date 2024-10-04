"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Media } from "@/types";
import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import Button from "@/components/ui/button";
import ModalGIFPlayer from "./modal-gif-player";
import { usePrevNextButtons } from "@/hooks/usePrevNextButtons";
import Progressbar from "@/components/progressbar";

type Props = {
  photos: Media[];
  isMobile: boolean;
  onClose: () => void;
  photoNumber: number;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

const PhotoCarousel = ({
  photos,
  onClose,
  isMobile,
  photoNumber,
  isSidebarOpen,
  setIsSidebarOpen,
}: Props) => {
  const pathname = usePathname();
  const [onLoad, setOnload] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(photoNumber - 1);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: false,
    containScroll: "keepSnaps",
    slidesToScroll: "auto",
    startIndex: photoNumber - 1,
  });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const baseURL = pathname.slice(0, pathname.length - 1);

  const scrollPrev = () => {
    onPrevButtonClick();
    setCurrentIndex((prev) => prev - 1);
  };

  const scrollNext = () => {
    onNextButtonClick();
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    const newURL = `${baseURL}${currentIndex + 1}`;
    window.history.replaceState(
      { ...window.history.state, as: newURL, url: newURL },
      "",
      newURL
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

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
        {!prevBtnDisabled && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              scrollPrev();
            }}
            className="h-[34px] w-[34px] hover:bg-black/40 bg-black/60"
          >
            <Icons.arrowLeft className="h-5 w-5 fill-secondary" />
          </Button>
        )}
      </div>
      <div className="absolute top-1/2 right-0 p-3 z-10">
        {!nextBtnDisabled && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              scrollNext();
            }}
            className="h-[34px] w-[34px] hover:bg-black/40 bg-black/60"
          >
            <Icons.arrowRight className="h-5 w-5 fill-secondary" />
          </Button>
        )}
      </div>
      <div
        className="overflow-hidden select-none touch-none w-full h-full"
        ref={emblaRef}
      >
        <div className="flex h-full">
          {photos.map((photo) => {
            return (
              <div
                key={photo.id}
                className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                {/* <Progressbar
                  classNames={cn(
                    onLoad ? "opacity-0" : "opacity-100",
                    "absolute top-0 w-full z-40"
                  )}
                /> */}
                {/* eslint-disable @next/next/no-img-element  */}
                <img
                  src={photo.url}
                  alt="media"
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                  onLoad={() => {
                    setOnload(true);
                  }}
                  onLoadStart={() => {
                    setOnload(false);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PhotoCarousel;
