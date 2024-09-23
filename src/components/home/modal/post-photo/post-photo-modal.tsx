"use client";

import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";
import { generateIdFromEntropySize, User } from "lucia";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";

import {
  cn,
  compress,
  updateProgress,
  getImageDimension,
  getVideoDimension,
} from "@/lib/utils";
import kyInstance from "@/lib/ky";
import PostSidebar from "./post-sidebar";
import PhotoCarousel from "./photo-carousel";
import useMediaURL from "@/hooks/useMediaURL";
import { CreateReplyPayload } from "@/lib/zod-schema";
import { useUploadMedia } from "@/hooks/useUploadMedia";
import { FileWithPreview, ForYouFeedPost, MediaType } from "@/types";
import LikeButton from "@/components/home/post/engagement-button/like/like-button";
import ViewButton from "@/components/home/post/engagement-button/view/view-button";
import ReplyButton from "@/components/home/post/engagement-button/reply/reply-button";
import ShareButton from "@/components/home/post/engagement-button/share/share-button";
import RepostButton from "@/components/home/post/engagement-button/repost/repost-button";

type Props = {
  photoNumber: number;
  post: ForYouFeedPost;
  loggedInUser: User;
};

const PostPhotoModal = ({ photoNumber, post, loggedInUser }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mediaQuery = useMediaQuery("(min-width: 950px)");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!mediaQuery) {
      setIsSidebarOpen(false);
      setIsMobile(true);
    } else {
      setIsSidebarOpen(true);
      setIsMobile(false);
    }
  }, [mediaQuery]);

  const { uploadFilesWithProgress, isUploading, overallProgress } =
    useUploadMedia();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputCount, setInputCount] = useState(0);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isPending, setIsPending] = useState(false);

  const { newMedia } = useMediaURL(post.post.postMedia);

  const queryKeyReplyCount = ["get-reply-count", post.post.postId];

  const { mutate: createReply } = useMutation({
    mutationKey: ["create-reply"],
    mutationFn: ({
      postType,
      content,
      media,
      parentPostId,
      rootPostId,
    }: CreateReplyPayload) =>
      kyInstance.post("/api/post/reply", {
        json: { postType, content, media, parentPostId, rootPostId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyReplyCount });
      setInputValue("");
      setInputCount(0);
      setFiles([]);
      setIsInputFocus(false);
      setIsPending(false);
    },
  });

  const handleMedia = () => {
    if (mediaRef.current) {
      if (!isInputFocus) {
        setIsInputFocus(true);
        return;
      }
      mediaRef.current.click();
    }
  };

  const handleRemove = (mediaId: string) => {
    setFiles((prev) => prev.filter((img) => img.meta.id !== mediaId));
  };

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      acceptedFiles.forEach(async (file) => {
        const fileType = file.type.split("/")[0] as "image" | "video";
        if (fileType == "image") {
          try {
            const compressResult = (await compress(
              file,
              0.8,
              2000,
              2000
            )) as Blob;
            const compressedFile = new File([compressResult], file.name, {
              type: compressResult.type,
              lastModified: file.lastModified,
            });
            const previewUrl = URL.createObjectURL(compressResult);
            const { height, width } = await getImageDimension(previewUrl);
            const fileWithPreview = {
              meta: {
                id: generateIdFromEntropySize(10),
                preview: previewUrl,
                dimension: { height, width },
              },
              file: Object.assign(compressedFile, {
                path: file.path,
              }) as File,
            };

            setFiles((prev) => [...(prev ?? []), fileWithPreview]);
          } catch (error) {
            console.log({ error });
          }
        }
        if (fileType === "video") {
          try {
            const previewUrl = URL.createObjectURL(file);
            const dimension = await getVideoDimension(previewUrl);
            const fileWithPreview = {
              meta: {
                id: generateIdFromEntropySize(10),
                preview: previewUrl,
                dimension: dimension,
              },
              file: file,
            };

            setFiles((prev) => [...(prev ?? []), fileWithPreview]);
          } catch (error) {
            console.log(error);
          }
        }
      });
    },
    [setFiles]
  );

  const { getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    multiple: true,
  });

  useEffect(() => {
    updateProgress(inputCount);
  }, [inputCount]);

  const closeHandler = () => {
    setIsOpen(false);
    router.back();
  };

  const submitHandler = async () => {
    const media: MediaType[] = [];
    setIsPending(true);

    if (files.length > 0) {
      try {
        const imgURLs = await uploadFilesWithProgress(files);

        if (imgURLs && imgURLs.length === files.length) {
          files.forEach((file, i) => {
            const { dimension } = file.meta;
            if (dimension) {
              const { height, width } = dimension;
              media.push({
                url: imgURLs[i],
                dimension: { height, width },
                type: file.file.type,
              });
            }
          });
        }
      } catch (error) {
        setIsPending(false);
        console.error("Error uploading files:", error);
        return;
      }
    }

    try {
      const payload: CreateReplyPayload = {
        content: inputValue.trim(),
        postType: "reply",
        parentPostId: post.post.postId,
        rootPostId: post.post.postRootPostId,
        ...(media.length > 0 && { media: JSON.stringify(media) }),
      };
      createReply(payload);
    } catch (error) {
      console.error("Error creating post:", error);
      setIsPending(false);
    }
  };

  const isButtonDisabled = inputValue.length > 0 || files.length > 0;
  const isPosting = isPending || isUploading;

  return (
    <Dialog open={isOpen} onClose={closeHandler} className="relative z-50">
      <DialogBackdrop
        className={cn("fixed inset-0", isMobile ? "bg-black" : "bg-black/90")}
      />
      <div className="fixed inset-0 flex w-screen h-screen items-center justify-center">
        <DialogPanel className="w-screen h-screen">
          <div className="flex justify-between items-start h-full w-full">
            <div
              className="flex h-full w-full flex-col relative"
              onClick={(e) => {
                if (isMobile) return;
                closeHandler();
                e.stopPropagation();
              }}
            >
              <PhotoCarousel
                isSidebarOpen={isSidebarOpen}
                onClose={closeHandler}
                setIsSidebarOpen={setIsSidebarOpen}
                photos={newMedia}
                isMobile={isMobile}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/90 w-full h-12 flex items-center justify-center">
                <div className="flex items-center justify-between h-full px-4 max-w-[600px] w-full">
                  <ReplyButton
                    loggedInUser={loggedInUser}
                    post={{
                      id: post.post.postId,
                      content: post.post.postContent,
                      createdAt: post.post.postCreatedAt,
                      rootPostId: post.post.postRootPostId,
                      replyCount: post.replyCount,
                    }}
                    user={{
                      name: post.post.name,
                      username: post.post.username,
                      photo: post.post.photo,
                    }}
                    initialReplyCount={post.replyCount}
                    size="md"
                  />
                  <RepostButton
                    postId={post.post.postId}
                    loggedInUser={loggedInUser}
                    size="md"
                    originalPost={{
                      userId: post.post.postId,
                      content: post.post.postContent,
                      createdAt: post.post.postCreatedAt,
                      photo: post.post.photo,
                      username: post.post.username,
                      media: post.post.postMedia,
                      name: post.post.name,
                    }}
                    initialRepost={{
                      repostCount: post.repost ? post.repost.length : 0,
                      isRepostedByUser: post.repost
                        ? post.repost.some(
                            (r) => r.userOriginId === loggedInUser.id
                          )
                        : false,
                    }}
                    initialQuote={{
                      quoteCount: post.quote ? post.quote.length : 0,
                      isQuotedByUser: post.quote
                        ? post.quote.some(
                            (q) => q.userOriginId === loggedInUser.id
                          )
                        : false,
                    }}
                  />
                  <LikeButton
                    postId={post.post.postId}
                    initialLike={{
                      likeCount: post.like ? post.like.length : 0,
                      isLikedByUser: post.like
                        ? post.like.some(
                            (l) => l.userOriginId === loggedInUser.id
                          )
                        : false,
                    }}
                    size="md"
                  />
                  <ViewButton size="md" />
                  <ShareButton size="md" />
                </div>
              </div>
            </div>
            {isSidebarOpen && (
              <PostSidebar
                post={post}
                files={files}
                inputRef={inputRef}
                mediaRef={mediaRef}
                isPosting={isPosting}
                inputValue={inputValue}
                handleMedia={handleMedia}
                photo={loggedInUser.photo}
                isInputFocus={isInputFocus}
                loggedInUser={loggedInUser}
                handleRemove={handleRemove}
                setInputValue={setInputValue}
                setInputCount={setInputCount}
                submitHandler={submitHandler}
                getInputProps={getInputProps}
                setIsInputFocus={setIsInputFocus}
                isButtonDisabled={isButtonDisabled}
              />
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default PostPhotoModal;
