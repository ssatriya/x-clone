"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { CSSProperties, useEffect, useState } from "react";

import Icons from "@/components/icons";
import { FileWithPreview } from "@/types";
import Button from "@/components/ui/button";
import { usePrevNextButtons } from "@/hooks/usePrevNextButtons";

type Props = {
  isPosting: boolean;
  files: FileWithPreview[];
  handleRemove: (mediaId: string) => void;
  uploadingFiles: {
    [id: string]: boolean;
  };
};

const MediaPreviewSlider = ({
  isPosting,
  files,
  handleRemove,
  uploadingFiles,
}: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: false,
    containScroll: "keepSnaps",
    slidesToScroll: "auto",
  });

  const [slideSize, setSlideSize] = useState("w-full");
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  useEffect(() => {
    setSlideSize(files.length > 1 ? "w-1/2" : "w-full");

    if (!emblaApi) return;
    if (files.length > 2) {
      emblaApi.scrollTo(files.length - 1, false);
    }
  }, [files.length, emblaApi]);

  if (files.length === 0) return;
  const MAX_HEIGHT_SINGLE_LANDSCAPE = 342;
  const MAX_HEIGHT_SINGLE_PORTRAIT = 685;
  const MAX_HEIGHT_MULTIPLE = 290;

  const ASPECT_RATIO =
    files[0].meta.dimension.width / files[0].meta.dimension.height;
  console.log({ ASPECT_RATIO });

  const isLandscape = ASPECT_RATIO > 1;
  const isPortrait = ASPECT_RATIO < 1;

  const isVideo = files[0].meta.format === "mp4";

  const containerStyle: CSSProperties = {
    maxWidth: 514,
    maxHeight:
      files.length > 1
        ? MAX_HEIGHT_MULTIPLE
        : isLandscape
        ? MAX_HEIGHT_SINGLE_LANDSCAPE
        : isPortrait
        ? MAX_HEIGHT_SINGLE_PORTRAIT
        : 514,
  };

  if (!isVideo || files.length > 1) {
    containerStyle.aspectRatio =
      files.length > 1
        ? 514 / MAX_HEIGHT_MULTIPLE
        : isLandscape
        ? 514 / MAX_HEIGHT_SINGLE_LANDSCAPE
        : isPortrait
        ? 514 / MAX_HEIGHT_SINGLE_PORTRAIT
        : 1 / 1;
  }

  return (
    <section className="max-w-[514px] mx-auto relative">
      {!prevBtnDisabled && files.length > 2 && (
        <div className="absolute bottom-1/2 translate-y-1/2 left-0 p-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevButtonClick}
            className="h-[34px] w-[34px] hover:bg-black/70 bg-black/80"
          >
            <Icons.arrowLeft className="h-5 w-5 fill-secondary" />
          </Button>
        </div>
      )}
      {!nextBtnDisabled && files.length > 2 && (
        <div className="absolute bottom-1/2 translate-y-1/2 right-0 p-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextButtonClick}
            className="h-[34px] w-[34px] hover:bg-black/70 bg-black/80"
          >
            <Icons.arrowRight className="h-5 w-5 fill-secondary" />
          </Button>
        </div>
      )}
      <div
        className="overflow-hidden select-none touch-none pointer-events-none"
        ref={emblaRef}
      >
        <div
          className="flex -ml-2"
          style={containerStyle}
          // style={{
          //   maxWidth: 514,
          //   maxHeight:
          //     files.length > 1
          //       ? MAX_HEIGHT_MULTIPLE
          //       : isLandscape
          //       ? MAX_HEIGHT_SINGLE_LANDSCAPE
          //       : isPortrait
          //       ? MAX_HEIGHT_SINGLE_PORTRAIT
          //       : 514,
          //   aspectRatio:
          //   files.length > 1
          //     ? 514 / MAX_HEIGHT_MULTIPLE
          //     : isLandscape
          //     ? 514 / MAX_HEIGHT_SINGLE_LANDSCAPE
          //     : isPortrait
          //     ? 514 / MAX_HEIGHT_SINGLE_PORTRAIT
          //     : 1 / 1,
          // }}
        >
          {files.map((media, index) => (
            <div
              className={`flex-[0_0_auto] min-w-0 pl-2 relative transform translate-x-0 translate-y-0 ${slideSize}`}
              key={index}
            >
              <div className="absolute right-1 top-1 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(media.meta.id)}
                  className="h-8 w-8 bg-black/80 hover:bg-black/70 pointer-events-auto"
                >
                  <Icons.close className="h-[18px] w-[18px] fill-secondary" />
                </Button>
              </div>
              {media.meta.format === "gif" ||
                (media.meta.format === "jpeg" && (
                  <Image
                    src={media.meta.preview}
                    alt="preview media"
                    width={0}
                    height={0}
                    priority
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ))}
              {media.meta.format === "mp4" && (
                <div className="h-full w-full">
                  <video
                    height={290}
                    controls
                    loop
                    playsInline
                    className="rounded-2xl h-full w-full object-contain"
                  >
                    <source src={media.meta.preview} />
                  </video>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MediaPreviewSlider;
