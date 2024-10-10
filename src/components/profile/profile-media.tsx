"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import kyInstance from "@/lib/ky";
import Icons from "@/components/icons";
import { formatDuration } from "@/lib/utils";
import { MediaFormat, ProfilePostMedia } from "@/types";
import LoadingSpinner from "@/components/loading-spinner";
import InfiniteScrollContainer from "@/components/infinite-scroll-container";

type Props = {
  username: string;
};

const ProfileMedia = ({ username }: Props) => {
  const [videoDuration, setVideoDuration] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  let videoIndex = 0;

  const queryKey = ["profile-media", username];

  const { data, isLoading, hasNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: queryKey,
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            "/api/profile/media",
            pageParam
              ? {
                  searchParams: {
                    cursor: encodeURIComponent(pageParam),
                    username: username,
                  },
                }
              : {
                  searchParams: {
                    username: username,
                  },
                }
          )
          .json<{ nextCursor: string; media: ProfilePostMedia[] }>(),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: 10,
      placeholderData: keepPreviousData,
    });

  const media = data?.pages.flatMap((page) => page.media) || [];

  const handleLoadedMetadata = (
    event: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const videoElement = event.currentTarget;
    setVideoDuration((prev) => [...prev, videoElement.duration]);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-start justify-center mt-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      <div
        className="grid gap-1 m-1 h-full"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        }}
      >
        {!isLoading &&
          media?.map((m) => {
            const fileType = m.media[0].format as MediaFormat;

            const photoType =
              fileType === "jpeg" || fileType === "jpg" || fileType === "png";
            const GIFType = fileType === "gif";

            const postModal = `/${username}/status/${m.id}/${
              photoType ? "photo" : fileType
            }/1`;
            const postDetail = `/${username}/status/${m.id}`;

            if (photoType) {
              if (m.media.length > 1) {
                return (
                  <Link
                    href={postModal}
                    key={m.id}
                    style={{
                      aspectRatio: 1 / 1,
                    }}
                    className="relative"
                  >
                    {/* eslint-disable @next/next/no-img-element */}
                    <img
                      src={`https://wsrv.nl/?url=${
                        m.media[0].url
                      }&w=${500}&output=jpeg`}
                      alt="img"
                      className="h-full w-full object-cover"
                    />
                    <Icons.multiFile className="h-5 w-5 fill-white absolute right-2 bottom-2" />
                  </Link>
                );
              } else {
                return (
                  <Link
                    href={postModal}
                    key={m.id}
                    style={{
                      aspectRatio: 1 / 1,
                    }}
                  >
                    <img
                      src={`https://wsrv.nl/?url=${
                        m.media[0].url
                      }&w=${500}&output=jpeg`}
                      alt="img"
                      className="h-full w-full object-cover"
                    />
                  </Link>
                );
              }
            } else if (GIFType) {
              if (m.media.length > 1) {
                return (
                  <Link
                    href={postDetail}
                    key={m.id}
                    style={{
                      aspectRatio: 1 / 1,
                    }}
                    className="relative"
                  >
                    <video
                      style={{ opacity: isLoading ? 0 : 100 }}
                      className="object-cover h-full w-full focus-visible:outline-none"
                      preload="metadata"
                      ref={videoRef}
                      onLoadedMetadata={handleLoadedMetadata}
                    >
                      <source src={m.media[0].url} />
                    </video>
                    <div
                      className="absolute bottom-2 left-2 bg-black/70 h-5 flex items-center justify-center px-2.5 rounded-[4px]"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <span className="text-xs leading-3 font-bold">GIF</span>
                    </div>
                    <Icons.multiFile className="h-5 w-5 fill-white absolute right-2 bottom-2" />
                  </Link>
                );
              } else {
                return (
                  <Link
                    href={postDetail}
                    key={m.id}
                    style={{
                      aspectRatio: 1 / 1,
                      position: "relative",
                    }}
                  >
                    <video
                      style={{ opacity: isLoading ? 0 : 100 }}
                      className="object-cover h-full w-full focus-visible:outline-none"
                      preload="metadata"
                      ref={videoRef}
                      onLoadedMetadata={handleLoadedMetadata}
                    >
                      <source src={m.media[0].url} />
                    </video>
                    <div
                      className="absolute bottom-2 left-2 bg-black/70 h-5 flex items-center justify-center px-2.5 rounded-[4px]"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <span className="text-xs leading-3 font-bold">GIF</span>
                    </div>
                  </Link>
                );
              }
            } else {
              const currentVideoIndex = videoIndex;
              videoIndex++;

              const isLoading = !videoDuration[currentVideoIndex];

              if (m.media.length > 1) {
                return (
                  <Link
                    href={postDetail}
                    key={m.id}
                    style={{
                      aspectRatio: 1 / 1,
                    }}
                    className="relative"
                  >
                    {isLoading && (
                      <div className="flex items-center justify-center h-full">
                        <span className="loader" />
                      </div>
                    )}
                    <video
                      style={{ opacity: isLoading ? 0 : 100 }}
                      className="object-cover h-full w-full focus-visible:outline-none"
                      preload="metadata"
                      ref={videoRef}
                      onLoadedMetadata={handleLoadedMetadata}
                    >
                      <source src={m.media[0].url} />
                    </video>
                    <Icons.multiFile className="h-5 w-5 fill-white absolute right-2 bottom-2" />
                    <div
                      style={{ opacity: isLoading ? 0 : 100 }}
                      className="h-fit px-2 leading-3 bg-black/70 rounded-[4px] absolute bottom-2 left-2"
                    >
                      <span className="text-sm">
                        {formatDuration(videoDuration[currentVideoIndex])}
                      </span>
                    </div>
                  </Link>
                );
              } else {
                return (
                  <Link
                    href={postDetail}
                    key={m.id}
                    style={{
                      aspectRatio: 1 / 1,
                    }}
                    className="relative"
                  >
                    {isLoading && (
                      <div className="flex items-center justify-center h-full">
                        <span className="loader" />
                      </div>
                    )}

                    <video
                      style={{ opacity: isLoading ? 0 : 100 }}
                      className="object-cover h-full w-full focus-visible:outline-none"
                      preload="metadata"
                      ref={videoRef}
                      onLoadedMetadata={handleLoadedMetadata}
                    >
                      <source src={m.media[0].url} />
                    </video>
                    <div
                      style={{ opacity: isLoading ? 0 : 100 }}
                      className="h-fit px-2 leading-3 bg-black/70 rounded-[4px] absolute bottom-2 left-2"
                    >
                      <span className="text-sm">
                        {formatDuration(videoDuration[currentVideoIndex])}
                      </span>
                    </div>
                  </Link>
                );
              }
            }
          })}
      </div>
    </InfiniteScrollContainer>
  );
};
export default ProfileMedia;
