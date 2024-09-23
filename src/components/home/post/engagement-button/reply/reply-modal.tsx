"use client";

import {
  useRef,
  useState,
  Dispatch,
  useEffect,
  useCallback,
  SetStateAction,
} from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import Image from "next/image";
import TextareaAutosize from "react-textarea-autosize";
import { generateIdFromEntropySize, User } from "lucia";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";

import {
  cn,
  compress,
  updateProgress,
  getImageDimension,
  getVideoDimension,
} from "@/lib/utils";
import kyInstance from "@/lib/ky";
import Icons from "@/components/icons";
import ReplyTarget from "./reply-target";
import Divider from "@/components/ui/divider";
import Button from "@/components/ui/button";
import Progressbar from "@/components/progressbar";
import { CreateReplyPayload } from "@/lib/zod-schema";
import { useUploadMedia } from "@/hooks/useUploadMedia";
import useCurrentFocusPost from "@/hooks/useCurrentFocusPost";
import InputOptions from "@/components/home/input/input-options";
import MediaPreview from "@/components/home/input/media-preview";
import ProgressCircle from "@/components/home/input/progress-circle";
import { FileWithPreview, MediaType, OptionButtonConfig } from "@/types";

type Props = {
  loggedInUser: User;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  post: {
    id: string;
    content: string | null;
    createdAt: Date;
    rootPostId: string;
  };
  user: {
    name: string;
    username: string;
    photo: string | null;
  };
};

const ReplyModal = ({ loggedInUser, setIsOpen, isOpen, post, user }: Props) => {
  const queryClient = useQueryClient();
  const { uploadFilesWithProgress, isUploading, overallProgress } =
    useUploadMedia();

  const mediaRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [inputCount, setInputCount] = useState(0);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isPending, setIsPending] = useState(false);

  const { focusPostId } = useCurrentFocusPost();

  const queryKeyReplyCount = ["get-reply-count", post.id];
  const queryKeyDescendantsReply = ["get-descendants-reply", focusPostId];

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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeyReplyCount });
      queryClient.invalidateQueries({
        queryKey: queryKeyDescendantsReply,
      });
      setFiles([]);
      setInputCount(0);
      setIsOpen(false);
      setInputValue("");
      setIsPending(false);
      setIsInputFocus(false);
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
        parentPostId: post.id,
        rootPostId: post.rootPostId,
        ...(media.length > 0 && { media: JSON.stringify(media) }),
      };
      createReply(payload);
    } catch (error) {
      console.error("Error creating post:", error);
      setIsPending(false);
    }
  };

  useEffect(() => {
    updateProgress(inputCount);
  }, [inputCount]);

  const isButtonDisabled = inputValue.length > 0 || files.length > 0;
  const isPosting = isPending || isUploading;

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
            {isPosting && (
              <Progressbar
                isPending={isPosting}
                overallProgress={overallProgress}
                hasFiles={files.length > 0}
                classNames="absolute right-0 top-0 z-50"
              />
            )}
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
                  disabled={!isButtonDisabled}
                  onClick={submitHandler}
                  type="submit"
                  size="default"
                  className="px-4 min-w-0 text-[15px] font-bold leading-5 text-white rounded-full hover:bg-primary/90 w-fit bg-primary  inline-block sm-plus:hidden"
                >
                  Reply
                </Button>
              </div>
            </div>
          </DialogTitle>
          <div className="flex-grow overflow-y-auto h-fit">
            <div className="px-4 pt-4">
              <ReplyTarget
                content={post.content}
                name={user.name}
                photo={user.photo}
                username={user.username}
                createdAt={post.createdAt}
              />
              <div className="relative flex flex-col w-full gap-1">
                {isPosting && (
                  <div className="absolute inset-0 z-40 bg-black/60 right-[1px] top-[1px]" />
                )}
                <div className="flex h-full gap-2">
                  <div className="h-full pt-3">
                    <div className="w-10 h-10">
                      <Image
                        src={loggedInUser.photo}
                        alt={`${loggedInUser.username} avatar`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full pt-2">
                    <div className="text-pretty max-w-[515px] ml-[1px]">
                      <motion.div
                        className={cn(
                          "text-pretty max-w-[515px]",
                          files.length > 0 ? "h-auto" : "h-24"
                        )}
                        initial={false}
                        transition={{ duration: 0.3 }}
                        onClick={() => inputRef.current?.focus()}
                      >
                        <TextareaAutosize
                          ref={inputRef}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            setInputCount(e.target.value.length);
                          }}
                          value={inputValue}
                          onFocus={() => setIsInputFocus(true)}
                          placeholder="Post your reply"
                          className="w-full min-w-0 py-3 text-xl leading-6 outline-none resize-none bg-inherit placeholder:text-muted-foreground"
                          maxRows={25}
                          minRows={1}
                          autoFocus={true}
                        />
                      </motion.div>
                      <MediaPreview
                        files={files}
                        isPosting={isPosting}
                        handleRemove={handleRemove}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 left-0 right-0 px-4 pt-1 pb-2 bg-black rounded-none sm-plus:rounded-b-2xl">
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
                  <InputOptions buttons={optionButtonConfigs} />
                  <div className="flex items-center h-full gap-2">
                    {inputCount > 0 && (
                      <div className="flex items-center justify-center">
                        <ProgressCircle inputCount={inputCount} />
                        <div className="h-[31px]">
                          <Divider
                            orientation="vertical"
                            className="w-[1px] bg-border mr-3 ml-[10px]"
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
                      disabled={!isButtonDisabled}
                      onClick={submitHandler}
                      type="submit"
                      className="px-4 min-w-0 h-9 text-[15px] font-bold leading-5 text-white rounded-full hover:bg-primary/90 w-fit bg-primary hidden sm-plus:inline-block"
                    >
                      Reply
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

export default ReplyModal;
