"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import Icons from "../icons";
import kyInstance from "@/lib/ky";
import { formatDuration } from "@/lib/utils";
import { MediaType, ProfilePostMedia } from "@/types";
import InfiniteScrollContainer from "../infinite-scroll-container";

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
        <span className="loader" />
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
          media.map((m) => {
            const parsedMedia: MediaType[] = JSON.parse(m.media);
            const fileType = parsedMedia[0].type.split("/")[0] as
              | "image"
              | "video";

            const postURL = `/${username}/status/${m.id}/${
              fileType === "image" ? "photo" : fileType
            }/1`;

            if (fileType === "image") {
              if (parsedMedia.length > 1) {
                return (
                  <Link
                    href={postURL}
                    key={m.id}
                    style={{
                      aspectRatio: 1 / 1,
                    }}
                    className="relative"
                  >
                    <img
                      src={`https://wsrv.nl/?url=${
                        parsedMedia[0].url
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
                    href={postURL}
                    key={m.id}
                    style={{
                      aspectRatio: 1 / 1,
                    }}
                  >
                    <img
                      src={`https://wsrv.nl/?url=${
                        parsedMedia[0].url
                      }&w=${500}&output=jpeg`}
                      alt="img"
                      className="h-full w-full object-cover"
                    />
                  </Link>
                );
              }
            } else {
              const currentVideoIndex = videoIndex;
              videoIndex++;

              const isLoading = !videoDuration[currentVideoIndex];

              if (parsedMedia.length > 1) {
                return (
                  <Link
                    href={postURL}
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
                      <source src={parsedMedia[0].url} />
                    </video>
                    <Icons.multiFile className="h-5 w-5 fill-white absolute right-2 bottom-2" />
                    <div
                      style={{ opacity: isLoading ? 0 : 100 }}
                      className="h-fit px-2 leading-3 bg-black/70 rounded-md absolute bottom-2 left-2"
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
                    href={postURL}
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
                      <source src={parsedMedia[0].url} />
                    </video>
                    <div
                      style={{ opacity: isLoading ? 0 : 100 }}
                      className="h-fit px-2 leading-3 bg-black/70 rounded-md absolute bottom-2 left-2"
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
