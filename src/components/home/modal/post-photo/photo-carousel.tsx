"use client";

import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MediaType } from "@/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type Props = {
  photos: MediaType[];
  onClose: () => void;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  isMobile: boolean;
};

const PhotoCarousel = ({
  photos,
  onClose,
  setIsSidebarOpen,
  isSidebarOpen,
  isMobile,
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const goToNext = () => {
    if (currentIndex < photos.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transition = "transform 0.3s ease-in-out";
      carouselRef.current.style.transform = `translateX(-${
        currentIndex * 100
      }%)`;
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="w-auto h-[calc(100vh-48px)] relative overflow-hidden">
      <div className="absolute top-0 left-0 p-3 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="h-[34px] w-[34px] hover:bg-white/10 bg-black/60"
        >
          <Icons.close className="h-5 w-5 fill-secondary" />
        </Button>
      </div>

      <div className="absolute top-0 right-0 p-3 z-10">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-[34px] w-[34px] hover:bg-white/10 bg-black/60"
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
            className="h-[34px] w-[34px] hover:bg-white/10 bg-black/60"
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
            className="h-[34px] w-[34px] hover:bg-white/10 bg-black/60"
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
            className="h-[34px] w-[34px] hover:bg-white/10 bg-black/60"
          >
            <Icons.arrowRight className="h-5 w-5 fill-secondary" />
          </Button>
        )}
      </div>

      <div
        className="flex h-full transition-transform duration-300 ease-in-out"
        ref={carouselRef}
      >
        {photos.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <div className="h-full w-full flex items-center justify-center">
              {/* eslint-disable @next/next/no-img-element */}
              <img
                src={`https://wsrv.nl/?url=${image.url}&h=${1200}&output=jpeg`}
                alt={`Photo ${index + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoCarousel;
