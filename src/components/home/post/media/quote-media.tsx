"use client";

import {
  MAX_GROUP_MEDIA_HEIGHT,
  MAX_HEIGHT_MEDIA,
  MAX_WIDTH_MEDIA,
  MAX_WIDTH_SINGLE_POST,
} from "@/constants";
import { cn } from "@/lib/utils";
import { MediaType } from "@/types";

type Props = {
  mediaURLs: MediaType[];
  fullWidthImage?: boolean;
};

const QuoteMedia = ({ mediaURLs, fullWidthImage }: Props) => {
  const containerGridClass = cn("grid gap-0.5 mx-auto", {
    "grid-rows-1": mediaURLs.length <= 2,
    "grid-rows-2": mediaURLs.length > 2,
    "grid-cols-1": mediaURLs.length === 1,
    "grid-cols-2": mediaURLs.length > 1,
  });

  if (mediaURLs.length === 1) {
    const { height, width } = mediaURLs[0].dimension;

    const ASPECT_RATIO = width / height;
    const newWidth = ASPECT_RATIO * MAX_HEIGHT_MEDIA;

    const fileType = mediaURLs[0].type.split("/")[0] as "image" | "video";

    const isLandscape = ASPECT_RATIO > 1;
    const isSquare = ASPECT_RATIO === 1;

    let containerStyles = {
      maxWidth: MAX_WIDTH_MEDIA,
      aspectRatio: 1 / 1,
    };

    if (isSquare) {
      containerStyles = {
        maxWidth: MAX_WIDTH_MEDIA,
        aspectRatio: 1 / 1,
      };
    } else if (isLandscape || fileType === "image") {
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
      <div style={containerStyles} className={containerGridClass}>
        {mediaURLs.map((media, index) => {
          const fill = mediaURLs.length === 3 && index === 0;

          const fillInnerClass = cn("overflow-hidden", {
            "row-span-2": fill,
          });

          if (fileType === "image") {
            return (
              <div
                key={index}
                className={fillInnerClass}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  src={`https://wsrv.nl/?url=${media.url}&w=${600}&output=jpeg`}
                  alt="img"
                  className="object-cover h-full w-full"
                />
              </div>
            );
          }

          if (fileType === "video") {
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

  if (mediaURLs.length > 1) {
    const MAX_ASPECT_RATIO = MAX_HEIGHT_MEDIA / MAX_GROUP_MEDIA_HEIGHT;

    return (
      <div
        style={{
          maxWidth: "100%",
          aspectRatio: MAX_ASPECT_RATIO,
        }}
        className={containerGridClass}
      >
        {mediaURLs.map((media, index) => {
          const fileType = media.type.split("/")[0] as "image" | "video";
          const fill = mediaURLs.length === 3 && index === 0;

          const fillInnerClass = cn("overflow-hidden", {
            "row-span-2": fill,
          });

          if (fileType === "image") {
            return (
              <div
                key={index}
                className={fillInnerClass}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                <img
                  src={`https://wsrv.nl/?url=${media.url}&w=${400}&output=jpeg`}
                  alt="img"
                  className="object-cover h-full w-full"
                />
              </div>
            );
          }

          if (fileType === "video") {
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

export default QuoteMedia;
