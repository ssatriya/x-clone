"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { AnimatePresence, motion } from "framer-motion";
import { generateIdFromEntropySize, User } from "lucia";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";

import { MediaFormat, FileWithPreview, OptionButtonConfig } from "@/types";
import {
  compress,
  updateProgress,
  getImageDimension,
  getVideoDimension,
} from "@/lib/utils";
import kyInstance from "@/lib/ky";
import Icons from "@/components/icons";
import InputOptions from "./input-options";
import Button from "@/components/ui/button";
import Divider from "@/components/ui/divider";
import ProgressCircle from "./progress-circle";
import Progressbar from "@/components/progressbar";
import { CreatePostPayload } from "@/lib/zod-schema";
import { useUploadMedia } from "@/hooks/useUploadMedia";
import ButtonTooltip from "@/components/button-tooltip";
import MediaPreviewSlider from "./media-preview-slider";

type Props = {
  loggedInUser: User;
};

const PostInput = ({ loggedInUser }: Props) => {
  const queryClient = useQueryClient();
  const { startUpload, uploadingFiles } = useUploadMedia();

  const mediaRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [inputCount, setInputCount] = useState(0);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isPending, setIsPending] = useState(false);

  const { mutate: createPost } = useMutation({
    mutationKey: ["create-post"],
    mutationFn: (payload: CreatePostPayload) =>
      kyInstance.post("/api/post", { json: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["for-you-feed"] });
      queryClient.invalidateQueries({ queryKey: ["following-feed"] });
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
            if (error) {
              toast.error("Failed to upload GIF, try again later.", {
                position: "bottom-center",
              });
              console.error(error);
            }
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

    const payload: CreatePostPayload = {
      content: inputValue.trim(),
      postType: "post",
      mediaId: files.map((file) => file.meta.id),
    };
    createPost(payload);
  };

  useEffect(() => {
    if (!files) return;
    files.map((file) => {
      return () => {
        if (file) {
          URL.revokeObjectURL(file.meta.preview);
        }
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateProgress(inputCount);
  }, [inputCount]);

  const isButtonDisabled = inputValue.length > 0 || files.length > 0;

  const optionButtonConfigs: OptionButtonConfig[] = [
    {
      ariaLabel: "Media",
      icon: Icons.media,
      onClick: handleMedia,
      disabled: files.length >= 4,
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
    <div
      className="relative w-full pt-1 border-b"
      onClick={(e) => {
        const et = e.target as HTMLDivElement;
        const postButton = et.children[0] as HTMLButtonElement;
        if (inputCount > 0) return;
        if (postButton?.dataset.button === "post-button") {
          e.stopPropagation();
          return;
        }
        inputRef.current?.focus();
      }}
    >
      {isPending && (
        <Progressbar classNames="absolute -top-[5px] right-0 z-30 w-full h-1" />
      )}
      {isPending && (
        <div className="absolute inset-0 z-40 bg-black/60 right-[1px] top-[1px]" />
      )}
      <div className="relative flex gap-2 justify-between px-4 pb-2">
        <div className="pt-3 h-fit relative">
          <Link
            href={`/${loggedInUser.username.slice(1)}`}
            aria-label={loggedInUser.name}
            className="h-11 w-11 flex items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            <Image
              src={loggedInUser.photo}
              alt={loggedInUser.username}
              height={40}
              width={40}
              className="rounded-full"
              priority
            />
          </Link>
        </div>
        <div className="flex flex-col w-full">
          <div className="w-full pt-2">
            <div className="py-3 text-pretty max-w-[515px]">
              <TextareaAutosize
                ref={inputRef}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setInputCount(e.target.value.length);
                }}
                value={inputValue}
                onFocus={() => setIsInputFocus(true)}
                placeholder="What is happening?!"
                className="w-full min-w-0 outline-none resize-none bg-inherit placeholder:text-muted-foreground text-xl leading-6 h-6"
                maxRows={25}
                minRows={1}
              />
            </div>
            <MediaPreviewSlider
              files={files}
              isPosting={isPending}
              handleRemove={handleRemove}
              uploadingFiles={uploadingFiles}
            />
          </div>
          {isInputFocus && !isPending && (
            <div className="relative -ml-3">
              <div className="flex flex-col pb-3">
                <Button
                  variant="ghost"
                  className="overflow-y-hidden px-3 h-6 w-fit hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Icons.globe className="w-4 h-4 fill-primary mr-1" />
                  <p className="text-sm font-bold leading-4 text-primary">
                    Everyone can reply
                  </p>
                </Button>
              </div>
              <Divider
                orientation="horizontal"
                className="bg-border h-[1px] mb-2"
              />
            </div>
          )}
          <AnimatePresence initial={false}>
            {!isPending && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between"
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
                  containerClassNames="flex items-center -ml-2 py-[3px]"
                  buttons={optionButtonConfigs}
                />
                <div className="flex items-center h-full gap-3 overflow-hidden">
                  {inputCount > 0 && (
                    <div className="flex items-center justify-center">
                      <ProgressCircle inputCount={inputCount} />
                      <div className="h-[31px]">
                        <Divider
                          orientation="vertical"
                          className="w-[1px] bg-border mr-3 ml-[10px]"
                        />
                      </div>
                      <ButtonTooltip content="Add">
                        <Button
                          aria-label="Add"
                          variant="ghost"
                          size="icon"
                          className="flex items-center justify-center w-6 h-6 border border-borderCircle hover:bg-blue/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <Icons.add className="w-4 h-4 fill-primary" />
                        </Button>
                      </ButtonTooltip>
                    </div>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    aria-label="Post"
                    disabled={!isButtonDisabled}
                    onClick={submitHandler}
                    data-button="post-button"
                    type="submit"
                    className="font-bold text-[15px] px-4"
                  >
                    Post
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PostInput;
