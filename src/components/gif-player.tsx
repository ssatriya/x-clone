"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Icons from "./icons";
import Button from "./ui/button";

type Props = {
  src: string;
  photoModalURL?: string | undefined;
  mediaPlayed: { isPlaying: boolean; hasInteracted: boolean };
  mediaId: string;
  onPlayStateChange: (mediaId: string, isPlaying: boolean) => void;
  inView: boolean;
};

const GIFPlayer = ({
  src,
  photoModalURL,
  mediaPlayed,
  mediaId,
  inView,
  onPlayStateChange,
}: Props) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(mediaPlayed?.isPlaying);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView && mediaPlayed.isPlaying) {
      video
        .play()
        .catch((error) => console.error("Error playing video:", error));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [inView, mediaPlayed?.isPlaying]);

  const playHandler = () => {
    onPlayStateChange(mediaId, !mediaPlayed.isPlaying);
  };

  if (!mediaPlayed) return;

  return (
    <div className="relative w-full h-full group">
      <video
        className="object-contain h-full w-full focus-visible:outline-none"
        ref={videoRef}
        loop
        playsInline
        muted
        onClick={(e) => {
          e.stopPropagation();
          if (!photoModalURL) {
            playHandler();
          } else {
            router.push(photoModalURL, { scroll: false });
          }
        }}
      >
        <source src={src} />
      </video>
      <div className="flex w-fit cursor-default gap-0.5 justify-start items-center absolute bottom-3 left-3">
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 rounded-l-[4px] rounded-r-none bg-black/80"
          onClick={(e) => {
            playHandler();
            e.stopPropagation();
          }}
        >
          {!isPlaying && <Icons.play className="h-3 w-3 fill-white" />}
          {isPlaying && <Icons.pause className="h-3 w-3 fill-white" />}
        </Button>
        <div
          className="bg-black/20 h-5 flex items-center justify-center px-2.5 rounded-r-[4px]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className="text-xs leading-3 font-bold">GIF</span>
        </div>
      </div>
    </div>
  );
};

export default GIFPlayer;
