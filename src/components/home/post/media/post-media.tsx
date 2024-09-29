"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  MAX_WIDTH_MEDIA,
  MAX_HEIGHT_MEDIA,
  MAX_WIDTH_SINGLE_POST,
  MAX_GROUP_MEDIA_HEIGHT,
} from "@/constants";
import { cn } from "@/lib/utils";
import Video from "@/components/video";
import { Media, MediaFormat } from "@/types";
import GIFPlayer from "@/components/gif-player";
import { useInView } from "react-intersection-observer";

type Props = {
  postId: string;
  usernameWithoutAt: string;
  mediaURLs: Media[];
  fullWidthImage?: boolean;
  postType?: "post" | "quote";
};

export interface MediaPlayState {
  [key: string]: {
    isPlaying: boolean;
    hasInteracted: boolean;
  };
}

const PostMedia = ({
  mediaURLs,
  usernameWithoutAt,
  postId,
  fullWidthImage = false,
  postType = "post",
}: Props) => {
  const { ref, inView } = useInView({
    threshold: 0.8,
  });
  const router = useRouter();
  const [mediaPlayed, setMediaPlayed] = useState<MediaPlayState>({});

  useEffect(() => {
    const newMediaPlayed: MediaPlayState = {};

    // Check if there's any GIF already playing and interacted with
    const anyGifPlayingAndInteracted = Object.values(mediaPlayed).some(
      (state) => state.isPlaying && state.hasInteracted
    );

    mediaURLs.forEach((media, index) => {
      const key = media.id;
      if (mediaPlayed[key]) {
        // If this GIF has a previous state
        if (mediaPlayed[key].hasInteracted) {
          // If it has been interacted with, maintain its last playing state
          newMediaPlayed[key] = {
            ...mediaPlayed[key],
            isPlaying: mediaPlayed[key].isPlaying, // This is the key change
          };
        } else {
          // If it hasn't been interacted with, handle based on whether it's the first GIF
          newMediaPlayed[key] = {
            ...mediaPlayed[key],
            isPlaying: inView && index === 0 && !anyGifPlayingAndInteracted,
          };
        }
      } else {
        // For new GIFs, initialize them
        newMediaPlayed[key] = {
          isPlaying: inView && index === 0 && !anyGifPlayingAndInteracted,
          hasInteracted: false,
        };
      }
    });
    setMediaPlayed(newMediaPlayed);
  }, [inView, mediaURLs]);

  const handlePlayStateChange = (mediaId: string, isPlaying: boolean) => {
    setMediaPlayed((prev) => {
      const newState = { ...prev };
      if (isPlaying) {
        // Pause all other media
        Object.keys(newState).forEach((key) => {
          if (key !== mediaId) {
            newState[key] = { ...newState[key], isPlaying: false };
          }
        });
      }
      newState[mediaId] = { isPlaying, hasInteracted: true };
      return newState;
    });
  };
  const containerGridClass = cn(
    postType === "post" &&
      "border rounded-2xl grid gap-0.5 mt-3 overflow-clip has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
    postType === "quote" && "grid gap-0.5 mx-auto",
    {
      "grid-rows-1": mediaURLs.length <= 2,
      "grid-rows-2": mediaURLs.length > 2,
      "grid-cols-1": mediaURLs.length === 1,
      "grid-cols-2": mediaURLs.length > 1,
    }
  );

  if (mediaURLs.length === 1) {
    const { height, width } = mediaURLs[0];

    const ASPECT_RATIO = width / height;
    const newWidth = ASPECT_RATIO * MAX_HEIGHT_MEDIA;

    const fileType = mediaURLs[0].format as MediaFormat;

    const isLandscape = ASPECT_RATIO > 1;
    const isSquare = ASPECT_RATIO === 1;

    let containerStyles = {
      maxWidth: MAX_WIDTH_MEDIA,
      aspectRatio: 1 / 1,
    };

    if (isSquare) {
      containerStyles = {
        maxWidth: fullWidthImage ? MAX_WIDTH_SINGLE_POST : MAX_WIDTH_MEDIA,
        aspectRatio: 1 / 1,
      };
    } else if (
      isLandscape ||
      fileType === "jpeg" ||
      fileType === "jpg" ||
      fileType === "png" ||
      fileType === "gif"
    ) {
      containerStyles = {
        maxWidth: fullWidthImage ? MAX_WIDTH_SINGLE_POST : newWidth,
        aspectRatio: ASPECT_RATIO,
      };
    } else {
      containerStyles = {
        maxWidth: fullWidthImage ? MAX_WIDTH_SINGLE_POST : MAX_WIDTH_MEDIA,
        aspectRatio: 1 / 1,
      };
    }

    return (
      <div style={containerStyles} className={containerGridClass} ref={ref}>
        {mediaURLs.map((media, index) => {
          const fill = mediaURLs.length === 3 && index === 0;

          const fillInnerClass = cn("overflow-hidden", {
            "row-span-2": fill,
          });

          const photoModalURL = `/${usernameWithoutAt}/status/${postId}/photo/${
            index + 1
          }`;
          /* eslint-disable @next/next/no-img-element */
          if (fileType === "jpeg" || fileType === "jpg" || fileType === "png") {
            return (
              <div
                key={index}
                className={fillInnerClass}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                <Link
                  href={photoModalURL}
                  onClick={(e) => e.stopPropagation()}
                  scroll={false}
                  tabIndex={0}
                >
                  <img
                    src={`https://wsrv.nl/?url=${
                      media.url
                    }&w=${600}&output=jpeg`}
                    alt="img"
                    className="object-cover h-full w-full focus:outline-none"
                  />
                </Link>
              </div>
            );
          }
          if (fileType === "gif") {
            return (
              <div
                key={index}
                className={fillInnerClass}
                style={{
                  height: "100%",
                  width: "100%",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <GIFPlayer
                  src={media.url}
                  mediaPlayed={mediaPlayed[media.id]}
                  mediaId={media.id}
                  onPlayStateChange={handlePlayStateChange}
                  inView={inView}
                />
              </div>
            );
          }

          if (fileType === "mp4") {
            return (
              <div
                key={index}
                className={fillInnerClass}
                onClick={(e) => e.stopPropagation()}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                <Video src={media.url} />
              </div>
            );
          }
        })}
      </div>
    );
  }

  if (mediaURLs.length > 1) {
    const MAX_ASPECT_RATIO = MAX_HEIGHT_MEDIA / MAX_GROUP_MEDIA_HEIGHT;

    return (
      <div
        style={{
          maxWidth: "100%",
          aspectRatio: MAX_ASPECT_RATIO,
        }}
        className={containerGridClass}
        ref={ref}
      >
        {mediaURLs.map((media, index) => {
          const fileType = media.format as MediaFormat;
          const fill = mediaURLs.length === 3 && index === 0;

          const fillInnerClass = cn("overflow-hidden", {
            "row-span-2": fill,
          });

          const photoModalURL = `/${usernameWithoutAt}/status/${postId}/photo/${
            index + 1
          }`;

          if (fileType === "gif") {
            return (
              <div
                key={index}
                className={fillInnerClass}
                style={{
                  height: "100%",
                  width: "100%",
                }}
                onClick={(e) => {
                  console.log("click");
                  router.push(photoModalURL, { scroll: false });
                }}
              >
                <GIFPlayer
                  src={media.url}
                  photoModalURL={photoModalURL}
                  mediaPlayed={mediaPlayed[media.id]}
                  mediaId={media.id}
                  onPlayStateChange={handlePlayStateChange}
                  inView={inView}
                />
              </div>
            );
          }

          if (fileType === "jpeg" || fileType === "jpg" || fileType === "png") {
            return (
              <div
                key={index}
                className={fillInnerClass}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                <Link
                  href={photoModalURL}
                  onClick={(e) => e.stopPropagation()}
                  scroll={false}
                  tabIndex={0}
                >
                  <img
                    src={`https://wsrv.nl/?url=${
                      media.url
                    }&w=${400}&output=jpeg`}
                    alt="img"
                    className="object-cover h-full w-full focus-visible:outline-none"
                  />
                </Link>
              </div>
            );
          }

          if (fileType === "mp4") {
            return (
              <div
                key={index}
                className={fillInnerClass}
                onClick={(e) => e.stopPropagation()}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                <video
                  controls
                  loop
                  playsInline
                  className="object-contain h-full w-full focus-visible:outline-none"
                >
                  <source src={media.url} />
                </video>
              </div>
            );
          }
        })}
      </div>
    );
  }
};

export default PostMedia;
