"use client";

import Image from "next/image";
import { RefObject, SetStateAction } from "react";
import { DropzoneInputProps } from "react-dropzone";
import TextareaAutosize from "react-textarea-autosize";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import { FileWithPreview } from "@/types";
import MediaPreview from "./media-preview";
import Button from "@/components/ui/button";
import ButtonTooltip from "@/components/button-tooltip";

type Props = {
  classNames?: string;
  isInputFocus: boolean;
  isPosting: boolean;
  username: string;
  photo: string;
  inputRef: RefObject<HTMLTextAreaElement>;
  mediaRef: RefObject<HTMLInputElement>;
  inputValue: string;
  setIsInputFocus: (value: SetStateAction<boolean>) => void;
  setInputValue: (value: SetStateAction<string>) => void;
  setInputCount: (value: SetStateAction<number>) => void;
  isButtonDisabled: boolean;
  submitHandler: () => Promise<void>;
  files: FileWithPreview[];
  handleRemove: (mediaId: string) => void;
  handleMedia: () => void;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
};

const InputReply = ({
  classNames,
  isInputFocus,
  isPosting,
  username,
  photo,
  inputRef,
  mediaRef,
  inputValue,
  setIsInputFocus,
  setInputValue,
  setInputCount,
  isButtonDisabled,
  submitHandler,
  files,
  handleRemove,
  handleMedia,
  getInputProps,
}: Props) => {
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
          <MediaPreview
            files={files}
            handleRemove={handleRemove}
            isPosting={isPosting}
          />
        </div>
        <AnimatePresence initial={false}>
          {isInputFocus && !isPosting && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2 w-full overflow-hidden"
            >
              <div className="w-10" />
              <input
                {...getInputProps()}
                multiple
                type="file"
                className="hidden"
                ref={mediaRef}
              />
              <div className="flex -ml-[10px] py-2">
                <ButtonTooltip content="Media">
                  <Button
                    onClick={handleMedia}
                    aria-label="Media"
                    size="icon"
                    variant="ghost"
                    className="w-[34px] h-[34px] hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Icons.media className="fill-primary w-5 h-5" />
                  </Button>
                </ButtonTooltip>
                <ButtonTooltip content="GIF">
                  <Button
                    aria-label="GIF"
                    size="icon"
                    variant="ghost"
                    className="w-[34px] h-[34px] hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Icons.gif className="fill-primary w-5 h-5" />
                  </Button>
                </ButtonTooltip>
                <ButtonTooltip content="Emoji">
                  <Button
                    aria-label="Emoji"
                    size="icon"
                    variant="ghost"
                    className="w-[34px] h-[34px] hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Icons.emoji className="fill-primary w-5 h-5" />
                  </Button>
                </ButtonTooltip>
                <ButtonTooltip content="Tag Location">
                  <Button
                    aria-label="Tag Location"
                    size="icon"
                    variant="ghost"
                    className="w-[34px] h-[34px] hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Icons.tagLocation className="fill-primary w-5 h-5" />
                  </Button>
                </ButtonTooltip>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* --------- */}
    </div>
  );
};

export default InputReply;
