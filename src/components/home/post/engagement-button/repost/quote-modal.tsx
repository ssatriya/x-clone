"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Image from "next/image";
import TextareaAutosize from "react-textarea-autosize";
import { AnimatePresence, motion } from "framer-motion";
import { generateIdFromEntropySize, User } from "lucia";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";

import {
  Media,
  QuoteInfo,
  MediaFormat,
  RepostInfo,
  FileWithPreview,
  OptionButtonConfig,
} from "@/types";
import {
  compress,
  updateProgress,
  getImageDimension,
  getVideoDimension,
} from "@/lib/utils";
import kyInstance from "@/lib/ky";
import Icons from "@/components/icons";
import Divider from "@/components/ui/divider";
import Button from "@/components/ui/button";
import Progressbar from "@/components/progressbar";
import { useUploadMedia } from "@/hooks/useUploadMedia";
import MediaPreview from "@/components/home/input/media-preview";
import InputOptions from "@/components/home/input/input-options";
import ProgressCircle from "@/components/home/input/progress-circle";
import { CreateQuotePayload, CreateRepostPayload } from "@/lib/zod-schema";
import QuotePreview from "@/components/home/post/quote-preview/quote-preview";
import CompactQuotePreview from "@/components/home/post/quote-preview/compact-post-preview";

type Props = {
  postId: string;
  isOpen: boolean;
  loggedInUser: User;
  setMove: Dispatch<SetStateAction<number>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  originalPost: {
    userId: string;
    media: Media[];
    photo: string | null;
    username: string;
    name: string;
    createdAt: Date;
    content: string | null;
  };
};

const QuoteModal = ({
  loggedInUser,
  postId,
  setMove,
  isOpen,
  setIsOpen,
  originalPost,
}: Props) => {
  const queryClient = useQueryClient();
  const { startUpload, uploadingFiles } = useUploadMedia();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

  const [inputCount, setInputCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const repostQueryKey = ["get-repost", postId];

  const { mutate: repost } = useMutation({
    mutationKey: ["create-repost"],
    mutationFn: (payload: CreateRepostPayload) =>
      kyInstance.patch("/api/post/repost", {
        json: payload,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: repostQueryKey });
      const previousRepost =
        queryClient.getQueryData<RepostInfo>(repostQueryKey);

      const newCount =
        (previousRepost?.repostCount || 0) +
        (previousRepost?.isRepostedByUser ? -1 : 1);

      queryClient.setQueryData<RepostInfo>(repostQueryKey, {
        repostCount: newCount,
        isRepostedByUser: !previousRepost?.isRepostedByUser,
      });

      if (previousRepost) {
        if (newCount > previousRepost.repostCount) {
          setMove(25);
        } else {
          setMove(-25);
        }
      }

      return { previousRepost };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<RepostInfo>(
        repostQueryKey,
        context?.previousRepost
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: repostQueryKey });
    },
    onSuccess: () => {
      setIsOpen(false);
      setIsPending(false);
    },
  });

  const quoteQueryKey = ["get-quote", postId];

  const { mutate: quoteMutate } = useMutation({
    mutationKey: ["create-quote"],
    mutationFn: (payload: CreateQuotePayload) =>
      kyInstance.post("/api/post/quote", {
        json: payload,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: quoteQueryKey });
      const previousRepost = queryClient.getQueryData<QuoteInfo>(quoteQueryKey);

      const newCount =
        (previousRepost?.quoteCount || 0) +
        (previousRepost?.isQuotedByUser ? -1 : 1);

      queryClient.setQueryData<QuoteInfo>(quoteQueryKey, {
        quoteCount: newCount,
        isQuotedByUser: !previousRepost?.isQuotedByUser,
      });

      if (previousRepost) {
        if (newCount > previousRepost.quoteCount) {
          setMove(25);
        } else {
          setMove(-25);
        }
      }

      return { previousRepost };
    },
    onSuccess: () => {
      setFiles([]);
      setInputCount(0);
      setIsOpen(false);
      setInputValue("");
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
        const fileType = file.type.split("/")[1] as MediaFormat;
        if (fileType == "png" || fileType == "jpeg" || fileType == "jpg") {
          try {
            const compressResult = (await compress(
              file,
              0.7,
              2000,
              2000
            )) as Blob;
            const compressedFile = new File([compressResult], file.name, {
              type: compressResult.type,
              lastModified: file.lastModified,
            });
            const previewUrl = URL.createObjectURL(compressResult);
            const { height, width } = await getImageDimension(previewUrl);
            const fileWithPreview: FileWithPreview = {
              meta: {
                id: generateIdFromEntropySize(10),
                preview: previewUrl,
                dimension: { height, width },
                format: fileType,
              },
              file: Object.assign(compressedFile, {
                path: file.path,
              }) as File,
            };

            setFiles((prev) => [...(prev ?? []), fileWithPreview]);
            startUpload(fileWithPreview);
          } catch (error) {
            console.log({ error });
          }
        }
        if (fileType === "gif") {
          try {
            const previewUrl = URL.createObjectURL(file);
            const dimension = await getImageDimension(previewUrl);

            const fileWithPreview: FileWithPreview = {
              meta: {
                id: generateIdFromEntropySize(10),
                preview: previewUrl,
                dimension: dimension,
                format: fileType,
              },
              file: file,
            };
            setFiles((prev) => [...(prev ?? []), fileWithPreview]);
            await startUpload(fileWithPreview);
          } catch (error) {
            console.error(error);
          }
        }
        if (fileType == "mp4") {
          try {
            const previewUrl = URL.createObjectURL(file);
            const dimension = await getVideoDimension(previewUrl);
            const fileWithPreview: FileWithPreview = {
              meta: {
                id: generateIdFromEntropySize(10),
                preview: previewUrl,
                dimension: dimension,
                format: fileType,
              },
              file: file,
            };

            setFiles((prev) => [...(prev ?? []), fileWithPreview]);
            startUpload(fileWithPreview);
          } catch (error) {
            console.log(error);
          }
        }
      });
    },
    [setFiles, startUpload]
  );

  const { getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    multiple: true,
  });

  const submitHandler = async () => {
    setIsPending(true);

    if (files.length > 0) {
      const payload: CreateQuotePayload = {
        content: inputValue.trim(),
        postType: "quote",
        quoteTargetId: postId,
        mediaId: files.map((file) => file.meta.id),
      };
      quoteMutate(payload);
    } else {
      repostHandler();
    }
  };

  const repostHandler = () => {
    setTimeout(() => {
      repost({ repostTargetId: postId, postType: "repost" });
    }, 200);
  };

  useEffect(() => {
    updateProgress(inputCount);
  }, [inputCount]);

  const isPosting = isPending;

  const optionButtonConfigs: OptionButtonConfig[] = [
    {
      ariaLabel: "Media",
      icon: Icons.media,
      onClick: handleMedia,
    },
    {
      ariaLabel: "GIF",
      icon: Icons.gif,
    },
    {
      ariaLabel: "Poll",
      icon: Icons.poll,
    },
    {
      ariaLabel: "Emoji",
      icon: Icons.emoji,
    },
    {
      ariaLabel: "Schedule",
      icon: Icons.schedule,
    },
    {
      ariaLabel: "Tag Location",
      icon: Icons.tagLocation,
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black sm-plus:bg-backdrop" />
      <div className="fixed inset-0 flex items-start justify-center w-screen top-0 sm-plus:top-12">
        <DialogPanel className="bg-black overflow-clip max-sm:h-full max-w-[600px] w-full h-fit sm-plus:max-h-[680px] sm-plus:rounded-2xl rounded-none relative flex flex-col">
          <DialogTitle className="font-bold h-[53px] flex-shrink-0 flex items-center px-4 sticky top-0 z-20 sm-plus:rounded-2xl rounded-none bg-black/60">
            {/* {isPending && (
              <Progressbar
                isPending={isPending}
                overallProgress={overallProgress}
                hasFiles={files.length > 0}
                classNames="absolute right-0 top-0 z-50"
              />
            )} */}
            <div className="flex justify-between w-full">
              <Button
                onClick={() => setIsOpen(false)}
                size="icon"
                variant="ghost"
                className="hover:bg-hover h-[34px] w-[34px] rounded-full bg-transparent -ml-2"
              >
                <Icons.close className="w-5 h-5 fill-secondary" />
              </Button>
              <div className="flex gap-3">
                <Button
                  size="default"
                  variant="ghost"
                  className="px-4 text-sm font-bold leading-4 bg-transparent rounded-full hover:bg-primary/10 text-primary"
                >
                  Drafts
                </Button>
                <Button
                  onClick={submitHandler}
                  type="submit"
                  size="default"
                  className="px-4 min-w-0 text-[15px] font-bold leading-5 text-white rounded-full hover:bg-primary/90 w-fit bg-primary inline-block sm-plus:hidden"
                >
                  Reply
                </Button>
              </div>
            </div>
          </DialogTitle>
          <div className="flex-grow overflow-y-auto h-fit">
            <div className="flex flex-col w-full gap-1 px-4">
              <div className="flex h-full">
                <div className="h-full pt-3 mr-2">
                  <div className="w-10 h-10">
                    <Image
                      src={loggedInUser.photo}
                      alt={`${loggedInUser.username} avatar`}
                      width={40}
                      height={40}
                      priority
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col w-full pt-2">
                  <div className="py-3 max-w-[515px] ml-[1px]">
                    <TextareaAutosize
                      ref={inputRef}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setInputCount(e.target.value.length);
                      }}
                      value={inputValue}
                      onFocus={() => setIsInputFocus(true)}
                      placeholder="Add comment"
                      className="w-full min-w-0 text-xl leading-6 outline-none resize-none bg-inherit placeholder:text-muted-foreground"
                      maxRows={25}
                      minRows={1}
                      autoFocus
                    />
                  </div>
                  <MediaPreview
                    files={files}
                    isPosting={isPosting}
                    handleRemove={handleRemove}
                    uploadingFiles={{}}
                  />
                  {files.length > 0 && (
                    <CompactQuotePreview
                      post={{
                        postId: postId,
                        content: originalPost.content,
                        media: originalPost.media,
                        createdAt: originalPost.createdAt,
                      }}
                      user={{
                        userId: originalPost.userId,
                        name: originalPost.name,
                        username: originalPost.username,
                        photo: originalPost.photo,
                      }}
                    />
                  )}
                  {files.length === 0 && (
                    <QuotePreview
                      post={{
                        id: postId,
                        content: originalPost.content,
                        media: originalPost.media,
                        createdAt: originalPost.createdAt,
                        nestedPostId: null,
                      }}
                      user={{
                        id: originalPost.userId,
                        name: originalPost.name,
                        username: originalPost.username,
                        photo: originalPost.photo,
                        nestedUsername: null,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 left-0 right-0 px-4 pt-1 pb-2 bg-black rounded-none sm-plus:rounded-b-2xl">
            {!isPosting && (
              <Button
                aria-label="Everyone can reply"
                variant="ghost"
                className="flex items-center h-6 min-w-0 gap-1 px-3 mb-3 -ml-3 bg-transparent rounded-full w-fit hover:bg-primary/10"
              >
                <Icons.globe className="w-4 h-4 fill-primary" />
                <p className="text-sm font-bold leading-4 text-primary">
                  Everyone can reply
                </p>
              </Button>
            )}
            {!isPosting && (
              <Divider
                orientation="horizontal"
                className="bg-border h-[1px] -ml-2 w-full"
              />
            )}
            <AnimatePresence>
              {!isPosting && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between w-full"
                >
                  <input
                    {...getInputProps()}
                    ref={mediaRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/gif, image/jpeg, image/jpg, video/mp4"
                    multiple
                  />
                  <InputOptions
                    containerClassNames="flex items-center -ml-2 py-[3px] mt-2"
                    buttons={optionButtonConfigs}
                  />
                  <div className="flex items-center h-full gap-2">
                    {inputCount > 0 && (
                      <div className="flex items-center justify-center">
                        <ProgressCircle inputCount={inputCount} />
                        <div className="h-[31px]">
                          <Divider
                            orientation="vertical"
                            className="mr-3 w-[1px] bg-border ml-[10px]"
                          />
                        </div>
                        <div
                          role="button"
                          className="flex items-center justify-center w-6 h-6 border rounded-full border-gray hover:bg-blue/10"
                        >
                          <Icons.add className="w-4 h-4 fill-primary" />
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={submitHandler}
                      type="submit"
                      className="px-4 min-w-0 h-9 text-[15px] font-bold leading-5 text-white rounded-full hover:bg-primary/90 w-fit bg-primary hidden sm-plus:inline-block"
                    >
                      Post
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default QuoteModal;
