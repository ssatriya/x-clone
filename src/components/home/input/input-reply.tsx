"use client";

import Image from "next/image";
import { RefObject, SetStateAction } from "react";
import { DropzoneInputProps } from "react-dropzone";
import TextareaAutosize from "react-textarea-autosize";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import InputOptions from "./input-options";
import Button from "@/components/ui/button";
import MediaPreviewSlider from "./media-preview-slider";
import { FileWithPreview, OptionButtonConfig } from "@/types";

type Props = {
  photo: string;
  username: string;
  inputValue: string;
  isPosting: boolean;
  classNames?: string;
  isInputFocus: boolean;
  handleMedia: () => void;
  files: FileWithPreview[];
  isButtonDisabled: boolean;
  submitHandler: () => Promise<void>;
  mediaRef: RefObject<HTMLInputElement>;
  handleRemove: (mediaId: string) => void;
  inputRef: RefObject<HTMLTextAreaElement>;
  uploadingFiles: { [id: string]: boolean };
  setInputValue: (value: SetStateAction<string>) => void;
  setInputCount: (value: SetStateAction<number>) => void;
  setIsInputFocus: (value: SetStateAction<boolean>) => void;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
};

const InputReply = ({
  files,
  photo,
  username,
  inputRef,
  mediaRef,
  isPosting,
  inputValue,
  classNames,
  handleMedia,
  handleRemove,
  isInputFocus,
  setInputValue,
  setInputCount,
  getInputProps,
  submitHandler,
  uploadingFiles,
  setIsInputFocus,
  isButtonDisabled,
}: Props) => {
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
      ariaLabel: "Emoji",
      icon: Icons.emoji,
    },
    {
      ariaLabel: "Tag Location",
      icon: Icons.tagLocation,
    },
  ];

  return (
    <div className={cn(classNames, "flex flex-col justify-center w-full py-3")}>
      {isInputFocus && (
        <div className="flex gap-2 w-full">
          <div className="w-10" />
          <span className="text-gray text-[15px]">
            Replying to <span className="text-primary">{username}</span>
          </span>
        </div>
      )}
      <div className="relative">
        {isPosting && (
          <div className="absolute inset-0 z-40 bg-black/60 right-0 top-0" />
        )}
        <div className="flex items-center w-full">
          <div className="flex gap-2 items-center w-full">
            <div className="h-10 w-10 flex-shrink-0">
              <Image
                src={photo}
                height={40}
                width={40}
                priority
                alt="avatar"
                className="rounded-full"
              />
            </div>
            <TextareaAutosize
              ref={inputRef}
              onChange={(e) => {
                setInputValue(e.target.value);
                setInputCount(e.target.value.length);
              }}
              value={inputValue}
              onFocus={() => setIsInputFocus(true)}
              placeholder="Post you reply"
              className="w-full min-w-0 outline-none resize-none bg-inherit placeholder:text-muted-foreground text-xl leading-6 py-3"
              maxRows={25}
              minRows={1}
            />
          </div>
          {!isPosting && (
            <Button
              onClick={submitHandler}
              disabled={!isButtonDisabled}
              size="sm"
              className={cn(
                "text-[15px] leading-4 font-bold",
                isInputFocus && "absolute bottom-2 right-0"
              )}
            >
              Reply
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="w-10 flex-shrink-0 h-auto" />
          <MediaPreviewSlider
            files={files}
            handleRemove={handleRemove}
            isPosting={isPosting}
            uploadingFiles={uploadingFiles}
          />
        </div>
        <AnimatePresence initial={false}>
          {isInputFocus && !isPosting && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2 w-full"
            >
              <div className="w-10" />
              <input
                {...getInputProps()}
                multiple
                type="file"
                className="hidden"
                ref={mediaRef}
              />
              <InputOptions
                containerClassNames="flex -ml-[10px] py-2"
                buttons={optionButtonConfigs}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* --------- */}
    </div>
  );
};

export default InputReply;
