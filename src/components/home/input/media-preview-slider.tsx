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
    startIndex: 0,
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
  }, [files]);

  useEffect(() => {
    if (!emblaApi) return;

    if (files.length > 2) {
      emblaApi.scrollNext(true);
    }
  }, [files.length, emblaApi]);

  if (files.length === 0) return;
  const MAX_HEIGHT_SINGLE_LANDSCAPE = 342;
  const MAX_HEIGHT_SINGLE_PORTRAIT = 685;
  const MAX_HEIGHT_MULTIPLE = 290;

  const ASPECT_RATIO =
    files[0].meta.dimension.width / files[0].meta.dimension.height;

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

  const showPrevButton = !prevBtnDisabled && files.length > 2 && !isPosting;
  const showNextButton = !nextBtnDisabled && files.length > 2 && !isPosting;

  return (
    <section className="max-w-[514px] mx-auto relative">
      {showPrevButton && (
        <div className="absolute bottom-1/2 translate-y-1/2 left-0 p-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevButtonClick}
            className="h-[34px] w-[34px] bg-black/60 hover:bg-black/50"
          >
            <Icons.arrowLeft className="h-5 w-5 fill-secondary" />
          </Button>
        </div>
      )}
      {showNextButton && (
        <div className="absolute bottom-1/2 translate-y-1/2 right-0 p-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextButtonClick}
            className="h-[34px] w-[34px] bg-black/60 hover:bg-black/50"
          >
            <Icons.arrowRight className="h-5 w-5 fill-secondary" />
          </Button>
        </div>
      )}
      <div
        className="overflow-hidden select-none touch-none pointer-events-none"
        ref={emblaRef}
      >
        <div className="flex -ml-2" style={containerStyle}>
          {files.map((media, index) => {
            const imageFormat = ["gif", "jpg", "jpeg", "png"];
            const isImage = imageFormat.includes(media.meta.format);
            const isVideo = media.meta.format === "mp4";
            return (
              <div
                className={`flex-[0_0_auto] min-w-0 pl-2 relative transform translate-x-0 translate-y-0 ${slideSize}`}
                key={index}
              >
                {!isPosting && (
                  <div className="absolute right-1 top-1 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(media.meta.id)}
                      className="h-8 w-8 bg-black/60 hover:bg-black/50 pointer-events-auto"
                    >
                      <Icons.close className="h-[18px] w-[18px] fill-secondary" />
                    </Button>
                  </div>
                )}
                {!isPosting && (
                  <div className="absolute left-3 top-1 z-10">
                    <Button
                      variant="ghost"
                      onClick={() => handleRemove(media.meta.id)}
                      className="h-8 px-4 bg-black/60 hover:bg-black/50 pointer-events-auto font-bold"
                    >
                      Edit
                    </Button>
                  </div>
                )}
                {isImage && (
                  <Image
                    src={media.meta.preview}
                    alt="preview media"
                    width={0}
                    height={0}
                    priority
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )}
                {isVideo && (
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
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MediaPreviewSlider;
