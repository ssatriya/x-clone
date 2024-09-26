"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import Button from "./ui/button";
import Icons from "./icons";

type Props = {
  src: string;
};

const GIFPlayer = ({ src }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playHandler = () => {
    const video = videoRef.current;

    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="relative w-full h-full group">
      <video
        className="object-contain h-full w-full focus-visible:outline-none"
        ref={videoRef}
        loop
        playsInline
        autoPlay
        muted
        onClick={(e) => {
          e.stopPropagation();
          playHandler();
        }}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) {
            video.play();
            setIsPlaying(true);
          }
        }}
      >
        <source src={src} />
      </video>
      <div className="flex w-full cursor-default gap-0.5 justify-start items-center absolute bottom-3 left-3">
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 rounded-l-[4px] rounded-r-none bg-black/80"
        >
          {!isPlaying && <Icons.play className="h-3 w-3 fill-white" />}
          {isPlaying && <Icons.pause className="h-3 w-3 fill-white" />}
        </Button>
        <div className="bg-black/20 h-5 flex items-center justify-center px-2.5 rounded-r-[4px]">
          <span className="text-xs leading-3 font-bold">GIF</span>
        </div>
      </div>
    </div>
  );
};

export default GIFPlayer;
