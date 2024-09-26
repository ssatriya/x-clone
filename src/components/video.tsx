"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "./ui/button";
import Icons from "./icons";
import { cn, formatDuration } from "@/lib/utils";
import SeekSlider, { SliderRefProps } from "./ui/seek-slider";
import { useVideoSlider } from "@/hooks/useVideoSlider";
import VolumeControl from "./ui/volume-control";

type Props = {
  src: string;
};

const Video = ({ src }: Props) => {
  const sliderRef = useRef<SliderRefProps>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [volume, setVolume] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    currentTime,
    isSeeking,
    isPlaying,
    totalDuration,
    updateCurrentTime,
    updateSeeking,
    updateTotalDuration,
    updateIsPlaying,
  } = useVideoSlider();

  const volumeHandler = (value: number) => {
    const video = videoRef.current;

    if (video) {
      setVolume(value);
      video.volume = value / 100;
    }
  };

  const fullscreenHandler = () => {
    const video = videoRef.current;

    if (video) {
      if (isFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(true);
      } else {
        video.requestFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const playHandler = () => {
    const video = videoRef.current;

    if (video) {
      updateTotalDuration(video.duration);

      if (video.paused) {
        video.play();
        updateIsPlaying(true);
      } else {
        video.pause();
        updateIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && !isSeeking) {
      updateCurrentTime(video.currentTime);
    }
  };

  const handleSeek = (currentPercentage: number) => {
    const video = videoRef.current;
    if (video) {
      const newTime = (currentPercentage * totalDuration) / 100;
      video.currentTime = newTime;

      updateCurrentTime(newTime);
      updateSeeking(false);
    }
  };

  const onPositionChangeByDrag = (completedPercentage: number) => {
    const video = videoRef.current;
    if (video) {
      const newTime = (completedPercentage * totalDuration) / 100;
      video.currentTime = newTime;

      updateCurrentTime(newTime);
      updateSeeking(true);
    }
  };

  const handleMouseUp = () => {
    updateSeeking(false);
  };

  const handleVideoEnd = () => {
    updateCurrentTime(0);
    updateSeeking(false);
    updateIsPlaying(false);
  };

  useEffect(() => {
    if (sliderRef.current && !isSeeking) {
      const newPosPercentage = (currentTime / totalDuration) * 100;
      sliderRef.current.updateSliderFill(newPosPercentage);
    }
  }, [currentTime, isSeeking]);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.volume = volume;
    }
  }, []);

  return (
    <div className="relative w-full h-full group">
      <video
        className="object-contain h-full w-full focus-visible:outline-none"
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        onClick={playHandler}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) {
            updateTotalDuration(video.duration);
            setVolume(video.volume * 100);
          }
        }}
      >
        <source src={src} />
      </video>
      <div
        className={cn(
          "flex flex-col w-full cursor-default justify-between items-center absolute bottom-0 pb-1 px-1 transition-opacity duration-200 bg-black/10",
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100",
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        <SeekSlider
          $total={600}
          $fillColor="#ffffff"
          onClick={handleSeek}
          onDrag={onPositionChangeByDrag}
          onMouseUp={handleMouseUp}
          ref={sliderRef}
        />
        <div className="flex w-full justify-between items-center mt-1">
          <Button
            variant="ghost"
            className="p-0 w-[34px] h-[34px] hover:bg-white/10"
            onClick={playHandler}
          >
            {isPlaying ? (
              <Icons.pause className="w-5 h-5 fill-secondary-lighter" />
            ) : (
              <Icons.play className="w-5 h-5 fill-secondary-lighter" />
            )}
          </Button>
          <div className="flex items-center">
            <div className="text-sm text-white mr-2">
              <span className="tabular-nums text-[15px] leading-5">
                {formatDuration(currentTime)} / {formatDuration(totalDuration)}
              </span>
            </div>
            <VolumeControl onVolumeChange={volumeHandler} volume={volume} />
            <Button
              variant="ghost"
              className="p-1 w-[34px] h-[34px] hover:bg-white/10"
            >
              <Icons.gear className="w-5 h-5 fill-secondary-lighter" />
            </Button>
            <Button
              variant="ghost"
              className="p-1 w-[34px] h-[34px] hover:bg-white/10"
            >
              <Icons.pip className="w-5 h-5 fill-secondary-lighter" />
            </Button>
            <Button
              variant="ghost"
              className="p-1 w-[34px] h-[34px] hover:bg-white/10"
              onClick={fullscreenHandler}
            >
              <Icons.fullscreen className="w-5 h-5 fill-secondary-lighter" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
